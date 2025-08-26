import React from "react";

const DashboardContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="col-san-9 overflow-y-auto p-8">{children}</div>;
};

export default DashboardContent;
