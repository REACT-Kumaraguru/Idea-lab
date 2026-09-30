import React from "react";
import { X, ChevronDown, ChevronUp, Filter, CheckCircle2, Ban } from "lucide-react";

const CATEGORIES = [
  "Mandatory Machines",
  "Electronic Tools",
  "Mechanical Tools",
  "Computing",
];

const Sidebar = ({
  selectedCategories = [],
  setSelectedCategories = () => {},
  selectedTypes = [],
  setSelectedTypes = () => {},
  categoryOpen = true,
  setCategoryOpen = () => {},
  typeOpen = true,
  setTypeOpen = () => {},
  categoryCounts = {},
  statusCounts = { bookable: 0, unbookable: 0 },
}) => {
  const appliedFilters = [
    ...selectedCategories.map((c) => ({ type: "category", value: c })),
    ...selectedTypes.map((t) => ({ type: "status", value: t })),
  ];

  const removeFilter = (filter) => {
    if (filter.type === "category") {
      setSelectedCategories(selectedCategories.filter((c) => c !== filter.value));
    } else {
      setSelectedTypes(selectedTypes.filter((t) => t !== filter.value));
    }
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedTypes([]);
  };

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const toggleStatus = (status) => {
    if (selectedTypes.includes(status)) {
      setSelectedTypes(selectedTypes.filter((s) => s !== status));
    } else {
      setSelectedTypes([...selectedTypes, status]);
    }
  };

  return (
    <aside className="w-full flex-shrink-0 font-sans text-stone-100">
      <div className="bg-transparent space-y-6">
        
        {/* Filters Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/15">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-400" />
            <h2 className="font-serif text-lg tracking-wider uppercase text-stone-100 font-normal">Filters</h2>
          </div>
          {appliedFilters.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-[10px] font-sans uppercase tracking-widest text-amber-300 hover:text-amber-200 font-bold transition cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Applied Filters Chips */}
        {appliedFilters.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-sans uppercase tracking-widest text-stone-400">
              Active Filters ({appliedFilters.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {appliedFilters.map((filter) => (
                <span
                  key={`${filter.type}-${filter.value}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full text-xs font-sans"
                >
                  <span>{filter.value}</span>
                  <button
                    onClick={() => removeFilter(filter)}
                    className="hover:text-white cursor-pointer ml-0.5"
                    title="Remove filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="border-b border-amber-500/10 pb-5">
          <button
            onClick={() => setCategoryOpen(!categoryOpen)}
            className="flex items-center justify-between w-full mb-3 group cursor-pointer"
          >
            <span className="font-serif text-sm tracking-wider text-stone-200 uppercase group-hover:text-amber-300 transition-colors font-medium">
              Equipment Category
            </span>
            {categoryOpen ? (
              <ChevronUp className="w-4 h-4 text-amber-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {categoryOpen && (
            <div className="space-y-2 font-sans text-xs">
              {CATEGORIES.map((category) => {
                const count = categoryCounts[category] ?? 0;
                const isChecked = selectedCategories.includes(category);
                return (
                  <label
                    key={category}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                      isChecked
                        ? "bg-amber-500/15 text-amber-200 border border-amber-500/30"
                        : "text-stone-300 hover:text-amber-200 hover:bg-stone-900/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCategory(category)}
                        className="w-4 h-4 rounded border-amber-500/30 bg-stone-900 text-amber-400 focus:ring-amber-400 accent-amber-400 cursor-pointer"
                      />
                      <span className="font-medium">{category}</span>
                    </div>
                    <span className="text-[11px] font-mono text-stone-400 bg-stone-900/90 px-2 py-0.5 rounded-md border border-stone-800">
                      {count}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Booking Status Filter */}
        <div>
          <button
            onClick={() => setTypeOpen(!typeOpen)}
            className="flex items-center justify-between w-full mb-3 group cursor-pointer"
          >
            <span className="font-serif text-sm tracking-wider text-stone-200 uppercase group-hover:text-amber-300 transition-colors font-medium">
              Booking Status
            </span>
            {typeOpen ? (
              <ChevronUp className="w-4 h-4 text-amber-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {typeOpen && (
            <div className="space-y-2 font-sans text-xs">
              {[
                { id: "Bookable", label: "Bookable", icon: CheckCircle2, color: "text-emerald-400", count: statusCounts.bookable },
                { id: "Unbookable", label: "Unbookable", icon: Ban, color: "text-rose-400", count: statusCounts.unbookable },
              ].map(({ id, label, icon: Icon, color, count }) => {
                const isChecked = selectedTypes.includes(id);
                return (
                  <label
                    key={id}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                      isChecked
                        ? "bg-amber-500/15 text-amber-200 border border-amber-500/30"
                        : "text-stone-300 hover:text-amber-200 hover:bg-stone-900/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleStatus(id)}
                        className="w-4 h-4 rounded border-amber-500/30 bg-stone-900 text-amber-400 focus:ring-amber-400 accent-amber-400 cursor-pointer"
                      />
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                      <span className="font-medium">{label}</span>
                    </div>
                    <span className="text-[11px] font-mono text-stone-400 bg-stone-900/90 px-2 py-0.5 rounded-md border border-stone-800">
                      {count}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;

