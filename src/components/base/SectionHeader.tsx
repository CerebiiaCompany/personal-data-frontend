"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";
import { NAVBAR_DATA } from "@/constants/navbarData";
import Link from "next/link";

interface Props {
  dynamicEndpoint?: string;
}

const SectionHeader = ({ dynamicEndpoint }: Props) => {
  const pathname = usePathname();
  const paths = pathname.split("/");
  paths.shift();

  return (
    <header className="w-full flex flex-col gap-2">
      <nav className="w-full flex gap-2 justify-center px-3 py-6 items-stretch">
        <label className="flex max-w-4xl items-center rounded-lg gap-2 text-stone-600 border border-disabled flex-1 relative px-3 h-fit">
          <Icon icon={"tabler:search"} />
          <input type="text" placeholder="Buscar" className="w-full py-1.5" />
        </label>

        <div>
          <button className="relative h-full rounded-lg hover:bg-stone-200 transition-colors aspect-square grid place-content-center">
            <Icon icon={"tabler:bell"} className="text-2xl text-primary-900" />
            <span className="absolute inline-block top-1 right-1 bg-primary-500 rounded-full w-4 h-4"></span>
          </button>
        </div>
      </nav>

      <nav className="w-full flex flex-col items-start gap-1">
        {/* <h4 className="font-normal text-xl text-primary-900 px-5">
          {NAVBAR_DATA.find((e) => e.path === pathname)?.title}
        </h4> */}
        <div className="px-5 flex items-center gap-1">
          {paths.map((path, index) => {
            const pathData = NAVBAR_DATA.find((e) => e.path.includes(path));

            return (
              <React.Fragment key={path}>
                {(index != 0 && index < paths.length) || !pathData ? (
                  <Icon
                    key={1}
                    icon={"tabler:chevron-right"}
                    className="text-xl"
                  />
                ) : null}
                <Link
                  className="font-normal text-xl text-primary-900 hover:underline"
                  href={pathData ? pathData.path : pathname}
                >
                  {pathData ? pathData.title : dynamicEndpoint}
                </Link>
              </React.Fragment>
            );
          })}
        </div>
        <span className="inline-block w-full h-1.5 bg-primary-50" />
      </nav>
    </header>
  );
};

export default SectionHeader;
