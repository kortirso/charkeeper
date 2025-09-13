import { createSignal, createEffect, Show, batch, For } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';
import * as i18n from '@solid-primitives/i18n';

import { PageHeader, IconButton, Button } from '../../components';
import { Arrow, Plus } from '../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { fetchCharactersRequest } from '../../requests/fetchCharactersRequest';
import { createCampaignJoinRequest } from '../../requests/createCampaignJoinRequest';

export const CampaignJoinTab = (props) => {
  const size = createWindowSize();

  const [characters, setCharacters] = createSignal([]);
  const [campaignId, setCampaignId] = createSignal(undefined);

  const [appState, { navigate }] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (appState.activePageParams.id === campaignId()) return;

    const fetchCharacters = async () => await fetchCharactersRequest(appState.accessToken);

    Promise.all([fetchCharacters()]).then(
      ([charactersData]) => {
        batch(() => {
          setCharacters(charactersData.characters.filter((item) => item.provider === appState.activePageParams.provider));
          setCampaignId(appState.activePageParams.id);
        });
      }
    );
  });

  const joinCharacter = async (characterId) => {
    const result = await createCampaignJoinRequest(appState.accessToken, campaignId(), { character_id: characterId });

    if (result.errors_list === undefined) navigate('campaign', { id: campaignId() });
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
        />
      </Show>
      <div class="p-4 flex-1 flex flex-col overflow-y-scroll">
        <div class="blockable p-4">
          <p class="mb-2 dark:text-snow">{t('pages.campaignsPage.selectCharacterForJoining')}</p>
          <Show when={characters().length > 0}>
            <table class="w-full table first-column-full-width">
              <tbody>
                <For each={characters()}>
                  {(character) =>
                    <tr>
                      <td class="py-1 pl-1">
                        <p class="dark:text-snow">{character.name}</p>
                      </td>
                      <td>
                        <Button default size="small" onClick={() => joinCharacter(character.id)}>
                          <Plus />
                        </Button>
                      </td>
                    </tr>
                  }
                </For>
              </tbody>
            </table>
          </Show>
        </div>
      </div>
    </>
  );
}
