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
      // No need to manually update state, store handles it
    }
  };

  const getStatusColor = (isAvailable) => {
    return isAvailable
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
  };

  const filteredList = equipment.filter(item =>
    item.equipmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ml-16 p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Equipment Inventory</h1>
            <p className="text-gray-500 text-sm">Manage and track all lab assets</p>
          </div>

          <button
            onClick={() => navigate('/admin/new-equipment')}
            className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Equipment</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or brand..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Equipment</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Rent (₹)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isFetchingEquipment ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No equipment found</td>
                  </tr>
                ) : (
                  filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        {item.image ? (
                          <img src={`http://localhost:5001/${item.image}`} alt={item.equipmentName} className="w-10 h-10 object-cover rounded-md" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs">No Img</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-800 block">{item.equipmentName}</span>
                        <span className="text-xs text-gray-500">{item.equipmentDetails}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.brandName}</td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-sm">{item.quantity}</td>
                      <td className="px-6 py-4 text-gray-700 font-mono text-sm">
                        {item.rentAmount ? `₹${item.rentAmount}` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.isAvailable)}`}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-100 transition-opacity">
                          <button
                            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Edit"
                            onClick={() => navigate('/admin/new-equipment', { state: { equipment: item } })}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                            onClick={() => handleDelete(item.id)}
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

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/30">
            <span>Showing {filteredList.length} items</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Equipment;