import { createSignal, createEffect, For, batch } from 'solid-js';

import { Toggle, ErrorWrapper, Checkbox, Input, Button } from '../../components';
import { useAppState, useAppLocale } from '../../context';
import { updateCharacterRequest } from '../../requests/updateCharacterRequest';

const TRANSLATION = {
  en: {
    title: 'Languages',
    add: 'Add language'
  },
  ru: {
    title: 'Известные языки',
    add: 'Добавить язык'
  },
  es: {
    title: 'Languajes',
    add: 'Añadir idioma'
  }
}

export const Languages = (props) => {
  const character = () => props.character;

  const [lastActivePageId, setLastActivePageId] = createSignal(undefined);
  const [languages, setLanguages] = createSignal([]);
  const [language, setLanguage] = createSignal('');

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActivePageId() === appState.activePageParams.id) return;

    batch(() => {
      setLanguages(character().languages);
      setLastActivePageId(character().id);
    });
  });

  const toggleLanguage = (slug) => {
    const newValue = languages().includes(slug) ? languages().filter((item) => item !== slug) : languages().concat(slug);
    refreshCharacter(newValue);
  }

  const saveLanguage = () => {
    if (Object.keys(props.defaults).includes(language())) return;
    if (languages().includes(language())) return;

    refreshCharacter(languages().concat(language()));
  }

  const refreshCharacter = async (newValue) => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { languages: newValue }, only_head: true }
    );
    if (result.errors_list === undefined) {
      batch(() => {
        setLanguages(newValue);
        setLanguage('');
      });
    }
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Languages' }}>
      <Toggle title={TRANSLATION[locale()].title}>
        <For each={Object.entries(props.defaults)}>
          {([slug, language]) =>
            <div class="mb-1">
              <Checkbox
                labelText={language.name[locale()]}
                labelPosition="right"
                labelClassList="text-sm ml-4"
                checked={languages().includes(slug)}
                onToggle={() => toggleLanguage(slug)}
              />
            </div>
          }
        </For>
        <For each={languages().filter((item) => !Object.keys(props.defaults).includes(item))}>
          {(language) =>
            <div class="mb-1">
              <Checkbox
                labelText={language}
                labelPosition="right"
                labelClassList="text-sm ml-4"
                checked={true}
                onToggle={() => toggleLanguage(language)}
              />
            </div>
          }
        </For>
        <div class="flex items-center gap-x-2 mt-2">
          <Input
            containerClassList=""
            value={language()}
            onInput={setLanguage}
          />
          <Button default textable onClick={saveLanguage}>{TRANSLATION[locale()].add}</Button>
        </div>
      </Toggle>
    </ErrorWrapper>
  );
}
