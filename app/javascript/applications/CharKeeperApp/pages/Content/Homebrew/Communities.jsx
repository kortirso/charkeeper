import { createSignal, Switch, Match, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { DaggerheartCommunity } from '../../../pages';
import { Button, IconButton, Toggle, Input } from '../../../components';
import { Close } from '../../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { removeHomebrewCommunityRequest } from '../../../requests/removeHomebrewCommunityRequest';
import { copyHomebrewCommunityRequest } from '../../../requests/copyHomebrewCommunityRequest';
import { copyToClipboard } from '../../../helpers';

export const HomebrewCommunities = (props) => {
  const [copyCommunityId, setCopyCommunityId] = createSignal('');

  const [appState] = useAppState();
  const [{ renderAlerts, renderAlert, renderNotice }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const copyCommunity = async () => {
    const result = await copyHomebrewCommunityRequest(appState.accessToken, props.provider, copyCommunityId());

    if (result.errors_list === undefined) props.reloadHomebrews();
    else renderAlert(result.errors_list);
  }

  const removeCommunity = async (event, id) => {
    event.stopPropagation();

    const result = await removeHomebrewCommunityRequest(appState.accessToken, props.provider, id);
    if (result.errors_list === undefined) props.removeHomebrew('communities', id);
    else renderAlerts(result.errors_list);
  }

  const copy = (value) => {
    copyToClipboard(value);
    renderNotice(t('alerts.copied'));
  }

  return (
    <div class="p-2">
      <div class="flex mb-2">
        <Button default size="small" classList="px-2" onClick={copyCommunity}>
          {t('copy')}
        </Button>
        <Input
          containerClassList="ml-2 flex-1"
          placeholder={t(`pages.homebrewPage.${props.provider}.copyPlaceholder`)}
          value={copyCommunityId()}
          onInput={(value) => setCopyCommunityId(value)}
        />
      </div>
      <Show when={props.homebrews !== undefined}>
        <div class="grid grid-cols-1 emd:grid-cols-2 elg:grid-cols-3 exl:grid-cols-4 gap-x-2">
          {console.log(props.homebrews)}
          <For each={props.homebrews.communities}>
            {(community) =>
              <Toggle isOpen title={
                <div class="flex items-center">
                  <p class="flex-1 text-lg">{community.name}</p>
                  <IconButton onClick={(e) => removeCommunity(e, community.id)}>
                    <Close />
                  </IconButton>
                </div>
              }>
                <Switch>
                  <Match when={props.provider === 'daggerheart'}>
                    <DaggerheartCommunity communityId={community.id} feats={props.homebrews.feats} />
                  </Match>
                </Switch>
                <p class="absolute bottom-0 right-0 px-2 py-1 dark:text-snow cursor-pointer" onClick={() => copy(community.id)}>
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
