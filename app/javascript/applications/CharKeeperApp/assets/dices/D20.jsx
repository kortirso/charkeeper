export const D20 = (props) => (
  <svg
    width={props.width || 24}
    height={props.height || 24}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 500 483.72"
  >
    <defs>
      <style>{`
        .cls-1, .cls-2, .cls-3 {
          fill: none;
          stroke: #6d6e71;
        }

        .cls-1, .cls-3 {
          stroke-miterlimit: 10;
          stroke-width: 7px;
        }

        .default { fill: #939598 }
        .hope { fill: #C28D23 }
        .fear { fill: #2362C2 }

        .cls-2 {
          stroke-linejoin: round;
          stroke-width: 10px;
        }

        .cls-2, .cls-3 {
          stroke-linecap: round;
        }
      `}</style>
    </defs>
    <polygon class={props.mode || 'default'} points="46.18 128.51 44.4 361.46 120.7 296.73 46.18 128.51"/>
    <polygon class={props.mode || 'default'} points="44.4 361.46 117.16 301.27 255.36 474.63 44.4 361.46"/>
    <polygon class={props.mode || 'default'} points="255.36 474.63 384.25 299.8 120.7 299.8 255.36 474.63"/>
    <polygon class={props.mode || 'default'} points="255.36 474.63 460.28 356.77 384.52 299.8 255.36 474.63"/>
    <polygon class={props.mode || 'default'} points="454.88 126.26 460.28 356.77 384.52 299.8 454.88 126.26"/>
    <polygon class={props.mode || 'default'} points="252.34 104.76 120.7 299.8 384.52 299.8 252.34 104.76"/>
    <polygon class={props.mode || 'default'} points="44.4 128.51 120.7 299.8 252.34 104.76 44.4 128.51"/>
    <polygon class={props.mode || 'default'} points="252.34 104.76 454.88 126.26 384.53 299.8 252.34 104.76"/>
    <polygon class={props.mode || 'default'} points="46.18 128.51 252.34 5 252.34 104.76 46.18 128.51"/>
    <polygon class={props.mode || 'default'} points="252.34 5 252.34 104.76 454.88 126.26 252.34 5"/>
    <polygon class="cls-2" points="44.4 128.51 252.34 5 460.27 128.51 460.27 356.77 252.34 478.72 44.4 361.46 44.4 128.51"/>
    <line class="cls-3" x1="252.34" y1="104.76" x2="44.4" y2="128.51"/>
    <line class="cls-1" x1="252.34" y1="5" x2="252.34" y2="104.76"/>
    <line class="cls-1" x1="252.34" y1="104.76" x2="460.27" y2="128.51"/>
    <line class="cls-1" x1="384.52" y1="299.8" x2="252.95" y2="471.49"/>
    <line class="cls-1" x1="255.36" y1="474.63" x2="120.7" y2="299.8"/>
    <line class="cls-1" x1="252.34" y1="104.76" x2="120.7" y2="299.8"/>
    <line class="cls-1" x1="384.25" y1="299.8" x2="120.42" y2="299.8"/>
    <line class="cls-1" x1="454.88" y1="126.26" x2="384.52" y2="299.8"/>
    <line class="cls-1" x1="252.34" y1="104.76" x2="384.25" y2="299.8"/>
    <line class="cls-1" x1="46.18" y1="128.51" x2="120.7" y2="299.8"/>
    <line class="cls-1" x1="120.7" y1="299.8" x2="44.4" y2="361.46"/>
    <line class="cls-1" x1="384.53" y1="299.8" x2="460.28" y2="356.77"/>
  </svg>
);
