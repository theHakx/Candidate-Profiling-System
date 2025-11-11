import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import './bucketView.scss';

const BucketView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bucket, setBucket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBucket = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/buckets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBucket(res.data.bucket);
      } catch (err) {
        setError('Failed to fetch bucket details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBucket();
  }, [id]);

  const columns = useMemo(
    () => [
      { accessorKey: 'firstName', header: 'First Name' },
      { accessorKey: 'surname', header: 'Surname' },
      { accessorKey: 'user.email', header: 'Email' },
      { accessorKey: 'department', header: 'Department' },
      { accessorKey: 'age', header: 'Age' },
      {
        accessorKey: 'education.highestLevel',
        header: 'Education',
        cell: (info) => info.getValue() || 'N/A',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <button
            className="actionButton view"
            onClick={() => navigate(`/admin/userProfile/${row.original.user._id}`)}
          >
            View
          </button>
        ),
      },
    ],
    [navigate]
  );

  const table = useReactTable({
    data: bucket?.profiles || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  if (loading) return <p className="loading-message">Loading Bucket...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="bucketViewContainer">
      <button onClick={() => navigate('/admin/profileBuckets')} className="backButton">
         Back to Buckets
      </button>
      <h1 className="bucketViewTitle">{bucket?.name}</h1>
      <p>
        Viewing {bucket?.profiles.length} profile(s) in this bucket.
      </p>

      <div className="tableWrapper">
        <table className="bucketProfileTable">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bucket?.profiles.length > 10 && (
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
    </div>
  );
};

export default BucketView;

