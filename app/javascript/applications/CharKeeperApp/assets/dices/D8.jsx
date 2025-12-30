export const D8 = (props) => (
  <svg
    width={props.width || 24}
    height={props.height || 24}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 435.21 492.56"
  >
    <defs>
      <style>{`
        .cls-8-1 {
          stroke-width: 7px;
        }

        .cls-8-1, .cls-8-2 {
          fill: none;
          stroke: #6d6e71;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .default { fill: #939598 }
        .hope { fill: #C28D23 }
        .fear { fill: #2362C2 }

        .cls-8-2 {
          stroke-width: 10px;
        }
      `}</style>
    </defs>
    <polygon class={props.mode || 'default'} points="11.84 133.89 5 365.38 221.47 485.43 11.84 133.89"/>
    <polygon class={props.mode || 'default'} points="420.52 129.24 217.61 487.56 430.21 370.61 420.52 129.24"/>
    <polygon class={props.mode || 'default'} points="13.5 129.24 217.61 487.56 420.52 129.24 13.5 129.24"/>
    <polygon class={props.mode || 'default'} points="217.61 5 13.5 129.24 427.44 126.36 217.61 5"/>
    <polygon class="cls-8-2" points="11.84 126.36 219.53 5 424.87 126.36 430.21 370.61 221.03 487.56 5 365.38 11.84 126.36"/>
    <line class="cls-8-1" x1="221.03" y1="481.51" x2="11.84" y2="126.36"/>
    <polyline class="cls-8-1" points="221.44 478.45 420.52 129.24 13.5 129.24"/>
  </svg>
)
