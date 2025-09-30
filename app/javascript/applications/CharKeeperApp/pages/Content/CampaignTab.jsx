import { createSignal, createEffect, Show, For, batch } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';
import * as i18n from '@solid-primitives/i18n';

import { PageHeader, IconButton, Button } from '../../components';
import { Arrow, Minus } from '../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { fetchCampaignRequest } from '../../requests/fetchCampaignRequest';
import { removeCampaignJoinRequest } from '../../requests/removeCampaignJoinRequest';

export const CampaignTab = (props) => {
  const size = createWindowSize();

  const [campaign, setCampaign] = createSignal({});
  const [characters, setCharacters] = createSignal([]);

  const [appState, { navigate }] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (appState.activePageParams.id === campaign().id) return;

    const fetchCampaign = async () => await fetchCampaignRequest(appState.accessToken, appState.activePageParams.id);

    Promise.all([fetchCampaign()]).then(
      ([campaignData]) => {
        batch(() => {
          setCampaign(campaignData.campaign);
          setCharacters(campaignData.campaign.characters);
        });
      }
    );
  });

  const deleteCharacter = async (characterId) => {
    const result = await removeCampaignJoinRequest(appState.accessToken, campaign().id, characterId);

    if (result.errors_list === undefined) setCharacters(characters().filter((item) => item.id !== characterId));
    else renderAlerts(result.errors_list);
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
          <p>{campaign().name}</p>
        </PageHeader>
      </Show>
      <div class="p-4 flex-1 flex flex-col overflow-y-auto">
        <div class="blockable p-4 mb-2">
          <p class="mb-2 dark:text-snow">{t('pages.campaignsPage.idForSearch')} - {appState.activePageParams.id}</p>
          <Show when={characters().length > 0}>
            <table class="w-full table first-column-full-width">
              <tbody>
                <For each={characters()}>
                  {(character) =>
                    <tr>
                      <td class="py-1 pl-1">
                        <p class="dark:text-snow">{character.name}</p>
                      </td>
                      <Show when={!window.__TAURI_INTERNALS__}>
                        <td>
                          <p
                            class="dark:text-snow cursor-pointer"
                            onClick={() => navigate('characterView', { id: character.character_id })}
                          >PDF</p>
                        </td>
                      </Show>
                      <td>
                        <Button default size="small" onClick={() => deleteCharacter(character.id)}>
                          <Minus />
                        </Button>
                      </td>
                    </tr>
                  }
                </For>
              </tbody>
            </table>
          </Show>
        </div>
        <Button
          default
          classList="mb-2"
          onClick={() => navigate('campaignJoin', { id: campaign().id, provider: campaign().provider })}
        >
          {t(`pages.campaignsPage.join`)}
        </Button>
      </div>
    </>
  );
}
