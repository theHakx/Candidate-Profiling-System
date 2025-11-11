import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import Modal from '../../../components/Modal/Modal';
import './AdminDashboard.scss';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // To hold the master list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // --- Filter State ---
  const initialFilters = {
    firstName: '',
    surname: '',
    email: '',
    role: '',
  };
  const [filters, setFilters] = useState(initialFilters);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    let filteredData = [...allUsers];
    // This is a simplified filter for the basic user table
    if (filters.firstName) filteredData = filteredData.filter(u => u.firstName?.toLowerCase().includes(filters.firstName.toLowerCase()));
    if (filters.surname) filteredData = filteredData.filter(u => u.surname?.toLowerCase().includes(filters.surname.toLowerCase()));
    if (filters.email) filteredData = filteredData.filter(u => u.email?.toLowerCase().includes(filters.email.toLowerCase()));
    if (filters.role) filteredData = filteredData.filter(u => u.role === filters.role);
    setUsers(filteredData);
    setIsFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setUsers(allUsers);
    setIsFilterModalOpen(false);
  };

  const columns = useMemo(
    () => [
        {
        accessorKey: 'firstName',
        header: 'First Name',
      },
      {
        accessorKey: 'surname',
        header: 'Last Name',
      },
      {
        accessorKey: 'username',
        header: 'Username',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'role',
        header: 'Role',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="actionButtons">
            {/* <button
              className="actionButton update"
              onClick={() => handleUpdateClick(row.original)}
            >
              Update
            </button> */}
            <button
              className="actionButton delete"
              onClick={() => handleDeleteClick(row.original)}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: users,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token'); // You'll need this for update/delete calls
        const res = await axios.get('http://localhost:5000/api/admin/getAllUsers', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data.users);
        setAllUsers(res.data.users);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleUpdateClick = (user) => {
    setSelectedUser(user);
    setIsUpdateModalOpen(true);
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/userDelete/${selectedUser._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove the user from the local state for instant UI update
      setUsers(currentUsers => currentUsers.filter(u => u._id !== selectedUser._id));
      showSuccessMessage(`User ${selectedUser.username} has been deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to delete user', err);
      setError('Failed to delete user.');
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="adminDashboardContainer">
      <div className="adminDashboardContent">
        <h1 className="adminDashboardTitle">Welcome to the Admin Dashboard</h1>
        <p>Manage all users from here.</p>

        {successMessage && <div className="successMessage">{successMessage}</div>}

        <div className="table-controls">
          <button
            className={`scroll-toggle-btn ${isScrollLocked ? 'locked' : 'unlocked'}`}
            onClick={() => setIsScrollLocked(!isScrollLocked)}
            title={isScrollLocked ? 'Unlock Scrolling' : 'Lock Scrolling'}
          >
            {isScrollLocked ? 'Unlock Scroll' : 'Lock Scroll'}
          </button>
          <button
            className="filter-btn"
            onClick={() => setIsFilterModalOpen(true)}
          >
            Filter
          </button>
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Search by first name..."
            className="searchInput"
          />
        </div>

        {loading && <p>Loading users...</p>}
        {error && <p className="errorMessage">{error}</p>}

        {!loading && !error && (
          <div className={`tableWrapper ${isScrollLocked ? 'is-locked' : ''}`}>
            <table className="adminUserTable">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && users.length > 10 && (
          <div className="paginationControls">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              &laquo; Previous
            </button>
            <span>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next &raquo;
            </button>
          </div>
        )}

        <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)}>
          {selectedUser && (
            <div>
              <h2>Edit User: {selectedUser.username}</h2>
              <form>
                {/* We will build out this form next */}
                <div className="form-group">
                  <label>Role</label>
                  <select defaultValue={selectedUser.role}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="actionButton update">Save Changes</button>
                  <button type="button" className="actionButton reset-password">
                    Reset Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </Modal>

        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
          {selectedUser && (
            <div className="delete-confirmation">
              <h2>Confirm Deletion</h2>
              <p>Are you sure you want to delete the user <strong>{selectedUser.username}</strong>? This action cannot be undone.</p>
              <div className="modal-actions">
                <button
                  className="actionButton cancel"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="actionButton delete"
                  onClick={handleConfirmDelete}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </Modal>

        <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
          <div className="filter-modal">
            <h2>Filter Users</h2>
            <p>Apply filters to narrow down the results.</p>
            <form onSubmit={handleApplyFilters} className="filter-form">
              <div className="filter-grid">
                {/* Text Inputs */}
                <div className="form-group"><label>First Name</label><input type="text" name="firstName" value={filters.firstName} onChange={handleFilterChange} placeholder="e.g., John" /></div>
                <div className="form-group"><label>Surname</label><input type="text" name="surname" value={filters.surname} onChange={handleFilterChange} placeholder="e.g., Doe" /></div>
                <div className="form-group"><label>Email</label><input type="text" name="email" value={filters.email} onChange={handleFilterChange} placeholder="e.g., john.doe@example.com" /></div>

                {/* Dropdowns */}
                <div className="form-group"><label>Role</label><select name="role" value={filters.role} onChange={handleFilterChange}><option value="">All Roles</option><option value="user">User</option><option value="admin">Admin</option></select></div>
              </div>

              <div className="modal-actions">
                <button type="button" className="actionButton cancel" onClick={handleClearFilters}>
                  Clear Filters
                </button>
                <button type="submit" className="actionButton update">
                  Apply Filters
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AdminDashboard;