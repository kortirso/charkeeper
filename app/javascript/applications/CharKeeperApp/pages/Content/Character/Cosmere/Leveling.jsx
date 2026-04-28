import { createSignal, createEffect } from 'solid-js';

import { Button, ErrorWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Upgrade } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    currentLevel: 'level',
    updated: 'Character is updated'
  },
  ru: {
    currentLevel: 'уровень',
    updated: 'Персонаж обновлён'
  },
  es: {
    currentLevel: 'nivel',
    updated: 'Personaje actualizado'
  }
}

export const CosmereLeveling = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    setLastActiveCharacterId(character().id);
  });

  const updateCharacter = async (payload, onlyHead = false) => {
    const requestPayload = { character: payload, only_head: onlyHead }
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, requestPayload);
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReplaceCharacter(onlyHead ? payload : result.character);
        renderNotice(localize(TRANSLATION, locale()).updated)
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'CosmereLeveling' }}>
      <div class="blockable py-4 px-2 mb-2">
        <div class="flex items-center">
          <Button default classList="rounded mr-4" onClick={() => updateCharacter({ level: character().level + 1 })}>
            <Upgrade width="24" height="24" />
          </Button>
          <p>{character().level} {localize(TRANSLATION, locale()).currentLevel}</p>
        </div>
      </div>
    </ErrorWrapper>
  );
}
