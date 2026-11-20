export const Logo = (props) => {
  return (
    <svg
      width={props.width || props.size || 40}
      height={props.height || props.size || 40}
      viewBox="0 0 180 180"
      xmlns="http://www.w3.org/2000/svg"
      role={props.label ? 'img' : undefined}
      aria-label={props.label}
      aria-hidden={props.label ? undefined : 'true'}
    >
      <path
        d="M5 54.5C17.7 38.5 35.4 28.7 55 26v57.2c-20.1-1.1-37.6-11.4-50-28.7Z"
        fill={props.accentColor || '#D63F07'}
      />
      <path
        d="M54 26h41.2C114.4 26 130 41.6 130 60.8v60.7c0 2.1 1 3.1 2.2 2.5.8-.4.8-1.3.8-2.1v-3.2c0-4.2 2.9-7.5 6.8-7.5 4.1 0 6.8 3.2 6.8 7.2v3.8l9.7-4.1c4.1-1.7 8.6 1.3 8.6 5.8 0 2-.9 4-2.5 5.2l-3.7 2.9h3.8a6.5 6.5 0 0 1 0 13H109v19h-8v-19h-3v19h-9v-19H70c-8.8 0-16-7.2-16-16V26Z"
        fill={props.bodyColor || '#000000'}
      />
      <path
        d="M62 34h31.3C105.8 34 116 44.2 116 56.8v.4C116 69.8 105.8 80 93.3 80H62V34Z"
        fill={props.faceColor || '#FFFFFF'}
      />
      <path
        d="M62 86.2c19.3 3 34.3 19.2 36 47.8H70c-4.4 0-8-3.6-8-8V86.2Z"
        fill={props.faceColor || '#FFFFFF'}
      />
      <path
        d="M72 58.5a8 8 0 0 1 16 0H97V62H72v-3.5Z"
        fill={props.bodyColor || '#000000'}
      />
    </svg>
  );
};
