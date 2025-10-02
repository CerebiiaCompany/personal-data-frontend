import React from "react";

const DashboardContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="flex-1 overflow-y-auto scrollbar-gutter"
      id="scrollContainer"
    >
      {children}
    </div>
  );
};

export default DashboardContent;
