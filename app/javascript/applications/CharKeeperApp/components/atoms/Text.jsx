import { splitProps } from 'solid-js';

import { Label } from './Label';

export const Text = (props) => {
  const [labelProps] = splitProps(props, ['labelText', 'labelClassList']);

  return (
    <div class={props.containerClassList} onClick={() => props.onClick ? props.onClick() : null}>
      <Label { ...labelProps } />
      <p class={props.textClassList}>{props.text}</p>
    </div>
  );
}
