import { D20 } from '../../assets';

export const DualityDice = (props) => (
  <div
    class="relative w-10 h-10"
    classList={{ 'cursor-pointer': props.onClick }}
    onClick={props.onClick ? props.onClick : null} // eslint-disable-line solid/reactivity
  >
    <div class="relative z-20">
      <D20 width={props.width || 30} height={props.height || 30} fill="#C28D23" />
    </div>
    <div class="absolute bottom-0 right-0 z-10">
      <D20 width={props.width || 30} height={props.height || 30} fill="#2362C2" />
    </div>
  </div>
);
