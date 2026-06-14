import { createSignal, createEffect, For, Show, batch } from 'solid-js';

import { ErrorWrapper, EditWrapper, Text, Input } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    title: 'Backstory',
    kinds: {
      description: 'Personal Description',
      ideology: 'Ideology/Beliefs',
      people: 'Significant People',
      locations: 'Meaningful Locations',
      treasure: 'Treasured Possessions',
      traits: 'Traits',
      scars: 'Injuries & Scars',
      phobias: 'Phobias & Manias',
      tomes: 'Arcane Tomes, Spells & Artifacts',
      strange: 'Encounters with Strange Entities'
    }
  },
  ru: {
    title: 'Биография',
    kinds: {
      description: 'Описание',
      ideology: 'Идеалы и принципы',
      people: 'Значимые люди',
      locations: 'Важные места',
      treasure: 'Ценное имущество',
      traits: 'Черты',
      scars: 'Травмы и шрамы',
      phobias: 'Фобии и мании',
      tomes: 'Магические книги, заклинания, артефакты',
      strange: 'Встречи со сверхъестественным'
    }
  },
  es: {
    title: 'Backstory',
    kinds: {
      description: 'Personal Description',
      ideology: 'Ideology/Beliefs',
      people: 'Significant People',
      locations: 'Meaningful Locations',
      treasure: 'Treasured Possessions',
      traits: 'Traits',
      scars: 'Injuries & Scars',
      phobias: 'Phobias & Manias',
      tomes: 'Arcane Tomes, Spells & Artifacts',
      strange: 'Encounters with Strange Entities'
    }
  }
}
const KEYS = ['description', 'ideology', 'people', 'locations', 'treasure', 'traits', 'scars', 'phobias', 'tomes', 'strange'];

export const Cthulhu7Backstory = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);

  const [backstory, setBackstory] = createSignal({});

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setBackstory(Object.fromEntries(Object.entries(character()).filter(([key,]) => KEYS.includes(key))));
      setLastActiveCharacterId(character().id);
    });
  });

  const cancelEditing = () => {
    batch(() => {
      setBackstory(Object.fromEntries(Object.entries(character()).filter(([key,]) => KEYS.includes(key))));
      setEditMode(false);
    });
  }

  const updateCharacter = async () => {
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: backstory(), only_head: true });

    if (result.errors_list === undefined) {
      batch(() => {
        setEditMode(false);
        props.onReplaceCharacter(backstory());
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Cthulhu7Backstory' }}>
      <EditWrapper
        position="right"
        editMode={editMode()}
        onSetEditMode={setEditMode}
        onCancelEditing={cancelEditing}
        onSaveChanges={updateCharacter}
      >
        <div class="blockable blockable-padding">
          <h2 class="text-lg mb-4">{localize(TRANSLATION, locale()).title}</h2>
          <div class="flex flex-col gap-4">
            <Show
              when={editMode()}
              fallback={
                <For each={KEYS}>
                  {(kind) =>
                    <Text
                      labelText={localize(TRANSLATION, locale()).kinds[kind]}
                      text={character()[kind] && character()[kind].length > 0 ? character()[kind] : '-'}
                      textClassList="text-xl"
                    />
                  }
                </For>
              }
            >
              <For each={KEYS}>
                {(kind) =>
                  <Input labelText={localize(TRANSLATION, locale()).kinds[kind]} value={backstory()[kind]} onInput={(value) => setBackstory({ ...backstory(), [kind]: value })} />
                }
              </For>
            </Show>
          </div>
        </div>
      </EditWrapper>
    </ErrorWrapper>
  );
}
