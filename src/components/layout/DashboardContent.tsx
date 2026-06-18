"use client";

import AnimatedRoute from "@/components/layout/AnimatedRoute";

const DashboardContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto scrollbar-gutter bg-[#F4F7FC]"
      id="scrollContainer"
    >
      <AnimatedRoute>{children}</AnimatedRoute>
    </div>
  );
};

export default DashboardContent;
