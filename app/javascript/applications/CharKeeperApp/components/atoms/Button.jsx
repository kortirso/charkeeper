import { createSignal, Show, children } from 'solid-js';

import { Loading } from '../../components';

export const Button = (props) => {
  const safeChildren = children(() => props.children);

  const [loading, setLoading] = createSignal(false);

  const click = async () => {
    if (props.onClick === undefined) return;
    if (!props.withSuspense) return props.onClick();
    if (loading()) return;

    setLoading(true);
    await props.onClick();
    setLoading(false);
  }

  return (
    <p
      class={[props.classList, 'rounded cursor-pointer flex justify-center items-center font-normal!'].join(' ')}
      classList={{
        'min-h-10 min-w-10': props.size === undefined || props.size === 'default',
        'min-h-6 min-w-6 text-sm': props.size === 'small',
        'bg-blue-400 text-snow dark:bg-fuzzy-red': props.default,
        'bg-white text-blue-400 border border-blue-400 dark:text-black dark:border-fuzzy-red': props.outlined,
        'px-2 py-1': props.textable
      }}
      onClick={click}
    >
      <Show when={!loading()} fallback={<Loading spinner />}>
        {safeChildren()}
      </Show>
    </p>
  );
}
