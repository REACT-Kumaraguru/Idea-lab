import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle, XCircle, Camera, Loader2, ShieldCheck, ChevronDown, Upload, Image as ImageIcon } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";

const QR_READER_ID = "qr-reader";

export default function QRScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const [cameraLabel, setCameraLabel] = useState("");
  const [showCameraSelector, setShowCameraSelector] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const html5QrcodeRef = useRef(null);
  const onScanSuccessRef = useRef(null);
  const cameraSelectorRef = useRef(null);
  const fileInputRef = useRef(null);
  const scannedQRRef = useRef(null); // Track last scanned QR code to prevent duplicates
  const scannedBookingIdRef = useRef(null); // Track booking ID to prevent duplicate verifications
  const isProcessingRef = useRef(false); // Prevent multiple simultaneous scans

  // Close camera selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cameraSelectorRef.current && !cameraSelectorRef.current.contains(event.target)) {
        setShowCameraSelector(false);
      }
    };

    if (showCameraSelector) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showCameraSelector]);

  const stopScanning = () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      html5QrcodeRef.current
        .stop()
        .then(() => {
          html5QrcodeRef.current.clear();
          html5QrcodeRef.current = null;
        })
        .catch((err) => console.warn("Stop scanner error:", err));
    } else if (html5QrcodeRef.current) {
      html5QrcodeRef.current.clear();
      html5QrcodeRef.current = null;
    }
    setScanning(false);
    setScanResult(null);
    setCameraError("");
  };

  // Function to get cameras with labels using enumerateDevices
  const getCamerasWithLabels = async () => {
    try {
      // First request permission to get device labels
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the temporary stream
      stream.getTracks().forEach(track => track.stop());
      
      // Now enumerate devices to get labels
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
      
      return videoDevices.map((device, index) => ({
        id: device.deviceId,
        label: device.label || `Camera ${index + 1}`,
      }));
    } catch (err) {
      // Fallback to Html5Qrcode.getCameras if enumerateDevices fails
      const cameras = await Html5Qrcode.getCameras();
      return cameras.map((camera, index) => ({
        id: camera.id,
        label: camera.label || `Camera ${index + 1}`,
      }));
    }
  };

  // Function to find the best camera (Camo > Back > First available)
  const findBestCamera = (cameras) => {
    if (!cameras || cameras.length === 0) return null;

    // Priority 1: Find Camo camera
    const camoCamera = cameras.find((c) => {
      const label = (c.label || "").toLowerCase();
      return label.includes("camo");
    });
    if (camoCamera) return camoCamera;

    // Priority 2: Find back camera (mobile)
    const backCamera = cameras.find((c) => {
      const label = (c.label || "").toLowerCase();
      return label.includes("back") || 
             label.includes("rear") || 
             label.includes("environment") ||
             label.includes("facing back");
    });
    if (backCamera) return backCamera;

    // Priority 3: First available camera
    return cameras[0];
  };

  // Function to start camera with specific camera ID
  const startCameraWithId = async (cameraId, cameras) => {
    const element = document.getElementById(QR_READER_ID);
    if (!element) {
      setScanning(false);
      return;
    }

    const html5QrCode = new Html5Qrcode(QR_READER_ID);
    html5QrcodeRef.current = html5QrCode;

    // Better config for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const config = {
      fps: isMobile ? 5 : 10,
      qrbox: isMobile 
        ? { width: Math.min(300, window.innerWidth * 0.8), height: Math.min(300, window.innerWidth * 0.8) }
        : { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    await html5QrCode.start(
      cameraId,
      config,
      (decodedText) => {
        // Only process if callback is available and not already processing
        if (!onScanSuccessRef.current || isProcessingRef.current) return;
        // Prevent duplicate scans of the same QR code
        if (scannedQRRef.current === decodedText) return;
        onScanSuccessRef.current(decodedText);
      },
      () => {}
    );

    // Update camera label
    const selectedCamera = cameras.find(c => c.id === cameraId);
    if (selectedCamera) {
      setCameraLabel(selectedCamera.label);
      setSelectedCameraId(cameraId);
    }
  };

  useEffect(() => {
    if (!scanning) return;

    setCameraError("");
    let mounted = true;
    let html5QrCode = null;

    const startCamera = async () => {
      try {
        // Check if HTTPS or localhost or production domain
        const isSecure = window.location.protocol === "https:" || 
                         window.location.hostname === "localhost" || 
                         window.location.hostname === "127.0.0.1" ||
                         window.location.hostname === "idealab.kct.ac.in";
        
        if (!isSecure) {
          const msg = "Camera requires HTTPS or a trusted host (localhost / idealab.kct.ac.in). Access via https:// or use a supported host.";
          setCameraError(msg);
          setScanning(false);
          toast.error(msg);
          return;
        }

        // Get cameras with labels
        const cameras = await getCamerasWithLabels();
        if (!mounted || !cameras || cameras.length === 0) {
          setCameraError("No camera found. Please ensure your device has a camera and allow camera access.");
          setScanning(false);
          return;
        }

        // Store available cameras
        setAvailableCameras(cameras);

        // Find best camera (Camo > Back > First)
        const bestCamera = findBestCamera(cameras);
        if (!bestCamera) {
          setCameraError("No suitable camera found.");
          setScanning(false);
          return;
        }

        // Start camera with best camera
        await startCameraWithId(bestCamera.id, cameras);

      } catch (err) {
        if (!mounted) return;
        console.error("Camera error:", err);
        
        let msg = "Could not access camera.";
        
        if (err?.message?.includes("NotAllowedError") || err?.name === "NotAllowedError") {
          msg = "Camera access denied. Please allow camera permission in your browser settings and reload the page.";
        } else if (err?.message?.includes("NotFoundError") || err?.name === "NotFoundError") {
          msg = "No camera found on this device.";
        } else if (err?.message?.includes("NotReadableError") || err?.name === "NotReadableError") {
          msg = "Camera is already in use by another application. Please close other apps using the camera.";
        } else if (err?.message?.includes("OverconstrainedError") || err?.name === "OverconstrainedError") {
          msg = "Camera doesn't support required settings. Trying alternative camera...";
          // Try with default camera
          try {
            const cameras = await Html5Qrcode.getCameras();
            if (cameras && cameras.length > 0) {
              const element = document.getElementById(QR_READER_ID);
              if (element && mounted) {
                html5QrCode = new Html5Qrcode(QR_READER_ID);
                html5QrcodeRef.current = html5QrCode;
                await html5QrCode.start(
                  cameras[0].id,
                  { fps: 10, qrbox: { width: 250, height: 250 } },
                  (decodedText) => {
                    // Only process if callback is available and not already processing
                    if (!onScanSuccessRef.current || isProcessingRef.current) return;
                    // Prevent duplicate scans of the same QR code
                    if (scannedQRRef.current === decodedText) return;
                    onScanSuccessRef.current(decodedText);
                  },
                  () => {}
                );
                return; // Success with fallback
              }
            }
          } catch (fallbackErr) {
            msg = "Could not access camera. Ensure HTTPS or a trusted host and allow camera permission.";
          }
        } else {
          const isSecure = window.location.protocol === "https:" || 
                           window.location.hostname === "localhost" || 
                           window.location.hostname === "127.0.0.1" ||
                           window.location.hostname === "idealab.kct.ac.in";
          if (!isSecure) {
            msg = "Camera requires HTTPS or a trusted host (localhost / idealab.kct.ac.in). Access via https:// or use a supported host.";
          } else {
            msg = `Camera error: ${err?.message || "Unknown error"}. Ensure camera permission is granted.`;
          }
        }
        
        setCameraError(msg);
        setScanning(false);
        toast.error(msg);
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {});
        html5QrCode.clear();
      }
      html5QrcodeRef.current = null;
    };
  }, [scanning]);

  const handleScanSuccess = async (decodedText) => {
    // Prevent multiple scans of the same QR code or simultaneous processing
    if (verifying || isProcessingRef.current) return;
    
    // Prevent scanning the same QR code multiple times
    if (scannedQRRef.current === decodedText) {
      return;
    }

    // Extract booking ID from QR code to check for duplicate bookings
    try {
      const parsedData = typeof decodedText === "string" ? JSON.parse(decodedText) : decodedText;
      const bookingId = parsedData?.bookingId;
      
      // Prevent scanning the same booking ID multiple times
      if (bookingId && scannedBookingIdRef.current === bookingId) {
        toast.error("This booking has already been scanned");
        return;
      }
    } catch (e) {
      // If parsing fails, continue with verification (backend will handle validation)
    }

    try {
      // Mark as processing and store scanned QR
      isProcessingRef.current = true;
      scannedQRRef.current = decodedText;
      
      // Extract and store booking ID
      try {
        const parsedData = typeof decodedText === "string" ? JSON.parse(decodedText) : decodedText;
        if (parsedData?.bookingId) {
          scannedBookingIdRef.current = parsedData.bookingId;
        }
      } catch (e) {
        // Ignore parsing errors here, backend will validate
      }
      
      // Stop scanner immediately to prevent multiple scans
      setScanning(false);
      setVerifying(true);
      
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        await html5QrcodeRef.current.stop();
        html5QrcodeRef.current.clear();
        html5QrcodeRef.current = null;
      }

      const res = await axiosInstance.post("/bookings/verify-qr", {
        qrData: decodedText,
      });

      if (res.data?.success) {
        setScanResult({
          success: true,
          booking: res.data.data,
          message: res.data.message,
        });
        toast.success("Booking marked as verified!");
        // Keep scannedQRRef set to prevent re-scanning the same QR code
        // Only reset when user clicks "Scan Another"
      } else {
        setScanResult({
          success: false,
          message: res.data?.message || "Verification failed",
        });
        toast.error(res.data?.message || "Verification failed");
        // Reset scanned QR on failure so user can retry
        scannedQRRef.current = null;
        scannedBookingIdRef.current = null;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to verify QR code";
      setScanResult({
        success: false,
        message: errorMessage,
      });
      toast.error(errorMessage);
      
      // If already verified error, keep the scanned QR reference to prevent re-scanning
      if (errorMessage.includes("already been verified")) {
        // Keep scannedQRRef and scannedBookingIdRef set to prevent re-scanning
      } else {
        // Reset scanned QR on other errors so user can retry
        scannedQRRef.current = null;
        scannedBookingIdRef.current = null;
      }
    } finally {
      setVerifying(false);
      isProcessingRef.current = false;
    }
  };

  onScanSuccessRef.current = handleScanSuccess;

  const startScanning = () => {
    setScanResult(null);
    setCameraError("");
    scannedQRRef.current = null; // Reset scanned QR when starting new scan
    scannedBookingIdRef.current = null; // Reset booking ID when starting new scan
    isProcessingRef.current = false; // Reset processing flag
    setScanning(true);
  };

  const reset = () => {
    stopScanning();
    setScanResult(null);
    setSelectedCameraId(null);
    setCameraLabel("");
    setUploadingImage(false);
    scannedQRRef.current = null; // Reset scanned QR
    scannedBookingIdRef.current = null; // Reset booking ID
    isProcessingRef.current = false; // Reset processing flag
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const switchCamera = async (newCameraId) => {
    if (!scanning || !html5QrcodeRef.current) return;

    try {
      // Stop current scanner
      if (html5QrcodeRef.current.isScanning) {
        await html5QrcodeRef.current.stop();
        html5QrcodeRef.current.clear();
      }

      // Start with new camera
      await startCameraWithId(newCameraId, availableCameras);
      setShowCameraSelector(false);
      toast.success("Camera switched successfully");
    } catch (err) {
      console.error("Camera switch error:", err);
      toast.error("Failed to switch camera. Please try again.");
    }
  };

  // Function to scan QR code from uploaded image
  const scanImageFile = async (file) => {
    if (!file) return;

    try {
      setUploadingImage(true);
      setPreviewImage(URL.createObjectURL(file));

      // Ensure the QR reader element exists (create hidden one if needed)
      let element = document.getElementById(QR_READER_ID);
      if (!element) {
        element = document.createElement('div');
        element.id = QR_READER_ID;
        element.style.display = 'none';
        document.body.appendChild(element);
      }

      // Create Html5Qrcode instance for file scanning
      const html5QrCode = new Html5Qrcode(QR_READER_ID);
      
      // Scan the file
      const decodedText = await html5QrCode.scanFile(file, true);
      
      // Clean up the Html5Qrcode instance
      html5QrCode.clear();
      
      // Process the scanned QR code
      if (decodedText) {
        await handleScanSuccess(decodedText);
        // Clean up preview image after successful scan
        if (previewImage) {
          URL.revokeObjectURL(previewImage);
        }
        setPreviewImage(null);
      } else {
        toast.error("Could not read QR code from image. Please try another image.");
        setUploadingImage(false);
        if (previewImage) {
          URL.revokeObjectURL(previewImage);
        }
        setPreviewImage(null);
      }
    } catch (err) {
      console.error("Image scan error:", err);
      let errorMsg = "Failed to scan QR code from image.";
      
      if (err?.message?.includes("No QR code found") || err?.message?.includes("QR code parse error")) {
        errorMsg = "No QR code found in the image. Please ensure the image contains a clear QR code.";
      } else if (err?.message?.includes("file format") || err?.message?.includes("Invalid")) {
        errorMsg = "Invalid image format. Please upload a valid image file (PNG, JPG, etc.).";
      }
      
      toast.error(errorMsg);
      setUploadingImage(false);
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      setPreviewImage(null);
    }
  };

  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file.");
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size should be less than 10MB.");
        return;
      }
      
      scanImageFile(file);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      scanImageFile(file);
    } else {
      toast.error("Please drop an image file.");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">QR Code Scanner</h1>
        <p className="text-gray-600 text-sm mt-0.5">
          Scan booking QR codes to verify reservations.
        </p>
        {window.location.protocol !== "https:" && 
         window.location.hostname !== "localhost" && 
         window.location.hostname !== "127.0.0.1" &&
         window.location.hostname !== "213.210.37.189" && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              ⚠️ <strong>Camera requires HTTPS:</strong> Access via <code className="bg-yellow-100 px-1 rounded">https://</code> or use <code className="bg-yellow-100 px-1 rounded">localhost</code> / <code className="bg-yellow-100 px-1 rounded">213.210.37.189</code> for camera to work.
            </p>
          </div>
        )}
      </div>

      {!scanning && !scanResult && !uploadingImage && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="text-center py-8">
            <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to scan
            </h3>
            <p className="text-gray-600 mb-6">
              Scan QR codes using your camera or upload an image containing a QR code.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={startScanning}
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                <Camera className="w-5 h-5" />
                Start Camera Scanner
              </button>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="qr-image-upload"
                />
                <label
                  htmlFor="qr-image-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Upload className="w-5 h-5" />
                  Upload QR Image
                </label>
              </div>
            </div>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="mt-6 p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 transition-colors"
            >
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                Or drag and drop an image here
              </p>
              <p className="text-xs text-gray-400">
                Supports PNG, JPG, JPEG (Max 10MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {uploadingImage && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-8">
            {previewImage && (
              <div className="mb-6 max-w-md">
                <img
                  src={previewImage}
                  alt="QR Code preview"
                  className="max-w-full h-auto rounded-lg border border-gray-200"
                />
              </div>
            )}
            <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
            <p className="text-gray-600">Scanning QR code from image...</p>
          </div>
        </div>
      )}

      {scanning && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-semibold text-gray-900">Scanning...</h3>
              </div>
              {cameraLabel && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {cameraLabel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {availableCameras.length > 1 && (
                <div className="relative" ref={cameraSelectorRef}>
                  <button
                    onClick={() => setShowCameraSelector(!showCameraSelector)}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Camera className="w-4 h-4" />
                    Switch Camera
                    <ChevronDown className={`w-4 h-4 transition-transform ${showCameraSelector ? 'rotate-180' : ''}`} />
                  </button>
                  {showCameraSelector && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="py-1">
                        {availableCameras.map((camera) => (
                          <button
                            key={camera.id}
                            onClick={() => switchCamera(camera.id)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                              selectedCameraId === camera.id ? 'bg-teal-50 text-teal-700' : 'text-gray-700'
                            }`}
                          >
                            <span>{camera.label}</span>
                            {selectedCameraId === camera.id && (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={stopScanning}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Stop Scanner
              </button>
            </div>
          </div>
          {cameraError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {cameraError}
            </div>
          )}
          <div className="relative w-full flex justify-center">
            <div className="relative inline-block w-full max-w-2xl">
              {/* Scanner frame overlay */}
              <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-teal-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-teal-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-teal-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-teal-500 rounded-br-lg"></div>
              </div>
              {/* Scanning line animation */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-teal-500 opacity-50 animate-pulse z-10"></div>
              <div 
                id={QR_READER_ID} 
                className="w-full min-h-[400px] rounded-lg overflow-hidden bg-black"
                style={{ position: 'relative' }}
              />
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            Position the QR code within the frame
          </p>
        </div>
      )}

      {verifying && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
            <p className="text-gray-600">Verifying and marking as verified...</p>
          </div>
        </div>
      )}

      {scanResult && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start gap-4">
            {scanResult.success ? (
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            ) : (
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            )}
            <div className="flex-1">
              <h3
                className={`text-lg font-semibold mb-2 ${
                  scanResult.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {scanResult.success ? "Verified" : "Verification Failed"}
              </h3>
              {scanResult.success && (
                <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  Booking marked as verified — user will see a tick in My Reserve
                </div>
              )}
              <p className="text-sm text-gray-600 mb-4">{scanResult.message}</p>

              {scanResult.success && scanResult.booking && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Equipment
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {scanResult.booking.equipment?.equipmentName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {scanResult.booking.equipment?.brandName}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Booking Date
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(scanResult.booking.bookingDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Time
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {String(scanResult.booking.bookingTime).slice(0, 5)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Duration
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {scanResult.booking.duration} hour(s)
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Status
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-800">
                        {scanResult.booking.verifiedAt && (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        Verified
                      </span>
                    </div>
                  </div>
                  {scanResult.booking.user && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Booked By
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {scanResult.booking.user.fullName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {scanResult.booking.user.email}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={reset}
                  className="flex-1 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                >
                  Scan Another
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
