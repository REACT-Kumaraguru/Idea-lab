import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEquipmentStore } from '../../../store/useEquipmentStore';
import { getImageUrl } from '../../../lib/config.js';

export default function NewEquipment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { createEquipment, updateEquipment, isCreatingEquipment, isUpdatingEquipment } = useEquipmentStore();

  // Check if we are in "Edit" mode
  const editingEquipment = location.state?.equipment;

  const [formData, setFormData] = useState({
    equipmentName: '',
    brandName: '',
    quantity: '',
    pricePerHour: '',
    equipmentDetails: '',
    isAvailable: true
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (editingEquipment) {
      setFormData({
        equipmentName: editingEquipment.equipmentName,
        brandName: editingEquipment.brandName,
        quantity: editingEquipment.quantity,
        pricePerHour: editingEquipment.pricePerHour ?? '',
        equipmentDetails: editingEquipment.equipmentDetails || '',
        isAvailable: editingEquipment.isAvailable
      });
      if (editingEquipment.image) {
        setImagePreview(getImageUrl(editingEquipment.image));
      }
    }
  }, [editingEquipment]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create FormData for multipart/form-data upload
    const data = new FormData();
    data.append('equipmentName', formData.equipmentName);
    data.append('brandName', formData.brandName);
    data.append('quantity', formData.quantity);
    if (formData.pricePerHour !== '') data.append('pricePerHour', formData.pricePerHour);
    data.append('equipmentDetails', formData.equipmentDetails);
    data.append('isAvailable', formData.isAvailable);

    if (imageFile) {
      data.append('image', imageFile);
    }

    let success = false;
    if (editingEquipment) {
      success = await updateEquipment(editingEquipment.id, data);
    } else {
      success = await createEquipment(data);
    }

    if (success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/admin/equipment');
      }, 2000);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate('/admin/equipment');
    }
  };

  const isSaving = isCreatingEquipment || isUpdatingEquipment;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
            {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
          </h1>
          <p className="text-slate-600 text-base lg:text-lg">
            {editingEquipment ? 'Update details below' : 'Fill in the details and see a live preview of your equipment'}
          </p>
        </div>

        {/* Split Layout - Form and Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section - Left Side */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-xl border border-slate-200 animate-scale-in h-fit">
            <form onSubmit={handleSubmit}>
              {/* Image Upload Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1 h-4 bg-emerald-500 rounded-sm"></span>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Equipment Image
                  </h2>
                </div>

                <div className="w-full">
                  {!imagePreview ? (
                    <label
                      htmlFor="imageUpload"
                      className="block w-full py-8 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 cursor-pointer transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-50/50 text-center group"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          className="w-10 h-10 text-emerald-500 mb-1 group-hover:scale-110 transition-transform"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-slate-900 block">
                          Click to upload image
                        </span>
                        <span className="text-xs text-slate-500 block">
                          PNG, JPG, WEBP
                        </span>
                      </div>
                      <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative w-full rounded-xl overflow-hidden border-2 border-slate-200">
                      <img
                        src={imagePreview}
                        alt="Equipment preview"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/90 hover:bg-red-600 border-none cursor-pointer flex items-center justify-center transition-all duration-300 backdrop-blur-sm hover:scale-110"
                      >
                        <svg
                          className="w-4 h-4 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Information Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1 h-4 bg-emerald-500 rounded-sm"></span>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Basic Information
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="equipmentName" className="block text-sm font-medium text-slate-900 mb-1.5">
                      Equipment Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="equipmentName"
                      name="equipmentName"
                      value={formData.equipmentName}
                      onChange={handleInputChange}
                      placeholder="Enter equipment name"
                      required
                      className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-lg bg-slate-50 text-slate-900 transition-all duration-300 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 hover:border-slate-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="brandName" className="block text-sm font-medium text-slate-900 mb-1.5">
                        Brand Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="brandName"
                        name="brandName"
                        value={formData.brandName}
                        onChange={handleInputChange}
                        placeholder="Enter brand"
                        required
                        className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-lg bg-slate-50 text-slate-900 transition-all duration-300 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 hover:border-slate-300"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-slate-900 mb-1.5">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          placeholder="0"
                          min="0"
                          required
                          className="w-full px-3 py-2.5 text-sm font-mono border-2 border-slate-200 rounded-lg bg-slate-50 text-slate-900 transition-all duration-300 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 hover:border-slate-300"
                        />
                      </div>

                      <div>
                        <label htmlFor="pricePerHour" className="block text-sm font-medium text-slate-900 mb-1.5">
                          Price per hour (₹)
                        </label>
                        <input
                          type="number"
                          id="pricePerHour"
                          name="pricePerHour"
                          value={formData.pricePerHour}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2.5 text-sm font-mono border-2 border-slate-200 rounded-lg bg-slate-50 text-slate-900 transition-all duration-300 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 hover:border-slate-300"
                        />
                        <p className="text-xs text-slate-500 mt-1">Used for hourly booking total.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment Details Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1 h-4 bg-emerald-500 rounded-sm"></span>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Equipment Details
                  </h2>
                </div>

                <div>
                  <label htmlFor="equipmentDetails" className="block text-sm font-medium text-slate-900 mb-1.5">
                    Equipment Details
                  </label>
                  <textarea
                    id="equipmentDetails"
                    name="equipmentDetails"
                    value={formData.equipmentDetails}
                    onChange={handleInputChange}
                    placeholder="Add specifications, model number, or any additional information..."
                    rows={4}
                    className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-lg bg-slate-50 text-slate-900 transition-all duration-300 outline-none resize-y focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 hover:border-slate-300"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Optional: Include model number, specifications, or notes
                  </p>
                </div>
              </div>

              {/* Availability Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1 h-4 bg-emerald-500 rounded-sm"></span>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Availability
                  </h2>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-2 border-slate-200 transition-all hover:border-slate-300">
                  <span className="font-medium text-slate-900 text-sm">Is Available</span>
                  <label className="relative inline-block w-12 h-7 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleInputChange}
                      className="opacity-0 w-0 h-0 peer"
                    />
                    <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-300 ${formData.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}>
                      <span className={`absolute h-5 w-5 left-1 top-1 bg-white rounded-full transition-transform duration-300 shadow-md ${formData.isAvailable ? 'translate-x-5' : 'translate-x-0'
                        }`}></span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Button Group */}
              <div className="flex gap-3 pt-6 border-t-2 border-slate-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 text-sm font-semibold border-2 border-slate-200 rounded-lg cursor-pointer bg-white text-slate-900 transition-all duration-300 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 text-sm font-semibold border-none rounded-lg cursor-pointer bg-emerald-500 text-white shadow-lg shadow-emerald-200 transition-all duration-300 hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : (editingEquipment ? 'Update Equipment' : 'Save Equipment')}
                </button>
              </div>
            </form>
          </div>

          {/* Preview Section - Right Side */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-xl border border-slate-200 animate-scale-in-delayed h-fit sticky top-8">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1 h-4 bg-blue-500 rounded-sm"></span>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Live Preview
              </h2>
            </div>

            {/* Preview Card */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-md overflow-hidden border border-slate-200 transition-all duration-300 hover:shadow-lg">
              {/* Image Preview */}
              <div className="relative h-56 bg-slate-200 overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Equipment preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-20 h-20 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}

                {/* Availability Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${formData.isAvailable
                      ? 'bg-emerald-500 text-white'
                      : 'bg-red-500 text-white'
                      }`}
                  >
                    {formData.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* Content Preview */}
              <div className="p-5">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {formData.equipmentName || 'Equipment Name'}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    {formData.brandName || 'Brand Name'}
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Quantity
                    </span>
                    <span className="px-2 py-0.5 bg-white text-slate-900 rounded-md text-sm font-bold font-mono border border-slate-200">
                      {formData.quantity || '0'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {formData.equipmentDetails || 'No details provided yet. Add specifications, model number, or additional information.'}
                  </p>
                </div>

                {/* Mock Action Buttons */}
              </div>
            </div>

            {/* Preview Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-700 flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>This is how your equipment will appear in the listing page. Fill in the form to see changes in real-time.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-6 right-6 bg-white p-5 px-6 rounded-xl shadow-2xl border-l-4 border-emerald-500 z-50 animate-slide-in">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              ✓
            </div>
            <div>
              <strong className="block text-slate-900">Success!</strong>
              <span className="text-slate-600 text-sm">Equipment has been {editingEquipment ? 'updated' : 'added'} successfully</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes scale-in-delayed {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(400px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }

        .animate-scale-in-delayed {
          animation: scale-in-delayed 0.5s ease-out 0.2s backwards;
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}