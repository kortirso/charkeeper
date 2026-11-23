export const MainSettings = (props) => (
  <svg
    width={props.width || props.size || 24}
    height={props.height || props.size || 24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M12 3A9 9 0 1 0 21 12C21 10.9 20.1 10 19 10H17.8C16.3 10 15.5 8.2 16.5 7.1L17.3 6.2C15.8 4.2 13.9 3 12 3Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="7.5" cy="11" r="1" fill="currentColor" />
    <circle cx="10" cy="7" r="1" fill="currentColor" />
    <circle cx="14.5" cy="7" r="1" fill="currentColor" />
  </svg>
);
