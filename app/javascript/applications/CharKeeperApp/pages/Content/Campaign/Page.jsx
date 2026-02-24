import { createSignal, createMemo, Switch, Match } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { CampaignCharacters } from '../../../pages';
import { CharacterNavigation, Notes, ContentWrapper } from '../../../components';

export const CampaignPage = (props) => {
  const size = createWindowSize();
  const campaign = () => props.campaign;

  const [activeMobileTab, setActiveMobileTab] = createSignal('campaignCharacters');
  const [activeTab, setActiveTab] = createSignal('notes');

  const campaignTabs = createMemo(() => {
    return ['notes'];
  });

  const mobileView = createMemo(() => {
    if (size.width >= 1152) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={['campaignCharacters'].concat(campaignTabs())}
          activeTab={activeMobileTab()}
          setActiveTab={setActiveMobileTab}
        />
        <div class="p-2 pb-16 flex-1 overflow-y-auto">
          <Switch>
            <Match when={activeMobileTab() === 'campaignCharacters'}>
              <CampaignCharacters campaign={campaign()} characters={props.characters} onDeleteCharacter={props.onDeleteCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'notes'}>
              <Notes type="campaigns" />
            </Match>
          </Switch>
        </div>
      </>
    )
  });

  const leftView = createMemo(() => {
    if (size.width <= 1151) return <></>;

    return (
      <>
        <CampaignCharacters campaign={campaign()} characters={props.characters} onDeleteCharacter={props.onDeleteCharacter} />
      </>
    );
  });

  const rightView = createMemo(() => {
    if (size.width <= 1151) return <></>;

    return (
      <>
        <CharacterNavigation tabsList={campaignTabs()} activeTab={activeTab()} setActiveTab={setActiveTab} />
        <div class="p-2 pb-16 flex-1">
          <Switch>
            <Match when={activeTab() === 'notes'}>
              <Notes type="campaigns" />
            </Match>
          </Switch>
        </div>
      </>
    );
  });

  return (
    <ContentWrapper mobileView={mobileView()} leftView={leftView()} rightView={rightView()} />
  );
}
