import { createSignal, createEffect, Switch, Match, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { HomebrewRaces, HomebrewFeats, HomebrewItems, HomebrewClasses } from '../../pages';
import { PageHeader, IconButton } from '../../components';
import { Arrow } from '../../assets';
import { useAppState, useAppLocale } from '../../context';
import { fetchHomebrewsListRequest } from '../../requests/fetchHomebrewsListRequest';

export const HomebrewContentTab = (props) => {
  const size = createWindowSize();

  const [lastProvider, setLastProvider] = createSignal(null);
  const [homebrews, setHomebrews] = createSignal(undefined);

  const [appState] = useAppState();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const fetchHomebrewsList = async (provider) => await fetchHomebrewsListRequest(appState.accessToken, provider);

  createEffect(() => {
    if (!appState.activePageParams.provider) return;
    if (appState.activePageParams.provider === lastProvider()) return;

    Promise.all([fetchHomebrewsList(appState.activePageParams.provider)]).then(
      ([homebrewsData]) => {
        batch(() => {
          setLastProvider(appState.activePageParams.provider);
          setHomebrews(homebrewsData);
        });
      }
    );
  });

  const addHomebrew = (key, value) => {
    setHomebrews({ ...homebrews(), [key]: homebrews()[key].concat([value]) });
  }

  const removeHomebrew = (key, valueId) => {
    setHomebrews({ ...homebrews(), [key]: homebrews()[key].slice().filter((item) => item.id !== valueId) });
  }

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
              <HomebrewRaces
                provider="daggerheart"
                homebrews={homebrews()}
                addHomebrew={addHomebrew}
                removeHomebrew={removeHomebrew}
              />
            </Match>
            <Match when={appState.activePageParams.content === 'classes'}>
              <HomebrewClasses
                provider="daggerheart"
                homebrews={homebrews()}
                addHomebrew={addHomebrew}
                removeHomebrew={removeHomebrew}
              />
            </Match>
            <Match when={appState.activePageParams.content === 'feats'}>
              <HomebrewFeats
                provider="daggerheart"
                homebrews={homebrews()}
                addHomebrew={addHomebrew}
                removeHomebrew={removeHomebrew}
              />
            </Match>
            <Match when={appState.activePageParams.content === 'items'}>
              <HomebrewItems provider="daggerheart" homebrews={homebrews()} />
            </Match>
          </Switch>
        </Match>
      </Switch>
    </>
  );
}
