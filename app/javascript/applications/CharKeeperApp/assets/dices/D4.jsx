export const D4 = (props) => (
  <svg
    width={props.width || 24}
    height={props.height || 24}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 500 469.77"
  >
    <defs>
      <style>{`
        .cls-4-1 {
          stroke-miterlimit: 10;
          stroke-width: 7px;
        }

        .cls-4-1, .cls-4-2 {
          fill: none;
          stroke: #6d6e71;
        }

        .default { fill: #939598 }
        .hope { fill: #C28D23 }
        .fear { fill: #2362C2 }

        .cls-4-2 {
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 10px;
        }
      `}</style>
    </defs>
    <polygon class={props.mode || 'default'} points="250 14.25 254.95 455.52 491.71 301.34 250 14.25"/>
    <polygon class={props.mode || 'default'} points="250 14.25 250 451.21 8.29 294.77 250 14.25"/>
    <polygon class="cls-4-2" points="8.29 297.29 252.69 455.52 491.71 297.29 250 14.25 8.29 297.29"/>
    <line class="cls-4-1" x1="250" y1="22.94" x2="252.69" y2="455.52"/>
  </svg>
)
