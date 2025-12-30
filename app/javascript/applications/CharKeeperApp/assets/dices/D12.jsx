export const D12 = (props) => (
  <svg
    width={props.width || 24}
    height={props.height || 24}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 482.75 494.43"
  >
    <defs>
      <style>{`
        .cls-12-1 {
          stroke-width: 7px;
        }

        .cls-12-1, .cls-12-2 {
          fill: none;
          stroke: #6d6e71;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .default { fill: #939598 }
        .hope { fill: #C28D23 }
        .fear { fill: #2362C2 }

        .cls-12-2 {
          stroke-width: 10px;
        }
      `}</style>
    </defs>
    <polygon class={props.mode || 'default'} points="5 174.21 99.24 203.17 150.26 365.25 89.6 445.76 5 327.55 5 174.21"/>
    <polygon class={props.mode || 'default'} points="236.22 5 237.93 105.16 99.24 199.64 5 174.21 94.19 49.94 236.22 5"/>
    <polygon class={props.mode || 'default'} points="376.62 203.17 477.75 171.48 388.29 51.4 236.22 5 237.93 110.12 376.62 203.17"/>
    <polygon class={props.mode || 'default'} points="323.41 362.12 376.62 199.64 237.93 105.16 99.24 195.64 150.26 365.25 323.41 362.12"/>
    <polygon class={props.mode || 'default'} points="237.89 489.43 389.64 448.74 323.41 365.25 150.99 362.12 87.85 447.04 237.89 489.43"/>
    <polygon class={props.mode || 'default'} points="477.75 325.68 477.75 171.48 376.62 203.17 323.41 362.12 391.79 449.85 477.75 325.68"/>
    <polygon class="cls-12-2" points="89.6 51.4 236.22 5 388.29 51.4 477.75 171.48 477.75 325.68 391.79 449.85 244.2 489.43 89.6 445.76 5 331.13 5 174.21 89.6 51.4"/>
    <polygon class="cls-12-1" points="99.24 199.64 238.92 105.16 376.62 203.17 323.41 365.25 149.29 362.12 99.24 199.64"/>
    <line class="cls-12-1" x1="89.6" y1="445.76" x2="149.29" y2="362.12"/>
    <line class="cls-12-1" x1="10.45" y1="174.21" x2="99.24" y2="199.64"/>
    <line class="cls-12-1" x1="238.92" y1="105.16" x2="236.47" y2="9.77"/>
    <line class="cls-12-1" x1="376.62" y1="203.17" x2="470" y2="173.83"/>
    <line class="cls-12-1" x1="323.41" y1="365.25" x2="390.77" y2="448.6"/>
  </svg>
)
