import { createSignal, Show } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { ContentLayout } from '../layouts';
import { BackToListButton } from '../components';

export const CampaignsLayout = (props) => {
  const [activeTab, setActiveTab] = createSignal(undefined);

  const size = createWindowSize();

  return (
    <ContentLayout currentTab="campaigns" onChangeTab={props.onChangeTab}>
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
    </ContentLayout>
  );
}
