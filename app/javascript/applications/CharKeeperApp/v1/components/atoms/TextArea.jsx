import { splitProps } from 'solid-js';

import { Label } from './Label';

export const TextArea = (props) => {
  const [labelProps] = splitProps(props, ['labelText', 'labelClassList']);

  return (
    <div class={props.containerClassList}>
      <Label { ...labelProps } />
      <textarea
        placeholder={props.placeholder || ''}
        rows={props.rows || 2}
        class={[
          props.classList,
          'w-full rounded p-1 border border-gray-200 bg-white text-sm dark:bg-neutral-700 dark:border-gray-500 dark:text-snow'
        ].join(' ')}
        onInput={(e) => props.onChange(e.target.value)}
        value={props.value}
      />
    </div>
  );
}
