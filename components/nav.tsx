"use client";

import { UserButton } from "@clerk/nextjs";
import * as React from "react";

const NavBar: React.FC = () => {
  return (
    <nav className="p-4 flex justify-between items-center bg-white shadow-sm">
      <h1 className="font-bold text-xl text-blue-800">S3 UI</h1>
      <UserButton />
    </nav>
  );
};

export default NavBar;
