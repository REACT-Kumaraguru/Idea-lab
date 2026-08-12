import React from "react";
import HackathonAuthGate from "./HackathonAuthGate";
import HackathonLayout from "./HackathonLayout";

const HackathonProtectedPage = ({ allowedRoles, children }) => {
  return (
    <HackathonAuthGate allowedRoles={allowedRoles}>
      <HackathonLayout>{children}</HackathonLayout>
    </HackathonAuthGate>
  );
};

export default HackathonProtectedPage;

