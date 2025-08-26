import React, { JSX } from "react";

const GridWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-full grid grid-cols-12 h-full">{children}</div>;
};

export default GridWrapper;
