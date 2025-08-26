import Image from "next/image";
import React from "react";
import LogoCerebiia from "@public/logo.svg";
import Link from "next/link";
import { Icon } from "@iconify/react";

const DashboardNavbar = () => {
  return (
    <nav className="col-span-3 flex flex-col bg-primary-50 px-5 py-10 gap-10">
      <div className="w-full flex justify-center">
        <Image
          src={LogoCerebiia}
          width={200}
          alt="Logo de Plataforma de Datos de Cerebiia"
          className="w-3/4"
        />
      </div>

      <div className="flex-1">
        <p className="pl-4 font-bold">Menú</p>
        <ul className="flex flex-col items-start gap-4">
          <li>
            <Link href={"/"} className="flex items-center gap-2">
              <Icon icon="mdi-light:alert" />
              Inicio
            </Link>
          </li>
          <li>
            <Link href={"/"} className="flex items-center gap-2">
              <Icon icon="mdi-light:alert" />
              Recolección
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
