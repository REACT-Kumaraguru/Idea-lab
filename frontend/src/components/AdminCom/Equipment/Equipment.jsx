import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter
} from 'lucide-react';
import { useEquipmentStore } from '../../../store/useEquipmentStore';
import { getImageUrl } from '../../../lib/config.js';
import AmbientBackground from '../../AmbientBackground';

const Equipment = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const {
    equipment,
    fetchEquipment,
    deleteEquipment,
    isFetchingEquipment
  } = useEquipmentStore();

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      await deleteEquipment(id);
    }
  };

  const filteredList = equipment.filter(item =>
    item.equipmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0809] text-stone-100 font-sans relative overflow-x-hidden p-6 md:p-8">
      <AmbientBackground height="fixed inset-0" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-stone-100 uppercase tracking-widest font-normal">Equipment Inventory</h1>
            <p className="text-xs font-dancing text-amber-200/90 mt-1">Manage and track all sanctuary prototyping hardware assets</p>
          </div>

          <button
            onClick={() => navigate('/admin/new-equipment')}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 px-5 py-2.5 rounded-full text-xs font-sans uppercase font-bold tracking-wider hover:brightness-110 transition shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Equipment</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="serene-glass-card p-4 rounded-2xl border border-amber-500/20 shadow-xl flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400/70 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or brand..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-amber-500/30 bg-stone-900/80 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-sans"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="serene-glass-card border border-amber-500/25 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-amber-500/20 text-stone-400 uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Equipment</th>
                  <th className="px-6 py-4">Brand</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Price (₹/hr)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {isFetchingEquipment ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-stone-500 uppercase tracking-widest text-xs">
                      Loading hardware inventory...
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-stone-500 uppercase tracking-widest text-xs">
                      No matching equipment found.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-amber-400/5 transition">
                      <td className="px-6 py-4">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.equipmentName}
                          className="w-12 h-12 object-cover rounded-xl border border-amber-500/30 bg-stone-900"
                        />
                      </td>
                      <td className="px-6 py-4 font-serif text-sm text-stone-100 uppercase tracking-wide">
                        {item.equipmentName}
                      </td>
                      <td className="px-6 py-4 text-amber-300/90 font-mono">
                        {item.brandName || "Standard"}
                      </td>
                      <td className="px-6 py-4 font-mono text-stone-300">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 font-mono text-amber-400 font-bold">
                        ₹{item.pricePerHour}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${
                          item.isAvailable
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate('/admin/new-equipment', { state: { editItem: item } })}
                            className="p-2 text-stone-400 hover:text-amber-300 hover:bg-amber-400/10 rounded-xl transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Equipment;