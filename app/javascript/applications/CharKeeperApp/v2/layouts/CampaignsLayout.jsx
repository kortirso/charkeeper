import { createSignal, Show } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { BackToListButton } from '../components';

export const CampaignsLayout = () => {
  const [activeTab, setActiveTab] = createSignal(undefined);

  const size = createWindowSize();

  return (
    <div id="content-body">
      <Show when={size.width >= 1280 || !activeTab()}>
        <div id="content-body-left" />
      </Show>
      <Show when={size.width >= 1280 || activeTab()}>
        <div id="content-body-right">
          <Show when={size.width < 1280}>
            <BackToListButton onClick={() => setActiveTab(undefined)} />
          </Show>
        </div>
      </Show>
    </div>
  );
}
