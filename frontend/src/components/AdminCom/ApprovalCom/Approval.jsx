import React, { useState, useEffect, useMemo } from 'react';
import { Users, Clock, FileCheck, FileX, Download, Check, X, Printer, Search, FileText, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import InvoiceModal from './PDFformat'; // Import the invoice modal
import { axiosInstance } from '../../../lib/axios.js';

const Approval = () => {
  // Get authenticated user from Zustand store
  const authUser = useAuthStore((state) => state.authUser);
  
  const [activeTab, setActiveTab] = useState('new');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState(null); // For invoice modal

  // Fetch bookings from API
  useEffect(() => {
    if (authUser) {
      console.log('Authenticated user found:', authUser.email);
      fetchBookings();
    } else {
      console.log('No authenticated user');
      setLoading(false);
    }
  }, [authUser]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      const response = await axiosInstance.get('/bookings');
      const result = response.data;
      console.log('API Response:', result);
      
      if (result.success && Array.isArray(result.data)) {
        setRequests(result.data);
        console.log(`✅ Loaded ${result.data.length} bookings`);
      } else if (Array.isArray(result.data)) {
        setRequests(result.data);
      } else if (Array.isArray(result)) {
        setRequests(result);
      } else {
        console.error('Unexpected response format:', result);
        throw new Error('Unexpected response format from server');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert(`Failed to fetch bookings: ${error.message}\n\nPlease check:\n1. You are logged in as admin\n2. Backend is running on port 5001\n3. CORS is enabled on backend`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from fetched data
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  const statsCards = [
    { label: 'TOTAL REQUESTS', count: stats.total, icon: <Users size={20} />, borderColor: 'border-blue-500', textColor: 'text-blue-600', iconBg: 'bg-blue-50' },
    { label: 'PENDING REQUESTS', count: stats.pending, icon: <Clock size={20} />, borderColor: 'border-yellow-500', textColor: 'text-yellow-600', iconBg: 'bg-yellow-50' },
    { label: 'APPROVED REQUESTS', count: stats.approved, icon: <FileCheck size={20} />, borderColor: 'border-green-500', textColor: 'text-green-600', iconBg: 'bg-green-50' },
    { label: 'DECLINED REQUESTS', count: stats.rejected, icon: <FileX size={20} />, borderColor: 'border-red-500', textColor: 'text-red-600', iconBg: 'bg-red-50' },
  ];

  // Filter requests based on active tab, status filter, and search
  const filteredRequests = requests.filter(req => {
    if (activeTab === 'new' && req.status !== 'pending') return false;
    if (activeTab === 'all' && filterStatus !== 'all' && req.status !== filterStatus) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        req.user?.fullName?.toLowerCase().includes(searchLower) ||
        req.user?.email?.toLowerCase().includes(searchLower) ||
        req.equipment?.equipmentName?.toLowerCase().includes(searchLower) ||
        req.equipment?.brandName?.toLowerCase().includes(searchLower) ||
        req.id.toString().includes(searchLower)
      );
    }
    
    return true;
  });

  // Group by cart submission: same submissionBatchId = one request (one row). No batchId = one booking per row.
  const groupedRows = useMemo(() => {
    const map = new Map();
    filteredRequests.forEach(req => {
      const key = req.submissionBatchId || `single-${req.id}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(req);
    });
    return Array.from(map.entries()).map(([key, bookings]) => ({
      batchId: key.startsWith('single-') ? null : key,
      bookings,
    }));
  }, [filteredRequests]);

  // Time formatting functions
  const formatTime = (time) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':').map(Number);
    const displayHours = hours % 12 || 12;
    const modifier = hours >= 12 ? 'PM' : 'AM';
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${modifier}`;
  };

  const calculateEndTime = (startTime, duration) => {
    if (!startTime) return 'N/A';
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = (hours + duration) % 24;
    const displayHours = endHours % 12 || 12;
    const modifier = endHours >= 12 ? 'PM' : 'AM';
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${modifier}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB').replace(/\//g, '-');
  };

  // Open invoice modal with full group (one bill per approval)
  const handleShowInvoice = (bookings) => {
    setSelectedBookingForInvoice(Array.isArray(bookings) ? bookings : [bookings]);
  };

  // Approve booking
  const handleApprove = async (id) => {
    try {
      const { data: result } = await axiosInstance.put(`/bookings/${id}/status`, { status: 'approved' });
      if (result.success || result.data) {
        setRequests(requests.map(req =>
          req.id === id ? { ...req, status: 'approved', updated_at: new Date().toISOString() } : req
        ));
        alert('✅ Booking approved successfully!');
        fetchBookings();
      }
    } catch (error) {
      console.error('Error approving booking:', error);
      alert(`❌ Failed to approve booking: ${error.response?.data?.message || error.message}`);
    }
  };

  // Reject booking
  const handleReject = async (id) => {
    try {
      const { data: result } = await axiosInstance.put(`/bookings/${id}/status`, { status: 'rejected' });
      if (result.success || result.data) {
        setRequests(requests.map(req =>
          req.id === id ? { ...req, status: 'rejected', updated_at: new Date().toISOString() } : req
        ));
        alert('✅ Booking rejected successfully!');
        fetchBookings();
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert(`❌ Failed to reject booking: ${error.response?.data?.message || error.message}`);
    }
  };

  // Approve whole cart (batch) – one request
  const handleBatchApprove = async (batchId) => {
    try {
      const { data: result } = await axiosInstance.put(`/bookings/batch/${encodeURIComponent(batchId)}/status`, { status: 'approved' });
      if (result.success && result.data) {
        const ids = result.data.map(b => b.id);
        setRequests(requests.map(req => ids.includes(req.id) ? { ...req, status: 'approved', updated_at: new Date().toISOString() } : req));
        alert('✅ Request approved successfully!');
        fetchBookings();
      }
    } catch (error) {
      console.error('Error approving batch:', error);
      alert(`❌ Failed to approve request: ${error.response?.data?.message || error.message}`);
    }
  };

  // Reject whole cart (batch) – one request
  const handleBatchReject = async (batchId) => {
    try {
      const { data: result } = await axiosInstance.put(`/bookings/batch/${encodeURIComponent(batchId)}/status`, { status: 'rejected' });
      if (result.success && result.data) {
        const ids = result.data.map(b => b.id);
        setRequests(requests.map(req => ids.includes(req.id) ? { ...req, status: 'rejected', updated_at: new Date().toISOString() } : req));
        alert('✅ Request rejected.');
        fetchBookings();
      }
    } catch (error) {
      console.error('Error rejecting batch:', error);
      alert(`❌ Failed to reject request: ${error.response?.data?.message || error.message}`);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'User', 'Email', 'Equipment', 'Brand', 'Date', 'Time', 'Duration (Hrs)', 'Amount (₹)', 'Status', 'Notes', 'Created', 'Updated'];
    const csvData = filteredRequests.map(r => [
      r.id,
      r.user?.fullName || 'N/A',
      r.user?.email || 'N/A',
      r.equipment?.equipmentName || 'N/A',
      r.equipment?.brandName || 'N/A',
      r.bookingDate,
      r.bookingTime,
      r.duration,
      r.totalAmount,
      r.status,
      r.notes || '',
      r.created_at,
      r.updated_at
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-approvals-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Check if user is not logged in
  if (!authUser) {
    return (
      <div className="ml-20 min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please login as admin to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="ml-20 min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-20 min-h-screen bg-white font-sans text-slate-700">
      <div className="p-10 max-w-[1600px]">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          {statsCards.map((stat, index) => (
            <div key={index} className={`bg-white p-6 rounded-xl shadow-sm border-b-[6px] ${stat.borderColor} border border-gray-100 flex justify-between items-center`}>
              <div>
                <p className="text-gray-400 text-[10px] font-bold tracking-widest mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.count}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.iconBg} ${stat.textColor}`}>{stat.icon}</div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Booking Approval</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchBookings}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-5 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition font-bold text-sm"
            >
              <Download size={18} /> Export List
            </button>
          </div>
        </div>

        {/* Search Bar - Only show on History tab */}
        {activeTab === 'all' && (
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, equipment, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}

        {/* Table Container */}
        <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50/30">
            <button 
              onClick={() => setActiveTab('new')}
              className={`px-10 py-5 font-bold text-sm transition-all ${activeTab === 'new' ? 'border-b-4 border-blue-500 text-blue-600' : 'text-gray-400'}`}
            >
              New Requests ({stats.pending})
            </button>
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-10 py-5 font-bold text-sm transition-all ${activeTab === 'all' ? 'border-b-4 border-blue-500 text-blue-600' : 'text-gray-400'}`}
            >
              History ({stats.total})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase tracking-widest bg-gray-50/20">
                  <th className="py-6 px-6 w-10"><input type="checkbox" className="rounded-sm accent-blue-600" /></th>
                  <th className="py-6 px-4">Customer Details</th>
                  <th className="py-6 px-4">Equipment</th>
                  <th className="py-6 px-4 text-center">Date</th>
                  <th className="py-6 px-4">Timing</th>
                  <th className="py-6 px-4">Rent (₹)</th>
                  {activeTab === 'all' && <th className="py-6 px-4">Status</th>}
                  <th className="py-6 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-slate-600">
                {groupedRows.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'all' ? "8" : "7"} className="py-12 text-center text-gray-400">
                      {activeTab === 'new' ? 'No pending requests' : 'No bookings found'}
                    </td>
                  </tr>
                ) : (
                  groupedRows.map((group) => {
                    const row = group.bookings[0];
                    const isBatch = group.bookings.length > 1;
                    const status = row.status;
                    const totalRent = group.bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);
                    return (
                      <tr key={group.batchId || row.id} className="border-t border-gray-50 hover:bg-blue-50/10 transition">
                        <td className="py-6 px-6"><input type="checkbox" className="rounded-sm accent-blue-600" /></td>

                        {/* User Info */}
                        <td className="py-6 px-4">
                          <div className="font-bold text-slate-800 text-sm">{row.user?.fullName || 'N/A'}</div>
                          <div className="text-gray-400 font-normal">{row.user?.email || 'N/A'}</div>
                          {isBatch && <div className="text-blue-600 text-[10px] mt-1">{group.bookings.length} item(s)</div>}
                          {group.bookings.some((b) => b.verifiedAt) && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                                <ShieldCheck size={10} />
                                Verified
                              </span>
                            </div>
                          )}
                          {row.notes && (
                            <div className="text-gray-500 text-[10px] mt-1 italic">Note: {row.notes}</div>
                          )}
                        </td>

                        {/* Equipment – show individual bookings with individual actions */}
                        <td className="py-6 px-4">
                          {group.bookings.map((b, i) => (
                            <div key={b.id} className="flex items-center justify-between gap-2 text-slate-700 mb-2 p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2 flex-1">
                                <Printer size={14} className="text-blue-400 flex-shrink-0" />
                                <div>
                                  <div className="font-bold">{b.equipment?.equipmentName || 'N/A'}</div>
                                  {b.equipment?.brandName && (
                                    <div className="text-gray-400 text-[10px]">{b.equipment.brandName}</div>
                                  )}
                                </div>
                              </div>
                              {b.status === 'pending' && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleApprove(b.id)}
                                    className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-600 hover:text-white transition"
                                    title={`Approve ${b.equipment?.equipmentName}`}
                                  >
                                    <Check size={12} strokeWidth={3} />
                                  </button>
                                  <button
                                    onClick={() => handleReject(b.id)}
                                    className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-600 hover:text-white transition"
                                    title={`Reject ${b.equipment?.equipmentName}`}
                                  >
                                    <X size={12} strokeWidth={3} />
                                  </button>
                                </div>
                              )}
                              {b.status === 'approved' && (
                                <span className="text-[10px] text-green-600 font-semibold">Approved</span>
                              )}
                              {b.status === 'rejected' && (
                                <span className="text-[10px] text-red-600 font-semibold">Rejected</span>
                              )}
                            </div>
                          ))}
                        </td>

                        <td className="py-6 px-4 text-center font-normal">
                          {isBatch ? group.bookings.map(b => formatDate(b.bookingDate)).join(', ') : formatDate(row.bookingDate)}
                        </td>

                        {/* Timing */}
                        <td className="py-6 px-4">
                          {isBatch ? (
                            <div className="space-y-1">
                              {group.bookings.map(b => (
                                <div key={b.id} className="text-slate-800">
                                  {formatTime(b.bookingTime)} - {calculateEndTime(b.bookingTime, b.duration)} ({b.duration} Hrs)
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <div className="text-slate-800">{formatTime(row.bookingTime)} - {calculateEndTime(row.bookingTime, row.duration)}</div>
                              <div className="text-gray-400 font-normal text-[10px] mt-1">Duration: {row.duration} Hrs</div>
                            </>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="py-6 px-4 font-bold text-blue-600 text-sm">
                          ₹{totalRent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Status - Only show in History tab */}
                        {activeTab === 'all' && (
                          <td className="py-6 px-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${
                              status === 'approved' ? 'bg-green-100 text-green-700' :
                              status === 'rejected' ? 'bg-red-100 text-red-700' :
                              status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              status === 'completed' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {status}
                            </span>
                          </td>
                        )}

                        {/* Actions – Show invoice if all approved, or batch actions if all pending */}
                        <td className="py-6 px-4">
                          {group.bookings.every(b => b.status === 'approved') ? (
                            <button
                              onClick={() => handleShowInvoice(group.bookings)}
                              className="flex items-center gap-1 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition text-[10px] font-bold"
                              title="Print Invoice"
                            >
                              <Printer size={14} />
                              <span>Invoice</span>
                            </button>
                          ) : group.bookings.every(b => b.status === 'pending') ? (
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleBatchApprove(group.batchId || row.id)}
                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition text-[10px] font-bold"
                                title="Approve All"
                              >
                                <Check size={14} />
                                <span className="ml-1">Approve All</span>
                              </button>
                              <button
                                onClick={() => handleBatchReject(group.batchId || row.id)}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition text-[10px] font-bold"
                                title="Reject All"
                              >
                                <X size={14} />
                                <span className="ml-1">Reject All</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[10px] italic">
                              Mixed status - use individual actions
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedBookingForInvoice && selectedBookingForInvoice.length > 0 && (
        <InvoiceModal 
          bookings={selectedBookingForInvoice}
          onClose={() => setSelectedBookingForInvoice(null)}
        />
      )}
    </div>
  );
};

export default Approval;