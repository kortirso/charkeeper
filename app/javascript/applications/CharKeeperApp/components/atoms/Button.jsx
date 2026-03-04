import { createSignal, Show, children } from 'solid-js';

import { Loading } from '../../components';

export const Button = (props) => {
  const safeChildren = children(() => props.children);

  const [loading, setLoading] = createSignal(false);

  const click = async (event) => {
    if (props.onClick === undefined) return;
    if (!props.withSuspense) return props.onClick(event);
    if (loading()) return;

    setLoading(true);
    await props.onClick(event);
    setLoading(false);
  }

  return (
    <p
      class={[props.classList, 'default-button'].join(' ')}
      classList={{
        'default-button-size': props.size === undefined || props.size === 'default',
        'small-button-size': props.size === 'small',
        'default-button-color': props.default,
        'outlined-button-color': props.outlined,
        'px-2 py-1': props.textable
      }}
      onClick={click}
      dataTestId={props.dataTestId}
    >
      <Show when={!loading()} fallback={<Loading spinner />}>
        {safeChildren()}
      </Show>
    </p>
  );
}
