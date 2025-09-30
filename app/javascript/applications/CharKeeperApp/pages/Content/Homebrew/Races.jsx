import { createSignal, Switch, Match, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { DaggerheartRace } from '../../../pages';
import { Button, IconButton, Toggle, Input } from '../../../components';
import { Close } from '../../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { removeHomebrewRaceRequest } from '../../../requests/removeHomebrewRaceRequest';
import { copyHomebrewRaceRequest } from '../../../requests/copyHomebrewRaceRequest';
import { copyToClipboard } from '../../../helpers';

export const HomebrewRaces = (props) => {
  const [copyRaceId, setCopyRaceId] = createSignal('');

  const [appState] = useAppState();
  const [{ renderAlerts, renderAlert, renderNotice }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const copyRace = async () => {
    const result = await copyHomebrewRaceRequest(appState.accessToken, props.provider, copyRaceId());

    if (result.errors_list === undefined) props.reloadHomebrews();
    else renderAlert(result.errors_list);
  }

  const removeRace = async (event, id) => {
    event.stopPropagation();

    const result = await removeHomebrewRaceRequest(appState.accessToken, props.provider, id);
    if (result.errors_list === undefined) props.removeHomebrew('races', id);
    else renderAlerts(result.errors_list);
  }

  const copy = (value) => {
    copyToClipboard(value);
    renderNotice(t('alerts.copied'));
  }

  return (
    <div class="p-2 flex-1 overflow-y-auto">
      <div class="flex mb-2">
        <Button default size="small" classList="px-2" onClick={copyRace}>
          {t('copy')}
        </Button>
        <Input
          containerClassList="ml-2 flex-1"
          placeholder={t(`pages.homebrewPage.${props.provider}.copyPlaceholder`)}
          value={copyRaceId()}
          onInput={(value) => setCopyRaceId(value)}
        />
      </div>
      <Show when={props.homebrews !== undefined}>
        <div class="grid grid-cols-1 emd:grid-cols-2 elg:grid-cols-3 exl:grid-cols-4 gap-x-2">
          <For each={props.homebrews.races}>
            {(race) =>
              <Toggle isOpenByParent title={
                <div class="flex items-center">
                  <p class="flex-1 text-lg">{race.name}</p>
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
        </div>
      </Show>
    </div>
  );
}
