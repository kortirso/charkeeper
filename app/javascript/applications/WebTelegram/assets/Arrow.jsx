export const Arrow = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class={props.rotated ? 'transition-transform rotate-180' : 'transition-transform rotate-0'}
  >
    <line x1="12" y1="4" x2="12" y2="18.6" stroke="currentColor" stroke-width="2" />
    <line x1="6" y1="12" x2="11.9" y2="18" stroke="currentColor" stroke-width="2" />
    <line x1="12.1" y1="18" x2="18" y2="12" stroke="currentColor" stroke-width="2" />
  </svg>
);
