export function PieChartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" />
      <path
        d="M12 2 A10 10 0 0 1 22 12 L12 12 Z"
        fill="currentColor"
        fillOpacity="0.3"
      />
      <path
        d="M12 12 L22 12 A10 10 0 0 1 12 22 Z"
        fill="currentColor"
        fillOpacity="0.5"
      />
      <path
        d="M12 12 L12 22 A10 10 0 0 1 2 12 Z"
        fill="currentColor"
        fillOpacity="0.7"
      />
      <path d="M12 2 L12 12 L22 12" stroke="currentColor" fill="none" />
    </svg>
  );
}
