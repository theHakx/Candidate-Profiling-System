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
import * as XLSX from 'xlsx';
import Modal from '../../../components/Modal/Modal';
import './UserProfiles.scss';

const UserProfiles = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]); // To hold the master list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [isBucketModalOpen, setIsBucketModalOpen] = useState(false);
  const [bucketName, setBucketName] = useState('');

  // --- Filter State and Options ---
  const initialFilters = {
    firstName: '',
    surname: '',
    email: '',
    city: '',
    department: '',
    gender: '',
    highestLevel: '',
    fieldOfStudy: '',
    minAge: '',
    maxAge: '',
    skills: '',
  };
  const [filters, setFilters] = useState(initialFilters);

  const departmentOptions = ['Inbound','Outbound','Human Resources','Information Systems','CX Admin','Finance', 'Liquid','Projects','Business Development','Eco Cash', 'Business Intelligence','Facilities','Tsebo'];
  const educationLevels = ['High School', 'Associate Degree', "Bachelor's Degree", "Master's Degree", 'PhD'];
  const fieldsOfStudy = [ 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 'Statistics', 'Data Science', 'Mechanical Engineering', 'Electrical Engineering', 'Software Engineering', 'Psychology', 'Sociology', 'Economics', 'History', 'Philosophy', 'Literature', 'Visual Arts', 'Music', 'Business Administration', 'Finance', 'Accounting', 'Marketing', 'Human Resource Management', 'Law' ]; // Abridged for brevity

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    let filteredData = [...allProfiles];

    // Apply each filter from the state
    if (filters.firstName) {
      filteredData = filteredData.filter(p => p.firstName?.toLowerCase().includes(filters.firstName.toLowerCase()));
    }
    if (filters.surname) {
      filteredData = filteredData.filter(p => p.surname?.toLowerCase().includes(filters.surname.toLowerCase()));
    }
    if (filters.email) {
      filteredData = filteredData.filter(p => p.user?.email?.toLowerCase().includes(filters.email.toLowerCase()));
    }
    if (filters.city) {
      filteredData = filteredData.filter(p => p.city?.toLowerCase().includes(filters.city.toLowerCase()));
    }
    if (filters.department) {
      filteredData = filteredData.filter(p => p.department === filters.department);
    }
    if (filters.gender) {
      filteredData = filteredData.filter(p => p.gender === filters.gender);
    }
    if (filters.highestLevel) {
      filteredData = filteredData.filter(p => p.education?.highestLevel === filters.highestLevel);
    }
    if (filters.fieldOfStudy) {
      filteredData = filteredData.filter(p => p.education?.fieldOfStudy === filters.fieldOfStudy);
    }
    if (filters.minAge) {
      filteredData = filteredData.filter(p => p.age >= parseInt(filters.minAge, 10));
    }
    if (filters.maxAge) {
      filteredData = filteredData.filter(p => p.age <= parseInt(filters.maxAge, 10));
    }
    if (filters.skills) {
      const skillsToFind = filters.skills.split(',').map(s => s.trim().toLowerCase());
      filteredData = filteredData.filter(p => skillsToFind.every(skill => p.skills?.some(s => s.toLowerCase().includes(skill))));
    }

    setProfiles(filteredData);
    setIsFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setProfiles(allProfiles); // Reset table to show all profiles
    setIsFilterModalOpen(false);
  };

  const handleCreateBucket = async (e) => {
    e.preventDefault();
    const selectedProfileIds = Object.keys(rowSelection).map(index => profiles[index]._id);

    if (selectedProfileIds.length === 0) {
      // This should be handled by disabling the button, but as a safeguard
      alert('Please select at least one profile to create a bucket.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/buckets', 
        { name: bucketName, profileIds: selectedProfileIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showSuccessMessage(`Bucket "${bucketName}" created successfully!`);
      setIsBucketModalOpen(false);
      setBucketName('');
      setRowSelection({}); // Clear selection after creating bucket
    } catch (err) {
      console.error('Failed to create bucket', err);
      setError('Failed to create bucket.');
    }
  };

  const handleExport = () => {
    // This will export the currently filtered data shown in the table
    const dataToExport = table.getRowModel().rows.map(row => {
      const profile = row.original; // Get the profile object for the current row
      return {
        'First Name': profile.firstName,
        'Surname': profile.surname,
        'Email': profile.user?.email,
        'Job Title': profile.jobTitle,
        'Department': profile.department,
        'Gender': profile.gender,
        'Age': profile.age,
        'City': profile.city,
        'Languages': profile.languages,
        'Role': profile.user?.role,
        'Highest Education': profile.education?.highestLevel,
        'Degree Type': profile.education?.degreeType,
        'Field of Study': profile.education?.fieldOfStudy,
        'University': profile.education?.university,
        'Graduation Year': profile.education?.graduationYear,
        'Skills': profile.skills?.join(', '),
        'Certifications': profile.certifications?.join(', '),
        'LinkedIn': profile.linkedinProfiles,
        'GitHub': profile.githubProfiles,
        'Website': profile.website,
        'Professional Summary': profile.professionalSummary,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'UserProfiles');

    XLSX.writeFile(workbook, 'UserProfiles.xlsx');
  };

  const columns = useMemo(
    () => [
        {
          id: 'select',
          header: ({ table }) => (
            <div className="select-header">
              <input
                type="checkbox"
                id="header-select-all"
                {...{
                  checked: table.getIsAllRowsSelected(),
                  indeterminate: table.getIsSomeRowsSelected(),
                  onChange: table.getToggleAllRowsSelectedHandler(),
                }}
              />
            </div>
          ),
          cell: ({ row }) => (
            <input
              type="checkbox"
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          ),
        },
        {
        accessorKey: 'firstName',
        header: 'First Name',
      },
      {
        accessorKey: 'surname',
        header: 'Surname',
      },
    
      {
        accessorKey: 'department',
        header: 'Department',
        cell: info => info.getValue() || 'N/A',
      },
      {
        accessorKey: 'education',
        header: 'Highest Education',
        cell: info => info.getValue()?.[0]?.highestLevel || 'N/A',
      },
      {
        accessorKey: 'education',
        header: 'Field of Study',
        cell: info => info.getValue()?.[0]?.fieldOfStudy || 'N/A',
      },
  
   
      {
        accessorKey: 'city',
        header: 'City',
        cell: info => info.getValue() || 'N/A',
      },
 
    
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="actionButtons">
            <button
              className="actionButton view"
              onClick={() => row.original.user && navigate(`/admin/userProfile/${row.original.user._id}`)}
            >
              View
            </button>
            <button
              className="actionButton delete"
              onClick={() => handleDeleteClick(row.original.user)}
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
    data: profiles,
    columns,
    state: {
      globalFilter,
      rowSelection,
    },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
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
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/admin/userProfiles', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfiles(res.data.profiles);
        setAllProfiles(res.data.profiles); // Store the master list
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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

      // Remove the user's profile from the local state for instant UI update
      setProfiles(currentProfiles => currentProfiles.filter(p => p.user._id !== selectedUser._id));
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
    <div className="userProfilesContainer">
      <div className="userProfilesContent">
        <h1 className="userProfilesTitle">User Profiles</h1>
        {successMessage && <div className="successMessage">{successMessage}</div>}
        <p>Manage all users from here.</p>

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
          <button
            className="create-bucket-btn"
            onClick={() => setIsBucketModalOpen(true)}
            disabled={Object.keys(rowSelection).length === 0}
          >
            Create Bucket ({Object.keys(rowSelection).length})
          </button>
          <button className="export-btn" onClick={handleExport}>
            Export to Excel
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
            <table className="userTable">
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

        {!loading && !error && profiles.length > 10 && (
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

        <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
          <div className="filter-modal">
            <h2>Filter Profiles</h2>
            <p>Apply filters to narrow down the results.</p>
            <form onSubmit={handleApplyFilters} className="filter-form">
              <div className="filter-grid">
                {/* Text Inputs */}
                <div className="form-group"><label>First Name</label><input type="text" name="firstName" value={filters.firstName} onChange={handleFilterChange} placeholder="e.g., John" /></div>
                <div className="form-group"><label>Surname</label><input type="text" name="surname" value={filters.surname} onChange={handleFilterChange} placeholder="e.g., Doe" /></div>
                <div className="form-group"><label>Email</label><input type="text" name="email" value={filters.email} onChange={handleFilterChange} placeholder="e.g., john.doe@example.com" /></div>
                <div className="form-group"><label>City</label><input type="text" name="city" value={filters.city} onChange={handleFilterChange} placeholder="e.g., Lusaka" /></div>

                {/* Dropdowns */}
                <div className="form-group"><label>Department</label><select name="department" value={filters.department} onChange={handleFilterChange}><option value="">All Departments</option>{departmentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                <div className="form-group"><label>Gender</label><select name="gender" value={filters.gender} onChange={handleFilterChange}><option value="">All Genders</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                <div className="form-group"><label>Highest Education</label><select name="highestLevel" value={filters.highestLevel} onChange={handleFilterChange}><option value="">All Levels</option>{educationLevels.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                <div className="form-group"><label>Field of Study</label><select name="fieldOfStudy" value={filters.fieldOfStudy} onChange={handleFilterChange}><option value="">All Fields</option>{fieldsOfStudy.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>

                {/* Specialized Inputs */}
                <div className="form-group age-range">
                  <label>Age Range</label>
                  <div>
                    <input type="number" name="minAge" value={filters.minAge} onChange={handleFilterChange} placeholder="Min" />
                    <span>-</span>
                    <input type="number" name="maxAge" value={filters.maxAge} onChange={handleFilterChange} placeholder="Max" />
                  </div>
                </div>
                <div className="form-group skills-input">
                  <label>Skills</label>
                  <input type="text" name="skills" value={filters.skills} onChange={handleFilterChange} placeholder="e.g., Recruitment, Python (comma-separated)" />
                </div>
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

        <Modal isOpen={isBucketModalOpen} onClose={() => setIsBucketModalOpen(false)}>
          <div className="bucket-modal">
            <h2>Create New Bucket</h2>
            <p>Give a name to your new bucket of selected profiles.</p>
            <form onSubmit={handleCreateBucket}>
              <div className="form-group">
                <label>Bucket Name</label>
                <input
                  type="text"
                  value={bucketName}
                  onChange={(e) => setBucketName(e.target.value)}
                  placeholder="e.g., Top IT Candidates"
                  required
                />
              </div>
              <div className="modal-actions"><button type="submit" className="actionButton update">Create Bucket</button></div>
            </form>
          </div>
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
      </div>
    </div>
  );
};

export default UserProfiles;