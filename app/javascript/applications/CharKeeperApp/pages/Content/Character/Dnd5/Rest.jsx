import { batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { ErrorWrapper, Button } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { fetchCharacterRequest } from '../../../../requests/fetchCharacterRequest';
import { createCharacterRestRequest } from '../../../../requests/createCharacterRestRequest';

export const Dnd5Rest = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [{ renderNotice }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const restCharacter = async (payload) => {
    const result = await createCharacterRestRequest(appState.accessToken, character().provider, character().id, payload);
    if (result.errors === undefined) {
      const characterData = await fetchCharacterRequest(
        appState.accessToken,
        character().id,
        { only: 'health,energy,spent_spell_slots,spent_hit_dice' }
      );

      batch(() => {
        props.onReplaceCharacter(characterData.character);
        renderNotice(t('alerts.restIsFinished'));
      });
    }
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd5Rest' }}>
      <div class="blockable p-4">
        <p class="mb-4 dark:text-snow">{t('dndV2.rest.shortRestDescription')}</p>
        <p class="mb-4 dark:text-snow">{t('dndV2.rest.longRestDescription')}</p>
        <div class="flex justify-center items-center">
          <Button default textable classList="flex-1 mr-2" onClick={() => restCharacter({ type: 'short_rest' })}>
            <span class="font-cascadia-light">{t('rest.shortRest')}</span>
          </Button>
          <Button default textable classList="flex-1 ml-2" onClick={() => restCharacter({ type: 'long_rest' })}>
            <span class="font-cascadia-light">{t('rest.longRest')}</span>
          </Button>
        </div>
      </div>
    </ErrorWrapper>
  );
}
