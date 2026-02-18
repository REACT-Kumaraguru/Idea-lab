import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle, XCircle, Camera, Loader2, ShieldCheck } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";

const QR_READER_ID = "qr-reader";

export default function QRScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const html5QrcodeRef = useRef(null);
  const onScanSuccessRef = useRef(null);

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

  useEffect(() => {
    if (!scanning) return;

    setCameraError("");
    let mounted = true;
    let html5QrCode = null;

    const startCamera = async () => {
      try {
        // Check if HTTPS or localhost
        const isSecure = window.location.protocol === "https:" || 
                         window.location.hostname === "localhost" || 
                         window.location.hostname === "127.0.0.1";
        
        if (!isSecure) {
          const msg = "Camera requires HTTPS or localhost. Access via https:// or use localhost.";
          setCameraError(msg);
          setScanning(false);
          toast.error(msg);
          return;
        }

        // Request camera permission first
        const cameras = await Html5Qrcode.getCameras();
        if (!mounted || !cameras || cameras.length === 0) {
          setCameraError("No camera found. Please ensure your device has a camera and allow camera access.");
          setScanning(false);
          return;
        }

        // Prefer back camera on mobile, front camera on desktop
        let cameraId = cameras[0].id;
        if (cameras.length > 1) {
          // Try to find back camera (mobile)
          const backCamera = cameras.find((c) => {
            const label = (c.label || "").toLowerCase();
            return label.includes("back") || 
                   label.includes("rear") || 
                   label.includes("environment") ||
                   label.includes("facing back");
          });
          
          if (backCamera) {
            cameraId = backCamera.id;
          } else {
            // On desktop, prefer the first camera
            cameraId = cameras[0].id;
          }
        }

        const element = document.getElementById(QR_READER_ID);
        if (!element || !mounted) {
          setScanning(false);
          return;
        }

        html5QrCode = new Html5Qrcode(QR_READER_ID);
        html5QrcodeRef.current = html5QrCode;

        // Better config for mobile devices
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const config = {
          fps: isMobile ? 5 : 10, // Lower FPS on mobile for better performance
          qrbox: isMobile 
            ? { width: Math.min(300, window.innerWidth * 0.8), height: Math.min(300, window.innerWidth * 0.8) }
            : { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          cameraId,
          config,
          (decodedText) => {
            if (!onScanSuccessRef.current) return;
            onScanSuccessRef.current(decodedText);
          },
          () => {}
        );
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
                    if (!onScanSuccessRef.current) return;
                    onScanSuccessRef.current(decodedText);
                  },
                  () => {}
                );
                return; // Success with fallback
              }
            }
          } catch (fallbackErr) {
            msg = "Could not access camera. Ensure HTTPS or localhost and allow camera permission.";
          }
        } else {
          const isSecure = window.location.protocol === "https:" || 
                           window.location.hostname === "localhost" || 
                           window.location.hostname === "127.0.0.1";
          if (!isSecure) {
            msg = "Camera requires HTTPS or localhost. Access via https:// or use localhost.";
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
    if (verifying) return;
    try {
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
      } else {
        setScanResult({
          success: false,
          message: res.data?.message || "Verification failed",
        });
        toast.error(res.data?.message || "Verification failed");
      }
    } catch (err) {
      setScanResult({
        success: false,
        message: err.response?.data?.message || "Failed to verify QR code",
      });
      toast.error(err.response?.data?.message || "Failed to verify QR code");
    } finally {
      setVerifying(false);
    }
  };

  onScanSuccessRef.current = handleScanSuccess;

  const startScanning = () => {
    setScanResult(null);
    setCameraError("");
    setScanning(true);
  };

  const reset = () => {
    stopScanning();
    setScanResult(null);
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
         window.location.hostname !== "127.0.0.1" && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              ⚠️ <strong>Camera requires HTTPS:</strong> Access via <code className="bg-yellow-100 px-1 rounded">https://</code> or use <code className="bg-yellow-100 px-1 rounded">localhost</code> for camera to work.
            </p>
          </div>
        )}
      </div>

      {!scanning && !scanResult && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="text-center py-8">
            <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to scan
            </h3>
            <p className="text-gray-600 mb-6">
              Click the button below to start. You may be asked to allow camera access.
            </p>
            <button
              onClick={startScanning}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              <Camera className="w-5 h-5" />
              Start Scanner
            </button>
          </div>
        </div>
      )}

      {scanning && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Scanning...</h3>
            <button
              onClick={stopScanning}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Stop Scanner
            </button>
          </div>
          {cameraError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {cameraError}
            </div>
          )}
          <div id={QR_READER_ID} className="w-full min-h-[250px]" />
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
