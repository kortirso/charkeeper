import { createMemo } from 'solid-js';

import { Select, ErrorWrapper, GuideWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    singerForm: 'Singer Form',
    updated: ''
  },
  ru: {
    singerForm: 'Формы Певца',
    updated: 'Персонаж обновлён'
  },
  es: {
    singerForm: 'Singer Form',
    updated: 'El personaje ha sido actualizado'
  }
}

export const CosmereSingerForm = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();

  const valuesForSelect = createMemo(() => {
    return Object.fromEntries(Object.entries(character().singer_forms).map(([slug, values]) => [slug, values.name]));
  });

  const updateCharacter = async (value) => {
    const payload = { singer_form: value };
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload });
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReplaceCharacter(result.character);
        renderNotice(localize(TRANSLATION, locale()).updated);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'CosmereSingerForm' }}>
      <GuideWrapper character={character()}>
        <div class="blockable py-4 px-2 md:px-4">
          <h2 class="text-lg">{localize(TRANSLATION, locale()).singerForm}</h2>
          <Select
            containerClassList="w-full mt-2"
            items={valuesForSelect()}
            selectedValue={character().singer_form}
            onSelect={updateCharacter}
          />
          <p
            class="feat-markdown mt-2"
            innerHTML={character().singer_forms[character().singer_form].description} // eslint-disable-line solid/no-innerhtml
          />
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
