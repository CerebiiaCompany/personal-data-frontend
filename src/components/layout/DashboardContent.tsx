"use client";

import React from "react";
import { usePathname } from "next/navigation";

const DashboardContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto scrollbar-gutter bg-[#F4F7FC]"
      id="scrollContainer"
    >
      <div
        key={pathname}
        className="page-transition-enter flex min-h-0 min-w-0 flex-1 flex-col"
      >
        {children}
      </div>
    </div>
  );
};

export default DashboardContent;
