import { splitProps } from 'solid-js';

import { Label } from './Label';

export const Text = (props) => {
  const [labelProps] = splitProps(props, ['labelText', 'labelClassList']);

  return (
    <div class={props.containerClassList}>
      <Label { ...labelProps } />
      <p class={props.textClassList}>{props.text}</p>
    </div>
  );
}
