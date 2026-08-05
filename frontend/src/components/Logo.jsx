export default function Logo({ height = 28, color = "#5B9BD5" }) {
  return (
    <svg
      height={height}
      viewBox="0 0 320 40"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Omegation"
    >
      <text
        x="0"
        y="30"
        fontFamily="'Roboto', 'Helvetica', 'Arial', sans-serif"
        fontSize="34"
        fontWeight="400"
        letterSpacing="6"
        fill={color}
      >
        OMEGATION
      </text>
    </svg>
  );
}
