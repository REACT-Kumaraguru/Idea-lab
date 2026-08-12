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
    <aside className="w-full flex-shrink-0 font-sans text-stone-100">
      <div className="bg-transparent">
        
        {/* Filters Header */}
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-amber-500/15">
          <Filter className="w-4 h-4 text-amber-400" />
          <h2 className="font-serif text-xl tracking-wider uppercase text-stone-100 font-normal">Filters</h2>
        </div>

        {/* Applied Filters */}
        {appliedFilters.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-sans uppercase tracking-widest text-stone-400">
                Applied Filters
              </span>
              <button
                onClick={clearAllFilters}
                className="text-[10px] font-sans uppercase tracking-widest text-amber-300 hover:text-amber-200 font-bold"
              >
                Clear all
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {appliedFilters.map((filter) => (
                <span
                  key={filter}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full text-xs font-sans"
                >
                  {filter}
                  <button onClick={() => removeFilter(filter)} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div>
          <button
            onClick={() => setCategoryOpen(!categoryOpen)}
            className="flex items-center justify-between w-full mb-4 group cursor-pointer"
          >
            <span className="font-serif text-lg tracking-wider text-stone-200 uppercase group-hover:text-amber-300 transition-colors">
              Category
            </span>
            {categoryOpen ? (
              <ChevronUp className="w-4 h-4 text-amber-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {categoryOpen && (
            <div className="space-y-3 font-sans text-xs">
              {[
                "Mandatory Machines",
                "Mechanical Tools",
                "Electronic Tools",
                "Computing",
              ].map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-2.5 cursor-pointer text-stone-300 hover:text-amber-200 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="w-4 h-4 rounded border-amber-500/30 bg-stone-900 text-amber-400 focus:ring-amber-400 accent-amber-400"
                  />
                  <span>
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
