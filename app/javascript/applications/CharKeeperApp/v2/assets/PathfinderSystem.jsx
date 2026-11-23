export const PathfinderSystem = (props) => (
  <svg
    width={props.width || props.size || 24}
    height={props.height || props.size || 24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
    <path d="M15.7 8.3L14 14L8.3 15.7L10 10L15.7 8.3Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M12 3V5M12 19V21M3 12H5M19 12H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
  </svg>
);
