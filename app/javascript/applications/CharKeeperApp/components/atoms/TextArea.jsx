import { splitProps } from 'solid-js';

import { Label } from '../atoms';

export const TextArea = (props) => {
  const [labelProps] = splitProps(props, ['labelText', 'labelClassList']);

  return (
    <>
      <Label { ...labelProps } />
      <textarea
        rows={props.rows || 2}
        class="w-full border border-gray-200 rounded p-1 text-sm mb-2"
        onInput={(e) => props.onChange(e.target.value)}
        value={props.value}
      />
    </>
  );
}
