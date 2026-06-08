import Link from "next/link";

export default function ServerWidget({
  url,
  serverName,
  logo,
  color,
}: {
  url: string;
  serverName: string;
  logo?: string;
  color?: string;
}) {
  return (
    <div
      className={`group relative inline-block h-[2.5rem] w-[2.5rem] bg-[${color || "cornflowerblue"}] rounded-[10%]`}
    >
      <Link
        href={url}
        className="absolute inset-0 text-[1.5rem] cursor-pointer flex items-center justify-center"
      >
        {logo}
      </Link>

      <span className="pointer-events-none invisible absolute left-[calc(100%+8px)] top-1/2 w-[130px] -translate-y-1/2 rounded-[6px] bg-[DimGray] px-[0] py-[5px] text-center text-[#fff] opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 z-[999]">
        {serverName}
      </span>
    </div>
  );
}
