import React from "react";
import {Sidebar} from "./SideBar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex bg-[#0a0809] min-h-screen text-stone-100 font-sans selection:bg-amber-400 selection:text-stone-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content - ml-16 clears fixed sidebar */}
      <div className="flex-1 ml-16 p-6 sm:p-8 bg-[#0a0809] min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
