import { createSignal, For, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { Key } from '@solid-primitives/keyed';

import { Button, Input, ErrorWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Edit, Plus, Close } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier } from '../../../../helpers';

export const DaggerheartExperience = (props) => {
  const character = () => props.character;

  const [editMode, setEditMode] = createSignal(false);
  const [experienceData, setExperienceData] = createSignal(character().experience);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const cancelEditing = () => {
    batch(() => {
      setExperienceData(character().experience);
      setEditMode(false);
    });
  }

  const updateCharacter = async () => {
    const payload = { experience: experienceData() };
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload }
    );

    if (result.errors === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setEditMode(false);
      });
    } else renderAlerts(result.errors);
  }

  const addDraftExperience = () => {
    setExperienceData(experienceData().concat({ id: Math.floor(Math.random() * 1000), exp_name: '', exp_level: 1 }));
  }

  const removeExperience = (expId) => setExperienceData(experienceData().filter((item) => item.id !== expId));

  const changeExperience = (expId, attribute, value) => {
    const result = experienceData().slice().map((item) => {
      if (expId !== item.id) return item;

      return { ...item, [attribute]: value }
    });
    setExperienceData(result);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartExperience' }}>
      <div class="relative">
        <div class="blockable p-4 mt-2">
          <h2 class="text-lg dark:text-snow">{t('daggerheart.experience.title')}</h2>
          <Show
            when={editMode()}
            fallback={
              <For each={character().experience}>
                {(exp) =>
                  <div class="flex mt-2 dark:text-snow">
                    <p class="mr-4">{exp.exp_name}</p>
                    <p>{modifier(exp.exp_level)}</p>
                  </div>
                }
              </For>
            }
          >
            <Key each={experienceData()} by={item => item.id}>
              {(exp) =>
                <div class="flex mt-2">
                  <Input
                    containerClassList="flex-1 mr-4"
                    value={exp().exp_name}
                    onInput={(value) => changeExperience(exp().id, 'exp_name', value)}
                  />
                  <Input
                    numeric
                    containerClassList="w-1/4"
                    value={exp().exp_level}
                    onInput={(value) => changeExperience(exp().id, 'exp_level', value)}
                  />
                  <div class="flex flex-col justify-center">
                    <Button default size="small" classList="ml-4" onClick={() => removeExperience(exp().id)}>
                      <Close />
                    </Button>
                  </div>
                </div>
              }
            </Key>
            <div class="flex mt-2">
              <Button default size="small" onClick={addDraftExperience}>
                <Plus />
              </Button>
            </div>
          </Show>
        </div>

        <Show
          when={editMode()}
          fallback={
            <Button default classList='absolute bottom-0 right-0 rounded min-w-6 min-h-6 opacity-50' onClick={() => setEditMode(true)}>
              <Edit />
            </Button>
          }
        >
          <div class="absolute -bottom-6 right-0 flex justify-end z-10">
            <Button outlined classList='rounded min-w-6 min-h-6 mr-2' onClick={cancelEditing}>
              <Minus />
            </Button>
            <Button default classList='rounded min-w-6 min-h-6' onClick={updateCharacter}>
              <Plus />
            </Button>
          </div>
        </Show>
      </div>
    </ErrorWrapper>
  );
}
