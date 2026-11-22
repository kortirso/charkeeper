export const Arrow = (props) => (
  <svg
    width={props.width || props.size || 24}
    height={props.height || props.size || 24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    classList={{
      'rotate-0': props.back,
      'rotate-90': props.top,
      'rotate-180': props.forward,
      '-rotate-90': props.bottom
    }}
  >
    <path
      d="M19 12H5M11 18L5 12L11 6"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
