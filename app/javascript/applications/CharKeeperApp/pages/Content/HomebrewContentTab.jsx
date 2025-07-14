import { Switch, Match, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { HomebrewRaces } from '../../pages';
import { PageHeader, IconButton } from '../../components';
import { Arrow } from '../../assets';
import { useAppState, useAppLocale } from '../../context';

export const HomebrewContentTab = (props) => {
  const size = createWindowSize();

  const [appState] = useAppState();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  return (
    <>
      <Show when={size.width < 768}>
        <PageHeader
          leftContent={
            <IconButton onClick={props.onNavigate}>
              <Arrow back width={20} height={20} />
            </IconButton>
          }
        >
          <p>{t(`pages.homebrewPage.${appState.activePageParams.provider}.${appState.activePageParams.content}`)}</p>
        </PageHeader>
      </Show>
      <Switch>
        <Match when={appState.activePageParams.provider === 'daggerheart'}>
          <Switch>
            <Match when={appState.activePageParams.content === 'races'}>
              <HomebrewRaces provider="daggerheart" />
            </Match>
          </Switch>
        </Match>
      </Switch>
    </>
  );
}
