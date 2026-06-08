import { useState } from "react";

export default function CreateServerForm({
  setServerType,
  setServerName,
}: {
  setServerType: (type: boolean) => void;
  setServerName: (name: string) => void;
}) {
  const [pageIndex, setPageIndex] = useState(0);
  return (
    <div className="w-full h-full flex items-center justify-center">
      {pageIndex === 0 && <div></div>}
    </div>
  );
}
