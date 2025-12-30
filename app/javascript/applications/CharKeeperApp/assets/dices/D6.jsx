export const D6 = (props) => (
  <svg
    width={props.width || 24}
    height={props.height || 24}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 460.56 494.56"
  >
    <defs>
      <style>{`
        .cls-6-1 {
          stroke-width: 7px;
        }

        .cls-6-1, .cls-6-2 {
          fill: none;
          stroke: #6d6e71;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .default { fill: #939598 }
        .hope { fill: #C28D23 }
        .fear { fill: #2362C2 }

        .cls-6-2 {
          stroke-width: 10px;
        }
      `}</style>
    </defs>
    <polygon class={props.mode || 'default'} points="5 114.1 5 372.43 230.28 486.71 230.28 223.2 5 114.1"/>
    <polygon class={props.mode || 'default'} points="230.28 5 5 114.1 230.28 223.2 455.56 105.21 230.28 5"/>
    <polygon class={props.mode || 'default'} points="455.56 366.3 455.56 105.21 230.28 223.2 230.06 489.56 455.56 366.3"/>
    <polygon class="cls-6-2" points="230.28 5 5 114.1 5 372.43 230.06 489.56 455.56 366.3 455.56 105.21 230.28 5"/>
    <line class="cls-6-1" x1="230.28" y1="223.2" x2="230.28" y2="484.28"/>
    <line class="cls-6-1" x1="230.28" y1="223.2" x2="455.56" y2="105.21"/>
    <line class="cls-6-1" x1="5" y1="114.1" x2="230.28" y2="223.2"/>
  </svg>
)
