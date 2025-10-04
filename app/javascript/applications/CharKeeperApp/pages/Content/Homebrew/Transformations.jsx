import { createSignal, Switch, Match, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { DaggerheartTransformation } from '../../../pages';
import { Button, IconButton, Toggle, Input } from '../../../components';
import { Close } from '../../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { removeHomebrewTransformationRequest } from '../../../requests/removeHomebrewTransformationRequest';
import { copyHomebrewTransformationRequest } from '../../../requests/copyHomebrewTransformationRequest';
import { copyToClipboard } from '../../../helpers';

export const HomebrewTransformations = (props) => {
  const [copyTransformationId, setCopyTransformationId] = createSignal('');

  const [appState] = useAppState();
  const [{ renderAlerts, renderAlert, renderNotice }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const copyTransformation = async () => {
    const result = await copyHomebrewTransformationRequest(appState.accessToken, props.provider, copyTransformationId());

    if (result.errors_list === undefined) props.reloadHomebrews();
    else renderAlert(result.errors_list);
  }

  const removeTransformation = async (event, id) => {
    event.stopPropagation();

    const result = await removeHomebrewTransformationRequest(appState.accessToken, props.provider, id);
    if (result.errors_list === undefined) props.removeHomebrew('transformations', id);
    else renderAlerts(result.errors_list);
  }

  const copy = (value) => {
    copyToClipboard(value);
    renderNotice(t('alerts.copied'));
  }

  return (
    <div class="p-2 flex-1 overflow-y-auto">
      <p class="mb-2 dark:text-snow">{t('pages.homebrewPage.modulesHelp')}</p>
      <div class="flex mb-2">
        <Button default size="small" classList="px-2" onClick={copyTransformation}>
          {t('copy')}
        </Button>
        <Input
          containerClassList="ml-2 flex-1"
          placeholder={t(`pages.homebrewPage.${props.provider}.copyPlaceholder`)}
          value={copyTransformationId()}
          onInput={(value) => setCopyTransformationId(value)}
        />
      </div>
      <Show when={props.homebrews !== undefined}>
        <div class="grid grid-cols-1 emd:grid-cols-2 elg:grid-cols-3 exl:grid-cols-4 gap-x-2">
          <For each={props.homebrews.transformations}>
            {(transformation) =>
              <Toggle isOpenByParent title={
                <div class="flex items-center">
                  <p class="flex-1 text-lg">{transformation.name}</p>
                  <IconButton onClick={(e) => removeTransformation(e, transformation.id)}>
                    <Close />
                  </IconButton>
                </div>
              }>
                <Switch>
                  <Match when={props.provider === 'daggerheart'}>
                    <DaggerheartTransformation transformationId={transformation.id} feats={props.homebrews.feats} />
                  </Match>
                </Switch>
                <p class="absolute bottom-0 right-0 px-2 py-1 dark:text-snow cursor-pointer" onClick={() => copy(transformation.id)}>
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
