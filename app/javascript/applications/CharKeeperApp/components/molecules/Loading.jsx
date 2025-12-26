import { createSignal, onCleanup } from 'solid-js';

import { useAppLocale } from '../../context';

const TRANSLATION = {
  en: {
    loading: 'Loading'
  },
  ru: {
    loading: 'Загрузка данных'
  }
}

export const Loading = () => {
  const [count, setCount] = createSignal(0);

  const [locale] = useAppLocale();

  const interval = setInterval(() => { setCount(c => c + 1) }, 1000);
  onCleanup(() => clearInterval(interval));

  return (
    <div class="flex h-full justify-center items-center">
      <p class="dark:text-snow text-lg">
        {TRANSLATION[locale()].loading}
        <span class="inline-block w-8">{Array((count() % 4) + 1).join('.')}</span>
      </p>
    </div>
  );
}
