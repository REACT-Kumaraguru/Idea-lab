import os
import sys
import time
import subprocess
import webbrowser
import signal

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(base_dir, "backend")
    frontend_dir = os.path.join(base_dir, "frontend")

    print("=" * 60)
    print(" AICTE IDEA LAB v5 -- Unified Launcher")
    print("=" * 60)
    print(f"[+] Base Directory: {base_dir}")
    print(f"[+] Backend Path:   {backend_dir}")
    print(f"[+] Frontend Path:  {frontend_dir}")
    print("-" * 60)

    # Shell flag for Windows
    is_windows = sys.platform.startswith("win")

    # Start Backend
    print("[1/3] Starting Backend Server (Port 5003)...")
    backend_cmd = "npm.cmd run dev" if is_windows else "npm run dev"
    backend_process = subprocess.Popen(
        backend_cmd,
        cwd=backend_dir,
        shell=is_windows
    )

    # Start Frontend
    print("[2/3] Starting Frontend Server (Port 5205)...")
    frontend_cmd = "npx.cmd vite --port 5205 --host" if is_windows else "npx vite --port 5205 --host"
    frontend_process = subprocess.Popen(
        frontend_cmd,
        cwd=frontend_dir,
        shell=is_windows
    )

    time.sleep(3)
    target_url = "http://localhost:5205/"
    print(f"[3/3] Opening Web Browser at {target_url}...")
    try:
        webbrowser.open(target_url)
    except Exception as e:
        print(f"[!] Note: Could not auto-open browser: {e}")

    print("\n" + "=" * 60)
    print(" Idealab_v5 is running live!")
    print(" ->  Frontend: http://localhost:5205/")
    print(" ->  Backend:  http://localhost:5003/")
    print(" Press Ctrl+C to terminate both servers.")
    print("=" * 60 + "\n")

    def signal_handler(sig, frame):
        print("\n[!] Shutting down servers gracefully...")
        try:
            if is_windows:
                subprocess.call(f"taskkill /F /T /PID {backend_process.pid}", shell=True)
                subprocess.call(f"taskkill /F /T /PID {frontend_process.pid}", shell=True)
            else:
                backend_process.terminate()
                frontend_process.terminate()
        except Exception as err:
            print(f"Error during shutdown: {err}")
        print("Bye!")
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        while True:
            time.sleep(1)
            # Check if processes crashed prematurely
            if backend_process.poll() is not None:
                print("[!] Backend process stopped unexpectedly.")
                break
            if frontend_process.poll() is not None:
                print("[!] Frontend process stopped unexpectedly.")
                break
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    main()
