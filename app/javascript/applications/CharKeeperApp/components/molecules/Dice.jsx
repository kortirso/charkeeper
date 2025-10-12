import { D20 } from '../../assets';

export const Dice = (props) => (
  <div
    class="relative"
    classList={{ 'cursor-pointer': props.onClick }}
    onClick={props.onClick ? props.onClick : null} // eslint-disable-line solid/reactivity
  >
    <D20 width={props.width || 40} height={props.height || 40} />
    <div class="absolute top-0 left-0 w-10 h-10 flex justify-center items-center">
      <p
        class="font-normal! text-snow"
        classList={{ 'opacity-50': props.minimum }}
      >
        {props.text}
      </p>
    </div>
  </div>
);
