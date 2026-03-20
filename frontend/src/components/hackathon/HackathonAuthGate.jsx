import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";

const HackathonAuthGate = ({ allowedRoles, children }) => {
  const { hackathonUser, checkAuth, isCheckingAuth } = useHackathonAuthStore();

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="size-10 animate-spin text-blue-700" />
      </div>
    );
  }

  if (!hackathonUser) return <Navigate to="/hackathon/login" replace />;

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(hackathonUser.role)) {
    return <Navigate to="/hackathon" replace />;
  }

  return children;
};

export default HackathonAuthGate;

