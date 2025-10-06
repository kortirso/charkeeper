import { createSignal, createEffect, Switch, Match, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { createWindowSize } from '@solid-primitives/resize-observer';

import {
  HomebrewRaces, HomebrewFeats, HomebrewItems, HomebrewClasses, HomebrewSubclasses, HomebrewModules, HomebrewCommunities,
  HomebrewTransformations
} from '../../pages';
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

  const reloadHomebrews = async () => {
    const result = await fetchHomebrewsList(appState.activePageParams.provider);
    setHomebrews(result);
  }

  const addHomebrew = (key, value) => {
    const newList = homebrews()[key].concat([value]).sort((a, b) => {
      if (a.name) return a.name.localeCompare(b.name);
      if (a.title) return a.title.en.localeCompare(b.title.en);

      return a.id.localeCompare(b.id);
    });

    setHomebrews({ ...homebrews(), [key]: newList });
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
      <Show when={appState.activePageParams.provider === lastProvider()}>
        <Switch>
          <Match when={appState.activePageParams.content === 'modules'}>
            <HomebrewModules
              provider={appState.activePageParams.provider}
              homebrews={homebrews()}
            />
          </Match>
          <Match when={appState.activePageParams.content === 'races'}>
            <HomebrewRaces
              provider={appState.activePageParams.provider}
              homebrews={homebrews()}
              removeHomebrew={removeHomebrew}
              reloadHomebrews={reloadHomebrews}
            />
          </Match>
          <Match when={appState.activePageParams.content === 'communities'}>
            <HomebrewCommunities
              provider={appState.activePageParams.provider}
              homebrews={homebrews()}
              removeHomebrew={removeHomebrew}
              reloadHomebrews={reloadHomebrews}
            />
          </Match>
          <Match when={appState.activePageParams.content === 'transformations'}>
            <HomebrewTransformations
              provider={appState.activePageParams.provider}
              homebrews={homebrews()}
              removeHomebrew={removeHomebrew}
              reloadHomebrews={reloadHomebrews}
            />
          </Match>
          <Match when={appState.activePageParams.content === 'classes'}>
            <HomebrewClasses
              provider={appState.activePageParams.provider}
              homebrews={homebrews()}
              addHomebrew={addHomebrew}
              removeHomebrew={removeHomebrew}
            />
          </Match>
          <Match when={appState.activePageParams.content === 'subclasses'}>
            <HomebrewSubclasses
              provider={appState.activePageParams.provider}
              homebrews={homebrews()}
              addHomebrew={addHomebrew}
              removeHomebrew={removeHomebrew}
              reloadHomebrews={reloadHomebrews}
            />
          </Match>
          <Match when={appState.activePageParams.content === 'feats'}>
            <HomebrewFeats
              provider={appState.activePageParams.provider}
              homebrews={homebrews()}
              addHomebrew={addHomebrew}
              removeHomebrew={removeHomebrew}
            />
          </Match>
          <Match when={appState.activePageParams.content === 'items'}>
            <HomebrewItems
              provider={appState.activePageParams.provider}
              homebrews={homebrews()}
              reloadHomebrews={reloadHomebrews}
            />
          </Match>
        </Switch>
      </Show>
    </>
  );
}
