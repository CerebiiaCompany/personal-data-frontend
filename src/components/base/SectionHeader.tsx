"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";
import { NAVBAR_DATA } from "@/constants/navbarData";
import Link from "next/link";
import SectionSearchBar from "./SectionSearchBar";
import { useSessionStore } from "@/store/useSessionStore";
import { SUPERADMIN_NAVBAR_DATA } from "@/constants/superadminNavbarData";

interface Props {
  dynamicEndpoint?: string;
  search?: string;
  onSearchChange?: (q: string) => void;
}

const SectionHeader = ({ dynamicEndpoint, search, onSearchChange }: Props) => {
  const pathname = usePathname();
  const paths = pathname.split("/");
  paths.shift();
  const pathsLength = paths.length;
  const user = useSessionStore((store) => store.user);
  const navbarData =
    user?.role === "SUPERADMIN" ? SUPERADMIN_NAVBAR_DATA : NAVBAR_DATA;

  const formattedPaths = [];

  for (let i = 0; i < pathsLength; i++) {
    formattedPaths.push(paths.join("/"));
    paths.pop();
  }

  return (
    <header className="w-full flex flex-col gap-3 sm:gap-4 md:gap-6 pt-4 sm:pt-5 md:pt-6">
      {/* Search bar */}
      {search != undefined && onSearchChange && (
        <nav className="w-full flex gap-2 justify-center px-3 sm:px-4 items-stretch">
          <SectionSearchBar search={search} onSearchChange={onSearchChange} />
        </nav>
      )}

      <nav className="w-full flex flex-col items-start gap-1">
        <div className="px-3 sm:px-4 md:px-5 flex items-center gap-1 flex-wrap">
          {formattedPaths.reverse().map((path, index) => {
            const pathData = navbarData.find((e) => e.path === `/${path}`);

            return (
              <React.Fragment key={path}>
                {(index != 0 && index < pathsLength) || !pathData ? (
                  <Icon
                    key={1}
                    icon={"tabler:chevron-right"}
                    className="text-base sm:text-lg md:text-xl flex-shrink-0"
                  />
                ) : null}
                <Link
                  className="font-normal text-base sm:text-lg md:text-xl text-primary-900 hover:underline"
                  href={pathData ? pathData.path : pathname}
                >
                  {pathData ? pathData.title : dynamicEndpoint}
                </Link>
              </React.Fragment>
            );
          })}
        </div>
        <span className="inline-block w-full h-1 sm:h-1.5 bg-primary-50" />
      </nav>
    </header>
  );
};

export default SectionHeader;
