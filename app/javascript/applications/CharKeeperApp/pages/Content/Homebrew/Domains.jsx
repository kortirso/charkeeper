import { createSignal, Switch, Match, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { DaggerheartDomain } from '../../../pages';
import { Button, IconButton, Toggle, Input } from '../../../components';
import { Close } from '../../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { removeHomebrewDomainRequest } from '../../../requests/removeHomebrewDomainRequest';
import { copyHomebrewDomainRequest } from '../../../requests/copyHomebrewDomainRequest';
import { copyToClipboard } from '../../../helpers';

export const HomebrewDomains = (props) => {
  const [copyDomainId, setCopyDomainId] = createSignal('');

  const [appState] = useAppState();
  const [{ renderAlerts, renderAlert, renderNotice }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const copyDomain = async () => {
    const result = await copyHomebrewDomainRequest(appState.accessToken, props.provider, copyDomainId());

    if (result.errors_list === undefined) props.reloadHomebrews();
    else renderAlert(result.errors_list);
  }

  const removeDomain = async (event, id) => {
    event.stopPropagation();

    const result = await removeHomebrewDomainRequest(appState.accessToken, props.provider, id);
    if (result.errors_list === undefined) props.removeHomebrew('domains', id);
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
        <Button default size="small" classList="px-2" onClick={copyDomain}>
          {t('copy')}
        </Button>
        <Input
          containerClassList="ml-2 flex-1"
          placeholder={t(`pages.homebrewPage.${props.provider}.copyPlaceholder`)}
          value={copyDomainId()}
          onInput={(value) => setCopyDomainId(value)}
        />
      </div>
      <Show when={props.homebrews !== undefined}>
        <div class="grid grid-cols-1 emd:grid-cols-2 elg:grid-cols-3 exl:grid-cols-4 gap-x-2">
          <For each={props.homebrews.domains}>
            {(domain) =>
              <Toggle isOpenByParent title={
                <div class="flex items-center">
                  <p class="flex-1 text-lg">{domain.name}</p>
                  <IconButton onClick={(e) => removeDomain(e, domain.id)}>
                    <Close />
                  </IconButton>
                </div>
              }>
                <Switch>
                  <Match when={props.provider === 'daggerheart'}>
                    <DaggerheartDomain domainId={domain.id} feats={props.homebrews.feats} />
                  </Match>
                </Switch>
                <p class="absolute bottom-0 right-0 px-2 py-1 dark:text-snow cursor-pointer" onClick={() => copy(domain.id)}>
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
