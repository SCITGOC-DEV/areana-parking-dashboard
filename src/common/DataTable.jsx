import {useNavigate} from 'react-router-dom';
import {useState} from 'react';
import {Dropdown} from "../components/Dropdown";

export const DataTable = ({
                              title,
                              columns,
                              data,
                              actions,
                              showNoColumn = true,
                              options = [],
                              onRowClick,
                              enablePagination = true,
                              itemsPerPageOptions = [10, 20, 50],
                              defaultItemsPerPage = 10,
                              className = '',
                              tableClassName = '',
                              headerClassName = '',
                              headerCellClassName = '',
                              rowClassName = '',
                              cellClassName = '',
                              noDataClassName = '',
                              summaryRow = null
                          }) => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

    // Add index column as the first column
    const fullColumns = showNoColumn
        ? [
            {
                key: 'index',
                header: 'No.',
                render: (_, index) => (currentPage - 1) * itemsPerPage + index + 1,
                className: 'w-16 text-center',
                hideOnMobile: false,
                hideOnMd: false, // Ensure the index column is visible on MD screens
                isSticky: true
            },
            ...columns.map(column => ({
                ...column,
                hideOnMd: column.hideOnMd || false // Add hideOnMd property for MD-specific visibility
            }))
        ]
        : [...columns.map(column => ({
            ...column,
            hideOnMd: column.hideOnMd || false
        }))];

    // Pagination calculations
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedData = enablePagination
        ? data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        : data;

    const handlePageChange = (newPage) => {
        setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
    };

    // Render pagination footer
    const renderPaginationFooter = () => {
        if (!enablePagination || totalItems === 0) return null;

        return (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="whitespace-nowrap">Show</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:text-gray-200"
                        >
                            {itemsPerPageOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <span className="whitespace-nowrap">entries</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
                            <strong>{Math.min(currentPage * itemsPerPage, totalItems)}</strong> of{" "}
                            <strong>{totalItems}</strong> results
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Reverting the column rendering logic
    const renderColumn = (column, item, index) => {
        const stickyClasses = column.isSticky 
            ? 'sticky left-0 pl-8 !bg-white dark:!bg-gray-900 z-20' 
            : '';
        
        return (
            <td
                key={column.key}
                className={`px-3 py-3 text-sm ${column.hideOnMobile ? 'hidden lg:table-cell' : ''} ${column.render ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'} ${stickyClasses} ${column.className || ''} ${item.highlighted ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''} ${cellClassName}`}
            >
                <div className="truncate max-w-[200px] sm:max-w-none"
                     title={column.render?.(item, index) || item[column.key]}>
                    {column.render?.(item, index) || item[column.key]}
                </div>
            </td>
        );
    };

    return (
        <div className={className}>
            {/* Header */}
            {title && (
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {actions?.map((action, index) => (
                            <div key={index} className="relative">
                                {action?.type && action?.type === "dropdown" ? (
                                    <Dropdown
                                        options={action?.options}
                                        label={action?.label}
                                    />
                                ) : (
                                    <button
                                        key={index}
                                        onClick={action.onClick}
                                        disabled={action.disabled}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 inline-flex items-center gap-2 ${
                                            action.disabled
                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
                                                : action.variant === 'success' || action.variant === 'green'
                                                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800 dark:focus:ring-green-400'
                                                    : action.variant === 'primary'
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-400'
                                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
                                        }`}
                                    >
                                        {action.icon && action.icon}
                                        {action.label}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Responsive Table */}
            <div className="overflow-x-auto -mx-4 sm:-mx-6">
                <div className="inline-block min-w-full align-middle px-4 sm:px-6">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl">
                        <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${tableClassName}`}>
                        <thead className={`bg-gray-50 dark:bg-gray-800 ${headerClassName}`}>
                        <tr>
                            {fullColumns.map(column => (
                                <th
                                    key={column.key}
                                    className={`px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${column.isSticky ? 'sticky left-0 pl-8 !bg-gray-50 dark:!bg-gray-800 z-20' : ''} ${column.hideOnMobile ? 'hidden lg:table-cell' : ''} ${headerCellClassName}`}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedData.map((item, index) => (
                            <tr
                                key={item.id || index}
                                className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${rowClassName}`}
                                onClick={() => onRowClick?.(item)}
                            >
                                {fullColumns.map(column => renderColumn(column, item, index))}
                            </tr>
                        ))}
                        </tbody>
                        {summaryRow && (
                            <tfoot
                                className="bg-gray-50 dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700">
                            {summaryRow}
                            </tfoot>
                        )}
                    </table>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {data.length === 0 && (
                <div className={`text-center py-12 ${noDataClassName}`}>
                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No data available</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">There are no items to display at the
                        moment.</p>
                </div>
            )}

            {/* Pagination Footer */}
            {enablePagination && data.length > 0 && renderPaginationFooter()}
        </div>
    );
};
