export const Button = (props) => {
  const defaultSize = () => !props.smallSize;

  return (
    <p
      class={[props.classList, 'rounded border font-medium cursor-pointer text-center'].join(' ')}
      classList={{
        'py-2 px-4': defaultSize(),
        'p-1': props.smallSize,
        'bg-blue-50 text-blue-600 border-blue-600': props.primary,
        'bg-blue-50 text-blue-300 border-blue-300': props.light,
        'bg-red-50 text-red-600 border-red-600': props.warning
      }}
      onClick={props.onClick} // eslint-disable-line solid/reactivity
    >
      {props.text}
    </p>
  );
}
