import { D4, D6, D8, D10, D12, D20 } from '../../assets';

const TYPES = { 'D4': D4, 'D6': D6, 'D8': D8, 'D10': D10, 'D12': D12, 'D20': D20 };

export const Dice = (props) => {
  const Component = TYPES[props.type] || D20; // eslint-disable-line solid/reactivity

  return (
    <div
      class="relative"
      classList={{ 'cursor-pointer': props.onClick }}
      onClick={props.onClick ? props.onClick : null} // eslint-disable-line solid/reactivity
    >
      <Component mode={props.mode} width={props.width || 40} height={props.height || 40} />
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
}
