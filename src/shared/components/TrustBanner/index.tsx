import React from "react";
import { IconBuildingStore } from "@tabler/icons-react";
import { Pulse } from "../Pulse";

export const TrustBanner = () => {
  return (
    <div className="w-full bg-primary-container h-10 text-primary-fixed flex justify-between items-center gap-3 px-3">
      <div className="flex items-center gap-2">
        <Pulse />
        <p className="font-bold text-xs">PAGO SEGURO • COMPRA EN LÍNEA</p>
      </div>

      <div className="flex items-center gap-2">
        <IconBuildingStore size={18} aria-hidden />
        <p className="font-bold text-xs">Retiro en tienda</p>
      </div>
    </div>
  );
};
