export default function ProfilePicture({
  username = "?",
  size = 2,
}: {
  username: string;
  size?: number;
}) {
  const firstChar = username?.charAt(0).toUpperCase() ?? "?";

  const colors = [
    "Black",
    "Blue",
    "BlueViolet",
    "Brown",
    "Chocolate",
    "CornflowerBlue",
    "Crimson",
    "DarkBlue",
    "DarkCyan",
    "DarkGoldenRod",
    "DarkGreen",
    "DarkMagenta",
    "DarkOliveGreen",
    "DarkOrchid",
    "DarkRed",
    "DarkSlateBlue",
    "DarkSlateGray",
    "DarkTurquoise",
    "DarkViolet",
    "DeepPink",
    "DimGray",
    "DodgerBlue",
    "FireBrick",
    "ForestGreen",
    "Fuchsia",
    "GoldenRod",
    "HotPink",
    "IndianRed",
    "Indigo",
    "LimeGreen",
    "Maroon",
    "MediumBlue",
    "MediumOrchid",
    "MediumPurple",
    "MediumSeaGreen",
    "MediumSlateBlue",
    "MediumVioletRed",
    "MidnightBlue",
    "Navy",
    "OliveDrab",
    "OrangeRed",
    "Purple",
    "RebeccaPurple",
    "Red",
    "RoyalBlue",
    "SaddleBrown",
    "SeaGreen",
    "Sienna",
    "SlateBlue",
    "SteelBlue",
    "Teal",
    "Tomato",
  ];

  const colorIndex = username.charCodeAt(0) % colors.length;
  const backgroundColor = colors[colorIndex];

  return (
    <div
      className={`flex items-center justify-center rounded-full w-[${size}rem] h-[${size}rem]`}
      style={{ backgroundColor }}
    >
      <div className={`text-white font-bold text-[${size / 2}rem]`}>
        {firstChar}
      </div>
    </div>
  );
}
