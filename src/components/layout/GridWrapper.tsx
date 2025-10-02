import React, { JSX } from "react";

const GridWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-full flex h-full">{children}</div>;
};

export default GridWrapper;
