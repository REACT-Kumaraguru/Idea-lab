import React, { useState } from 'react';
import { X, Printer, Download } from 'lucide-react';

const InvoiceModal = ({ booking, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  if (!booking) return null;

  // Calculate totals
  const subtotal = parseFloat(booking.totalAmount);
  const taxRate = 0; // 18% GST
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Generate invoice number
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(booking.id).padStart(4, '0')}`;
  const invoiceDate = new Date().toLocaleDateString('en-GB');
  const dueDate = new Date(booking.bookingDate).toLocaleDateString('en-GB');

  // Format time
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

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header - Only visible on screen */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center print:hidden">
            <h2 className="text-xl font-bold text-gray-900">Invoice Preview</h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                <Printer size={18} />
                Print Invoice
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Invoice Content - This will be printed */}
          <div className="p-8 print:p-0">
            <div className="invoice-content bg-white">
              
              {/* Header */}
              <div className="border-b-4 border-blue-600 pb-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-4xl font-bold text-blue-600 mb-2">INVOICE</h1>
                    <p className="text-gray-600 font-semibold">#{invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Equipment Rental Services</h2>
                    <p className="text-sm text-gray-600">Kumaraguru College of Technology</p>
                    <p className="text-sm text-gray-600">Coimbatore, Tamil Nadu - 641049</p>
                    <p className="text-sm text-gray-600 mt-2">Phone: +91 422 2669000</p>
                    <p className="text-sm text-gray-600">Email: info@kct.ac.in</p>
                    <p className="text-sm text-gray-600">GST: 33AABCK1234F1Z5</p>
                  </div>
                </div>
              </div>

              {/* Invoice Info & Bill To */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Bill To:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-bold text-gray-900 text-lg">{booking.user?.fullName || 'Customer'}</p>
                    <p className="text-sm text-gray-600 mt-1">{booking.user?.email || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Phone: +91 XXXXXXXXXX</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase">Invoice Date:</span>
                    <p className="text-gray-900 font-semibold">{invoiceDate}</p>
                  </div>
                  <div className="mb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase">Due Date:</span>
                    <p className="text-gray-900 font-semibold">{dueDate}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Booking ID:</span>
                    <p className="text-gray-900 font-semibold">#{booking.id}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="text-left py-3 px-4 text-xs uppercase font-bold">Item Description</th>
                      <th className="text-left py-3 px-4 text-xs uppercase font-bold">Date & Time</th>
                      <th className="text-center py-3 px-4 text-xs uppercase font-bold">Duration</th>
                      <th className="text-right py-3 px-4 text-xs uppercase font-bold">Rate</th>
                      <th className="text-right py-3 px-4 text-xs uppercase font-bold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900">{booking.equipment?.equipmentName || 'Equipment'}</div>
                        <div className="text-sm text-gray-600">{booking.equipment?.brandName || 'Brand'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">{new Date(booking.bookingDate).toLocaleDateString('en-GB')}</div>
                        <div className="text-xs text-gray-600">{formatTime(booking.bookingTime)} - {calculateEndTime(booking.bookingTime, booking.duration)}</div>
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-gray-900">{booking.duration} Hrs</td>
                      <td className="py-4 px-4 text-right text-sm text-gray-900">{formatCurrency(booking.totalAmount)}</td>
                      <td className="py-4 px-4 text-right font-bold text-gray-900">{formatCurrency(booking.totalAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-80">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">Tax (18% GST):</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between py-3 bg-blue-50 px-4 rounded-lg mt-2">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-blue-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {booking.notes && (
                <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="text-xs font-bold text-gray-700 mb-1">Notes:</p>
                  <p className="text-sm text-gray-600">{booking.notes}</p>
                </div>
              )}

              {/* Payment Instructions */}
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                <p className="text-xs font-bold text-gray-700 mb-2">Payment Instructions:</p>
                <p className="text-sm text-gray-600">Payment due within 7 days. Late payment subject to 2% monthly interest.</p>
              </div>

              {/* Terms & Conditions */}
              <div className="border-t pt-6">
                <h3 className="text-xs font-bold text-gray-700 uppercase mb-3">Terms & Conditions:</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Equipment must be returned in the same condition as received.</li>
                  <li>• Any damage to equipment will be charged separately.</li>
                  <li>• Booking cancellation must be done 24 hours in advance.</li>
                  <li>• No refund for cancellations made less than 24 hours before booking.</li>
                </ul>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t text-center">
                <p className="text-sm text-gray-500 italic">Thank you for your business!</p>
                <p className="text-xs text-gray-400 mt-2">This is a computer-generated invoice and does not require a signature.</p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-content,
          .invoice-content * {
            visibility: visible;
          }
          .invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          @page {
            margin: 0.5in;
          }
        }
      `}</style>
    </>
  );
};

export default InvoiceModal;