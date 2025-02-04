export const Hamburger = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="cursor-pointer"
    onClick={props.onClick} // eslint-disable-line solid/reactivity
  >
    <path d="M 0 4 L 23 4 L 23 6 L 0 6 Z" fill="#000" />
    <path d="M 0 11 L 23 11 L 23 13 L 0 13 Z" fill="#000" />
    <path d="M 0 18 L 23 18 L 23 20 L 0 20 Z" fill="#000" />
  </svg>
);
