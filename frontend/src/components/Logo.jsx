export default function Logo({ height = 28, color = "#5B9BD5" }) {
  return (
    <svg
      height={height}
      viewBox="0 0 300 40"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Omegation"
    >
      <text
        x="0"
        y="29"
        fontFamily="'Georgia', 'Times New Roman', serif"
        fontSize="32"
        fontWeight="500"
        letterSpacing="3"
        fill={color}
      >
        OMEGATION
      </text>
    </svg>
  );
}
