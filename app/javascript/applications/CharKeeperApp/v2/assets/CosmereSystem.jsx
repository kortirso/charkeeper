export const CosmereSystem = (props) => (
  <svg
    width={props.width || props.size || 24}
    height={props.height || props.size || 24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="2.3" stroke="currentColor" stroke-width="1.8" />
    <ellipse cx="12" cy="12" rx="9" ry="4.2" stroke="currentColor" stroke-width="1.8" transform="rotate(-25 12 12)" />
    <ellipse cx="12" cy="12" rx="9" ry="4.2" stroke="currentColor" stroke-width="1.8" transform="rotate(65 12 12)" />
  </svg>
);
