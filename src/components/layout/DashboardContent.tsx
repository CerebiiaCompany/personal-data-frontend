import React from "react";

const DashboardContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="col-span-8 overflow-y-auto">{children}</div>;
};

export default DashboardContent;
