import { For, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { ErrorWrapper, Button } from '../../../components';
import { useAppState, useAppLocale } from '../../../context';
import { Minus } from '../../../assets';

export const CampaignCharacters = (props) => {
  const campaign = () => props.campaign;

  const [appState, { navigate }] = useAppState();
  const [,dict] = useAppLocale();

  const t = i18n.translator(dict);

  return (
    <ErrorWrapper payload={{ campaign_id: campaign().id, key: 'CampaignCharacters' }}>
      <>
        <div class="blockable p-4">
          <h2 class="text-lg mb-2">{campaign().name}</h2>
          <p class="text-sm mb-2">{t('pages.campaignsPage.idForSearch')} - {appState.activePageParams.id}</p>
          <Show when={props.characters.length > 0}>
            <table class="w-full table first-column-full-width">
              <tbody>
                <For each={props.characters}>
                  {(character) =>
                    <tr>
                      <td class="py-1 pl-1">
                        <p>{character.name}</p>
                      </td>
                      <Show when={!window.__TAURI_INTERNALS__}>
                        <td>
                          <p
                            class="cursor-pointer"
                            onClick={() => navigate('characterView', { id: character.character_id })}
                          >PDF</p>
                        </td>
                      </Show>
                      <td>
                        <Button default size="small" onClick={() => props.onDeleteCharacter(character.id)}>
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
          classList="mt-4"
          onClick={() => navigate('campaignJoin', { id: campaign().id, provider: campaign().provider })}
        >
          {t(`pages.campaignsPage.join`)}
        </Button>
      </>
    </ErrorWrapper>
  );
}
