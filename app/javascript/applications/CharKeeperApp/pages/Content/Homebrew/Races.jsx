import { createSignal, Switch, Match, batch, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { NewDaggerheartRaceForm, DaggerheartRace } from '../../../pages';
import { ContentWrapper, Button, IconButton, Toggle, Input } from '../../../components';
import { Close } from '../../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { createHomebrewRaceRequest } from '../../../requests/createHomebrewRaceRequest';
import { removeHomebrewRaceRequest } from '../../../requests/removeHomebrewRaceRequest';
import { copyHomebrewRaceRequest } from '../../../requests/copyHomebrewRaceRequest';
import { copyToClipboard } from '../../../helpers';

export const HomebrewRaces = (props) => {
  const [activeView, setActiveView] = createSignal('left');
  const [copyRaceId, setCopyRaceId] = createSignal('');

  const [appState] = useAppState();
  const [{ renderAlerts, renderAlert, renderNotice }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const cancelCreatingRace = () => setActiveView('left');

  const createRace = async (payload) => {
    const result = await createHomebrewRaceRequest(appState.accessToken, props.provider, payload);

    if (result.errors === undefined) {
      batch(() => {
        props.addHomebrew('races', result.race);
        setActiveView('left');
      });
    } else renderAlerts(result.errors);
  }

  const copyRace = async () => {
    const result = await copyHomebrewRaceRequest(appState.accessToken, props.provider, copyRaceId());

    if (result.errors === undefined) props.reloadHomebrews();
    else renderAlert(result.errors);
  }

  const removeRace = async (event, id) => {
    event.stopPropagation();

    const result = await removeHomebrewRaceRequest(appState.accessToken, props.provider, id);
    if (result.errors === undefined) props.removeHomebrew('races', id);
    else renderAlerts(result.errors);
  }

  const copy = (value) => {
    copyToClipboard(value);
    renderNotice(t('alerts.copied'));
  }

  return (
    <>
      <ContentWrapper
        activeView={activeView()}
        leftView={
          <>
            <Button default classList="mb-2" onClick={() => setActiveView('right')}>
              {t(`pages.homebrewPage.${props.provider}.newRace`)}
            </Button>
            <div class="flex mb-2">
              <Button default size="small" classList="px-2" onClick={copyRace}>
                {t('copy')}
              </Button>
              <Input
                containerClassList="ml-2 flex-1"
                placeholder={t(`pages.homebrewPage.${props.provider}.copyRacePlaceholder`)}
                value={copyRaceId()}
                onInput={(value) => setCopyRaceId(value)}
              />
            </div>
            <Show when={props.homebrews !== undefined}>
              <For each={props.homebrews.races}>
                {(race) =>
                  <Toggle isOpen title={
                    <div class="flex items-center">
                      <p class="flex-1">{race.name}</p>
                      <IconButton onClick={(e) => removeRace(e, race.id)}>
                        <Close />
                      </IconButton>
                    </div>
                  }>
                    <Switch>
                      <Match when={props.provider === 'daggerheart'}>
                        <DaggerheartRace raceId={race.id} feats={props.homebrews.feats} />
                      </Match>
                    </Switch>
                    <p class="absolute bottom-0 right-0 px-2 py-1 dark:text-snow cursor-pointer" onClick={() => copy(race.id)}>
                      COPY
                    </p>
                  </Toggle>
                }
              </For>
            </Show>
          </>
        }
        rightView={
          <Show when={activeView() === 'right'}>
            <Switch>
              <Match when={props.provider === 'daggerheart'}>
                <NewDaggerheartRaceForm onSave={createRace} onCancel={cancelCreatingRace} />
              </Match>
            </Switch>
          </Show>
        }
      />
    </>
  );
}
