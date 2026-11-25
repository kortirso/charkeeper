import { createMemo, createSignal, Show } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { useAppLocale, useAppState } from '../../context';
import { localize } from '../../helpers';

const TRANSLATION = {
  en: {
  },
  ru: {
  },
  es: {
  }
}

export const Character = () => {
  const [activeTab, setActiveTab] = createSignal(undefined); // eslint-disable-line no-unused-vars

  const size = createWindowSize();
  const [locale] = useAppLocale();
  const [appState] = useAppState(); // eslint-disable-line no-unused-vars

  const i18n = createMemo(() => localize(TRANSLATION, locale())); // eslint-disable-line no-unused-vars

  return (
    <>
      <Show when={size.width >= 1280}>
        <div id="content-body-left" />
      </Show>
      <div id="content-body-right" />
    </>
  );
}
