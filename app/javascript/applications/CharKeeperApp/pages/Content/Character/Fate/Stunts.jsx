import { createSignal, createEffect, Show, For, batch } from 'solid-js';
import { Key } from '@solid-primitives/keyed';

import { ErrorWrapper, EditWrapper, Button, Input, TextArea, Select, Dice } from '../../../../components';
import { useAppState, useAppAlert, useAppLocale } from '../../../../context';
import config from '../../../../data/fate.json';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { translate, modifier, localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    title: 'Stunts',
    addStunt: 'Add stunt',
    stuntTitle: 'Title',
    description: 'Description',
    skill: 'Skill',
    removeStunt: 'Remove stunt',
    check: 'Stunt'
  },
  ru: {
    title: 'Трюки',
    addStunt: 'Добавить трюк',
    stuntTitle: 'Заголовок',
    description: 'Описание',
    skill: 'Навык',
    removeStunt: 'Удалить трюк',
    check: 'Трюк'
  },
  es: {
    title: 'Trucos',
    addStunt: 'Añadir truco',
    stuntTitle: 'Título',
    description: 'Descripción',
    skill: 'Habilidad',
    removeStunt: 'Eliminar truco',
    check: 'Truco'
  }
}

export const FateStunts = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [stunts, setStunts] = createSignal({});

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setStunts(character().stunts);
      setLastActiveCharacterId(character().id);
    });
  });

  const cancelEditing = () => {
    batch(() => {
      setEditMode(false);
      setStunts(character().stunts);
    });
  }

  const addStunt = () => {
    setStunts(stunts().concat({ id: Math.floor(Math.random() * 1000), title: '', description: '', skill: null }));
  }

  const changeStunt = (id, attribute, value) => {
    setStunts(
      stunts().map((item) => {
        if (item.id !== id) return item;

        return { ...item, [attribute]: value };
      })
    )
  }

  const removeStunt = (id) => setStunts(stunts().filter((item) => item.id !== id));

  const updateCharacter = async () => {
    const payload = stunts().filter((item) => item.title.length > 0 && item.description.length > 0);
    if (payload.length > 5) return;

    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { stunts: payload }, only_head: true }
    );

    if (result.errors_list === undefined) setEditMode(false);
    else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'FateStunts' }}>
      <EditWrapper
        editMode={editMode()}
        onSetEditMode={setEditMode}
        onCancelEditing={cancelEditing}
        onSaveChanges={updateCharacter}
      >
        <div class="blockable p-4">
          <h2 class="text-lg">{TRANSLATION[locale()].title}</h2>
          <Show
            when={editMode()}
            fallback={
              <For each={stunts()}>
                {(stunt) =>
                  <div class="mt-4">
                    <p class="mb-2 text-lg! flex items-center gap-x-4">
                      {stunt.title}
                      <Show when={stunt.skill}>
                        <Dice
                          width="30"
                          height="30"
                          text={modifier(character().selected_skills[stunt.skill] + 2)}
                          onClick={() => props.openDiceRoll(`/check stunt ${stunt.title}`, character().selected_skills[stunt.skill] + 2, `${localize(TRANSLATION, locale()).check}, ${stunt.title}`)}
                        />
                      </Show>
                    </p>
                    <p class="feat-markdown">{stunt.description}</p>
                  </div>
                }
              </For>
            }
          >
            <>
              <Key each={stunts()} by={item => item.id}>
                {(stunt) =>
                  <div class="mt-4">
                    <Input
                      containerClassList="mb-1"
                      labelText={TRANSLATION[locale()].stuntTitle}
                      value={stunt().title}
                      onInput={(value) => changeStunt(stunt().id, 'title', value)}
                    />
                    <TextArea
                      rows="3"
                      containerClassList="mb-1"
                      labelText={TRANSLATION[locale()].description}
                      value={stunt().description}
                      onChange={(value) => changeStunt(stunt().id, 'description', value)}
                    />
                    <Select
                      labelText={TRANSLATION[locale()].skill}
                      items={translate(config.skills, locale())}
                      selectedValue={stunt().skill}
                      onSelect={(value) => changeStunt(stunt().id, 'skill', value)}
                    />
                    <div class="flex justify-start mt-2">
                      <Button default classList="px-2" onClick={() => removeStunt(stunt().id)}>
                        {TRANSLATION[locale()].removeStunt}
                      </Button>
                    </div>
                  </div>
                }
              </Key>
              <div class="flex justify-start mt-4">
                <Button default classList="px-2" onClick={addStunt}>{TRANSLATION[locale()].addStunt}</Button>
              </div>
            </>
          </Show>
        </div>
      </EditWrapper>
    </ErrorWrapper>
  );
}
