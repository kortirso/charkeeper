export const DndSystem = (props) => (
  <svg
    width={props.width || props.size || 24}
    height={props.height || props.size || 24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M12 2.8L21 9.3L17.6 20H6.4L3 9.3L12 2.8Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M3 9.3L8.4 8.8L12 2.8L15.6 8.8L21 9.3M8.4 8.8L6.4 20L12 15.8L17.6 20L15.6 8.8M8.4 8.8L12 15.8L15.6 8.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);
