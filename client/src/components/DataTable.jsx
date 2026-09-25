import React, { useState, useMemo } from 'react';
import { Search, Filter, AlertCircle } from 'lucide-react';
import './DataTable.css';

const DataTable = ({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchKeys = [], // array of object keys to search inside
  filterSlot = null,
  headerActions = null,
  emptyMessage = 'No matching records found.',
  isLoading = false,
  pagination = true,
  pageSize = 10
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter records based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const term = searchTerm.toLowerCase();
    return data.filter((item) => {
      if (searchKeys.length > 0) {
        return searchKeys.some((key) => {
          const val = item[key];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
        });
      }
      // Default: search all string / number fields
      return Object.values(item).some((val) =>
        val !== undefined && val !== null && String(val).toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, searchKeys]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize, pagination]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="datatable-container">
      {(searchable || filterSlot || headerActions) && (
        <div className="datatable-toolbar">
          <div className="datatable-toolbar-left">
            {searchable && (
              <div className="datatable-search-box">
                <Search size={16} className="datatable-search-icon" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="datatable-search-input"
                />
                {searchTerm && (
                  <button
                    className="datatable-clear-search"
                    onClick={() => {
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            )}
            {filterSlot}
          </div>

          {headerActions && (
            <div className="datatable-toolbar-right">
              {headerActions}
            </div>
          )}
        </div>
      )}

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={col.width ? { width: col.width } : undefined}
                  className={col.className || ''}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="datatable-state-cell">
                  <div className="datatable-loading-text">Loading table data...</div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="datatable-state-cell">
                  <div className="datatable-empty-wrap">
                    <AlertCircle size={28} className="datatable-empty-icon" />
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr key={row.id || rowIdx}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={col.className || ''}>
                      {col.render ? col.render(row, (currentPage - 1) * pageSize + rowIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && filteredData.length > pageSize && (
        <div className="datatable-pagination">
          <span className="datatable-page-info">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
          </span>
          <div className="datatable-page-controls">
            <button
              className="datatable-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="datatable-current-page">{currentPage} / {totalPages}</span>
            <button
              className="datatable-page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
