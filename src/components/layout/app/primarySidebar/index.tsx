"use client";

import { Resizable } from "re-resizable";

const SIDEBAR_DEFAULT_WIDTH = 320;
const SIDEBAR_MIN_WIDTH = 192;
const SIDEBAR_MAX_WIDTH = 352;

export default function PrimarySidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Resizable
      defaultSize={{ width: SIDEBAR_DEFAULT_WIDTH }}
      minWidth={SIDEBAR_MIN_WIDTH}
      maxWidth={SIDEBAR_MAX_WIDTH}
      enable={{
        top: false,
        right: true,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      handleStyles={{
        right: {
          position: "absolute",
          top: "0",
          right: "-0.375rem",
          height: "100%",
          width: "0.75rem",
          cursor: "col-resize",
          userSelect: "none",
        },
      }}
      style={{ position: "relative" }}
      className="flex h-full shrink-0 items-center justify-start overflow-x-hidden [border-top:1px_solid_DimGray] [border-left:1px_solid_DimGray] rounded-tl-[8px] "
    >
      {children}
    </Resizable>
  );
}
