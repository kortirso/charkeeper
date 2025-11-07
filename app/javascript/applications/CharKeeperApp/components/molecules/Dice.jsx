import { D20 } from '../../assets';

export const Dice = (props) => (
  <div
    class="relative"
    classList={{ 'cursor-pointer': props.onClick }}
    onClick={props.onClick ? props.onClick : null} // eslint-disable-line solid/reactivity
  >
    <D20 width={props.width || 40} height={props.height || 40} fill={props.fill} />
    <div class="absolute top-0 left-0 w-full h-full flex justify-center items-center">
      <p
        class={[props.textClassList, 'font-normal! text-snow'].join(' ')}
        classList={{ 'opacity-50': props.minimum }}
      >
        {props.text}
      </p>
    </div>
  </div>
);
