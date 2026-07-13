import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiX, FiCalendar } from "react-icons/fi";

export const AnexBFilterDialog = ({
                                      isModalOpen,
                                      handleCloseModal,
                                      searchValue,
                                      setSearchValue,
                                      selectedFilter,
                                      setSelectedFilter,
                                      handleSearch,
                                  }) => {

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
                isModalOpen ? "bg-opacity-50" : "bg-opacity-0"
            } bg-black`}
        >
            <div
                className={`transform transition-all duration-300 ease-out ${
                    isModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
                } w-full max-w-md bg-white rounded-xl shadow-xl`}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            Filter Criteria
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Select search filters below
                        </p>
                    </div>
                    <button
                        onClick={handleCloseModal}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FiX className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                    {/* Date Pickers */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-800">
                            Date Range
                        </label>
                        <div className="flex space-x-4">
                            {/* Start Date Picker */}
                            <div className="relative flex-1">
                                <FiCalendar className="absolute left-3 top-3 text-gray-500" />
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                    placeholderText="Select start date"
                                />
                            </div>

                            {/* End Date Picker */}
                            <div className="relative flex-1">
                                <FiCalendar className="absolute left-3 top-3 text-gray-500" />
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                    placeholderText="Select end date"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Search Field with Dropdown */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-800">
                            Search
                        </label>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="Enter keyword"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            />
                            <select
                                value={selectedFilter}
                                onChange={(e) => setSelectedFilter(e.target.value)}
                                className="px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            >
                                <option value="plate">Plate Number</option>
                                <option value="machine">Machine</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-4 p-6 border-t border-gray-200">
                    <button
                        onClick={handleCloseModal}
                        className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSearch}
                        className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    >
                        Search
                    </button>
                </div>
            </div>
        </div>
    );
};
