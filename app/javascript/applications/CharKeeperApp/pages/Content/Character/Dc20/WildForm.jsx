import { createSignal, createEffect, createMemo } from 'solid-js';

import { Select, ErrorWrapper, GuideWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    transformation: 'Transforming to Wild Form',
    description: 'Select Wild Form or True Form.',
    updated: 'Character is updated'
  },
  ru: {
    transformation: 'Трансформация в дикую форму',
    description: 'Выберите дикую форму или истинную форму.',
    updated: 'Персонаж обновлён'
  }
}

export const Dc20WildForm = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    setLastActiveCharacterId(character().id);
  });

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload });
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReplaceCharacter(result.character);
        renderNotice(i18n().updated);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20WildForm' }}>
      <GuideWrapper character={character()}>
        <div class="blockable blockable-padding">
          <h2 class="text-lg mb-2">{i18n().transformation}</h2>
          <p>{i18n().description}</p>
          <Select
            withNull
            containerClassList="w-full mt-2"
            items={character().wild_forms}
            selectedValue={character().wild_form === null ? 'null' : character().wild_form}
            onSelect={(value) => updateCharacter({ wild_form: value })}
          />
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
