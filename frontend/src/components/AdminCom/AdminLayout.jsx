import React from "react";
import {Sidebar} from "./SideBar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content - ml-16 clears fixed sidebar */}
      <div className="flex-1 ml-16 p-6 bg-gray-50 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
