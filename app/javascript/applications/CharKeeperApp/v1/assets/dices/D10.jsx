export const D10 = (props) => (
  <svg
    width={props.width || 24}
    height={props.height || 24}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 446.94 490.45"
  >
    <defs>
      <style>{`
        .cls-10-1 {
          stroke-width: 7px;
        }

        .cls-10-1, .cls-10-2 {
          fill: none;
          stroke: #6d6e71;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .default { fill: #939598 }
        .hope { fill: #C28D23 }
        .fear { fill: #2362C2 }

        .cls-10-2 {
          stroke-width: 10px;
        }
      `}</style>
    </defs>
    <polygon class={props.mode || 'default'} points="5 272.93 87.66 245.22 219.17 335.5 213.96 485.45 5 272.93"/>
    <polygon class={props.mode || 'default'} points="349 256.48 441.94 279.44 213.96 485.45 219.17 335.5 349 256.48"/>
    <polygon class={props.mode || 'default'} points="223.47 5 91.19 244.07 219.17 335.5 349 256.48 223.47 5"/>
    <polygon class={props.mode || 'default'} points="13.91 191.41 5 267.73 87.66 245.22 223.47 5 13.91 191.41"/>
    <polygon class={props.mode || 'default'} points="349 256.48 441.94 279.44 441.94 205.3 223.47 5 349 256.48"/>
    <polygon class="cls-10-2" points="12.73 191.82 5 272.93 213.96 485.45 441.94 279.44 441.94 208.9 225.83 5 12.73 191.82"/>
    <polyline class="cls-10-1" points="219.17 335.5 349 256.48 225.83 5 89.14 242.61"/>
    <line class="cls-10-1" x1="89.14" y1="242.61" x2="219.17" y2="335.5"/>
    <line class="cls-10-1" x1="213.96" y1="485.45" x2="219.17" y2="335.5"/>
    <line class="cls-10-1" x1="11.43" y1="267.73" x2="89.14" y2="242.61"/>
    <line class="cls-10-1" x1="349" y1="256.48" x2="441.94" y2="279.44"/>
  </svg>
)
