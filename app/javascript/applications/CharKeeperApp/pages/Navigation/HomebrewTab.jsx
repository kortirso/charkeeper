import { createSignal, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { PageHeader, CharacterNavigation } from '../../components';
import { useAppLocale, useAppState } from '../../context';

export const HomebrewTab = () => {
  const [activeFilter, setActiveFilter] = createSignal('daggerheart');

  const [appState, { navigate }] = useAppState();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const renderHomebrewLink = (title, link, linkParams) => (
    <p
      class="relative py-3 px-4 cursor-pointer rounded"
      classList={{
        'bg-blue-400 text-white dark:bg-fuzzy-red': appState.activePageParams.content === linkParams.content,
        'text-black hover:bg-gray-100 dark:text-snow dark:hover:bg-dusty': appState.activePageParams.content !== linkParams.content
      }}
      onClick={() => navigate(link, linkParams)}
    >
      {title}
    </p>
  );

  return (
    <>
      <PageHeader>
        {t('pages.homebrewPage.title')}
      </PageHeader>
      <CharacterNavigation
        tabsList={['daggerheart']}
        activeTab={activeFilter()}
        setActiveTab={setActiveFilter}
      />
      <div class="p-4 flex-1 overflow-y-scroll">
        <Switch>
          <Match when={activeFilter() === 'daggerheart'}>
            {renderHomebrewLink(t('pages.homebrewPage.daggerheart.races'), 'homebrew', { content: 'races', provider: 'daggerheart' })}
            {renderHomebrewLink(t('pages.homebrewPage.daggerheart.classes'), 'homebrew', { content: 'classes', provider: 'daggerheart' })}
            {renderHomebrewLink(t('pages.homebrewPage.daggerheart.subclasses'), 'homebrew', { content: 'subclasses', provider: 'daggerheart' })}
            {renderHomebrewLink(t('pages.homebrewPage.daggerheart.feats'), 'homebrew', { content: 'feats', provider: 'daggerheart' })}
            {renderHomebrewLink(t('pages.homebrewPage.daggerheart.items'), 'homebrew', { content: 'items', provider: 'daggerheart' })}
          </Match>
        </Switch>
      </div>
    </>
  );
}
