import { createSignal, createEffect, For, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Button, Input, ErrorWrapper, Toggle, GuideWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Plus, Minus, Close, Check } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier } from '../../../../helpers';

const TRANSLATION = {
  en: {
    helpMessage: "Your character starts with two Experiences (each with a +2 modifier)."
  },
  ru: {
    helpMessage: "Ваш персонаж начинает приключение с 2 опытами (каждый с модификатором +2)."
  }
}

export const DaggerheartExperience = (props) => {
  const object = () => props.object;

  const [lastActiveObjectId, setLastActiveObjectId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [name, setName] = createSignal('');
  const [experienceData, setExperienceData] = createSignal(object().experience);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (lastActiveObjectId() === object().id) return;

    batch(() => {
      setExperienceData(object().experience);
      setLastActiveObjectId(object().id);
    });
  });

  const enterEditMode = (e) => {
    e.stopPropagation();

    setEditMode(true);
  }

  const cancelEditing = () => {
    batch(() => {
      setName('');
      setEditMode(false);
    });
  }

  const addExperience = () => {
    const payload = experienceData().concat({ id: Math.floor(Math.random() * 1000), exp_name: name(), exp_level: 2 });
    setExperienceData(payload);
    saveExperience({ experience: payload });
  }

  const removeExperience = (expId) => {
    const payload = experienceData().filter((item) => item.id !== expId);
    setExperienceData(payload);
    saveExperience({ experience: payload });
  }

  const changeExperience = (exp, value) => {
    if (exp.exp_level === 0 && value === -1) return;

    const payload = experienceData().slice().map((item) => {
      if (exp.id !== item.id) return item;

      return { ...item, exp_level: exp.exp_level + value };
    });
    setExperienceData(payload);
    saveExperience({ experience: payload });
  }

  const saveExperience = async (payload) => {
    let result;
    if (props.callback) {
      await props.callback(payload);
      cancelEditing();
    } else {
      let onlyHead = true;
      if (object().guide_step && payload.experience.length >= 2) {
        payload = { ...payload, guide_step: object().guide_step + 1 };
        onlyHead = false;
      }

      result = await updateCharacterRequest(
        appState.accessToken, object().provider, object().id, { character: payload, only_head: true }
      );

      if (result.errors_list === undefined) {
        batch(() => {
          if (onlyHead) props.onReplaceCharacter(payload);
          else props.onReloadCharacter();
          cancelEditing();
        });
      } else renderAlerts(result.errors_list);
    }
  }

  return (
    <ErrorWrapper payload={{ character_id: object().id, key: 'DaggerheartExperience' }}>
      <GuideWrapper
        character={object()}
        guideStep={2}
        helpMessage={TRANSLATION[locale()]['helpMessage']}
        onReloadCharacter={props.onReloadCharacter}
      >
        <Toggle
          disabled
          isOpen
          title={
            <div class="flex justify-between items-center">
              <h2 class="flex-1 text-lg dark:text-snow">{t('daggerheart.experience.title')}</h2>
              <Show when={!editMode()}>
                <Button default size="small" onClick={(e) => enterEditMode(e)}>
                  <Plus />
                </Button>
              </Show>
            </div>
          }
        >
          <Show when={editMode()}>
            <div class="flex items-center gap-2 mb-4">
              <Input
                containerClassList="flex-1"
                value={name()}
                onInput={(value) => setName(value)}
              />
              <Show when={name().length > 0}>
                <Button outlined onClick={cancelEditing}><Close width="30" height="30" /></Button>
                <Button default onClick={addExperience}><Check width="20" height="20" /></Button>
              </Show>
            </div>
          </Show>
          <div class="experiences">
            <For each={object().experience}>
              {(exp) =>
                <div class="experience">
                  <p class="flex-1">{exp.exp_name}</p>
                  <div class="flex ml-4">
                    <Button default size="small" classList="opacity-75" onClick={() => changeExperience(exp, -1)}>
                      <Minus />
                    </Button>
                    <p class="mx-2 w-6 text-center">{modifier(exp.exp_level)}</p>
                    <Button default size="small" classList="opacity-75" onClick={() => changeExperience(exp, 1)}>
                      <Plus />
                    </Button>
                  </div>
                  <Button default size="small" classList="ml-4 opacity-75" onClick={() => removeExperience(exp.id)}>
                    <Close />
                  </Button>
                </div>
              }
            </For>
          </div>
        </Toggle>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
