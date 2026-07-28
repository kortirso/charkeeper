import { createSignal, createEffect, createMemo, Show } from 'solid-js';

import { Button, ErrorWrapper, GuideWrapper, Select, Languages } from '../../../../components';
import config from '../../../../data/nimble.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Upgrade } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { translate, localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    currentLevel: 'level',
    saveButton: 'Save',
    selectSubclass: 'Select subclass',
    updated: 'Character is updated'
  },
  ru: {
    currentLevel: 'уровень',
    saveButton: 'Сохранить',
    selectSubclass: 'Выберите подкласс',
    updated: 'Персонаж обновлён'
  },
  es: {
    currentLevel: 'nivel',
    saveButton: 'Guardar',
    selectSubclass: 'Selecciona una subclase',
    updated: 'Personaje actualizado'
  }
}

export const NimbleLeveling = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [subclass, setSubclass] = createSignal(null);

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    setLastActiveCharacterId(character().id);
  });

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const availableSubclasses = createMemo(() => translate(config.classes[character().main_class].subclasses, locale()));

  const levelUp = () => updateCharacter({ level: character().level + 1 });

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
    <ErrorWrapper payload={{ character_id: character().id, key: 'NimbleLeveling' }}>
      <GuideWrapper
        character={character()}
        guideStep={4}
        helpMessage={props.helpMessage}
        onReloadCharacter={props.onReloadCharacter}
        finishGuideStep={true}
      >
        <div class="character-info-block mb-2">
          <div class="flex items-center">
            <Button default classList="rounded mr-4" onClick={levelUp}><Upgrade width="24" height="24" /></Button>
            <p>
              <Show
                when={character().subclass}
                fallback={localize(config.classes[character().main_class].name, locale())}
              >
                {localize(config.classes[character().main_class].subclasses[character().subclass].name, locale())}
              </Show>
              {' '}- {character().level} {i18n().currentLevel}
            </p>
          </div>
          <Show when={character().level >= 3 && !character().subclass}>
            <Select
              labelText={i18n().selectSubclass}
              containerClassList="mt-2"
              items={availableSubclasses()}
              selectedValue={subclass()}
              onSelect={setSubclass}
            />
            <Show when={subclass()}>
              <Button default textable size="small" classList="inline-block mt-2" onClick={() => updateCharacter({ subclass: subclass() })}>
                <span>{i18n().saveButton}</span>
              </Button>
            </Show>
          </Show>
        </div>
        <Languages character={character()} defaults={config.languages} onReplaceCharacter={props.onReplaceCharacter} />
      </GuideWrapper>
    </ErrorWrapper>
  );
}
