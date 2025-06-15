export const ChevronHorizontal = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class={props.rotated ? 'transition-transform rotate-270' : 'transition-transform rotate-90'}
  >
    <line x1="4" y1="10" x2="11.9" y2="18" stroke="currentColor" stroke-width="2" />
    <line x1="12.1" y1="18" x2="20" y2="10" stroke="currentColor" stroke-width="2" />
  </svg>
);
