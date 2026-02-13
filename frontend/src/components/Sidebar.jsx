import React from "react";
import { X, ChevronDown, ChevronUp, Filter } from "lucide-react";

const Sidebar = ({
  selectedCategories,
  setSelectedCategories,
  categoryOpen,
  setCategoryOpen,
}) => {
  // Get applied filters
  const getAppliedFilters = () => {
    return selectedCategories.filter((cat) => cat !== "All");
  };

  const appliedFilters = getAppliedFilters();

  // Remove filter
  const removeFilter = (filter) => {
    setSelectedCategories(selectedCategories.filter((c) => c !== filter));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategories([]);
  };

  // Toggle category
  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  return (
    <aside className="w-[240px] flex-shrink-0 font-sans">
      <div className="sticky top-6 bg-white border border-gray-200 rounded-md p-5 shadow-sm">
        
        {/* Filters Header */}
        <div className="flex items-center gap-2 mb-5">
          <Filter className="w-4 h-4 text-gray-600" />
          <h2 className="font-semibold text-gray-800">Filters</h2>
        </div>

        {/* Applied Filters */}
        {appliedFilters.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600">
                Applied
              </span>
              <button
                onClick={clearAllFilters}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {appliedFilters.map((filter) => (
                <span
                  key={filter}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs"
                >
                  {filter}
                  <button onClick={() => removeFilter(filter)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <hr className="my-4 border-gray-200" />

        {/* Category Filter */}
        <div>
          <button
            onClick={() => setCategoryOpen(!categoryOpen)}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="font-semibold text-sm text-gray-800">
              Category
            </span>
            {categoryOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {categoryOpen && (
            <div className="space-y-3">
              {[
                "Mandatory Machines",
                "Mechanical Tools",
                "Electronic Tools",
                "Computing",
              ].map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-700 focus:ring-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
