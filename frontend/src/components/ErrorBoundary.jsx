import React from "react";
import { AlertTriangle, RefreshCw, LogOut } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleClearCacheAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      // ignore
    }
    window.location.href = "/Hackathon/login";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-2xl w-full bg-stone-900/90 border border-amber-500/30 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <h1 className="font-serif text-2xl uppercase tracking-wider text-rose-300">
                  Dashboard Render Error Encountered
                </h1>
                <p className="text-xs text-stone-400 font-sans mt-0.5">
                  An unexpected client-side exception occurred while rendering the page.
                </p>
              </div>
            </div>

            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 text-xs font-mono text-stone-300 overflow-x-auto max-h-48">
              <p className="font-bold text-rose-400">{this.state.error?.toString()}</p>
              {this.state.errorInfo?.componentStack && (
                <pre className="mt-2 text-[11px] text-stone-500 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 flex-wrap pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer border border-stone-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleClearCacheAndReload}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-stone-950 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition shadow-lg cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Clear Cache & Relogin</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
