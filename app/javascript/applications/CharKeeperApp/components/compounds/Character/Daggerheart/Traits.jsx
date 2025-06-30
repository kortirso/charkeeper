import { createSignal, createMemo, For, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { Key } from '@solid-primitives/keyed';

import { Button, Input, Select } from '../../../atoms';

import config from '../../../../data/daggerheart.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall, Minus, Edit, Plus, Close } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

import { modifier } from '../../../../helpers';

export const DaggerheartTraits = (props) => {
  const character = () => props.character;

  const [editMode, setEditMode] = createSignal(false);
  const [traitsData, setTraitsData] = createSignal(character().traits);
  const [experienceData, setExperienceData] = createSignal(character().experience);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const beastformsSelect = createMemo(() => {
    const result = Object.entries(config.beastforms).map(([key, values]) => [key, values.name[locale()]])
    result.push(['none', t('character.naturalForm')]);

    return Object.fromEntries(result);
  });

  const decreaseTraitValue = (slug) => {
    setTraitsData({ ...traitsData(), [slug]: traitsData()[slug] - 1 });
  }

  const increaseTraitValue = (slug) => setTraitsData({ ...traitsData(), [slug]: traitsData()[slug] + 1 });

  const cancelEditing = () => {
    batch(() => {
      setTraitsData(character().traits);
      setExperienceData(character().experience);
      setEditMode(false);
    });
  }

  const changeBeastform = async (value) => {
    const payload = { beastform: (value === 'none' ? null: value) }
    const result = await updateCharacterRequest(appState.accessToken, 'daggerheart', character().id, { character: payload });

    if (result.errors === undefined) {
      props.onReplaceCharacter(result.character);
    } else renderAlerts(result.errors);
  }

  const updateCharacter = async () => {
    const payload = {
      traits: traitsData(),
      experience: experienceData()
    }
    const result = await updateCharacterRequest(appState.accessToken, 'daggerheart', character().id, { character: payload });

    if (result.errors === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setEditMode(false);
      });
    } else renderAlerts(result.errors);
  }

  const addDraftExperience = () => {
    setExperienceData(
      experienceData().concat({ id: Math.floor(Math.random() * 1000), exp_name: '', exp_level: 1 })
    );
  }

  const removeExperience = (expId) => {
    setExperienceData(experienceData().filter((item) => item.id !== expId));
  }

  const changeExperience = (expId, attribute, value) => {
    const result = experienceData().slice().map((item) => {
      if (expId !== item.id) return item;

      return { ...item, [attribute]: value }
    });
    setExperienceData(result);
  }

  return (
    <>
      <div class="white-box flex flex-wrap p-4 pb-0">
        <For each={Object.entries(dict().daggerheart.traits)}>
          {([slug, ability]) =>
            <div class="w-1/3 mb-4">
              <p class="uppercase text-center mb-4">{ability}</p>
              <div class="mx-auto w-20 h-20 rounded-full border border-gray-200 flex items-center justify-center">
                <p class="text-4xl">{editMode() ? modifier(traitsData()[slug]) : modifier(character().modified_traits[slug])}</p>
              </div>
              <Show when={editMode()}>
                <div class="mt-2 flex justify-center gap-2">
                  <Button default size="small" onClick={() => decreaseTraitValue(slug)}>
                    <Minus />
                  </Button>
                  <Button default size="small" onClick={() => increaseTraitValue(slug)}>
                    <PlusSmall />
                  </Button>
                </div>
              </Show>
            </div>
          }
        </For>
      </div>
      <Show when={character().beastforms.length > 0}>
        <div class="white-box p-4 mt-2">
          <h2 class="text-lg mb-2">{t('character.beastTransformation')}</h2>
          <Select
            containerClassList="w-full"
            items={beastformsSelect()}
            selectedValue={character().beastform === null ? 'none' : character().beastform}
            onSelect={(value) => changeBeastform(value)}
          />
        </div>
      </Show>
      <div class="white-box p-4 mt-2">
        <h2 class="text-lg">{t('character.experience')}</h2>
        <Show
          when={editMode()}
          fallback={
            <For each={character().experience}>
              {(exp) =>
                <div class="flex mt-2">
                  <p class="text-lg flex-1 font-cascadia-light">{exp.exp_name}</p>
                  <p class="text-lg w-10">{modifier(exp.exp_level)}</p>
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
              <PlusSmall />
            </Button>
          </div>
        </Show>
      </div>
      <div class="absolute right-4 bottom-4 z-10">
        <Show
          when={editMode()}
          fallback={
            <Button default classList='rounded-full min-w-12 min-h-12 opacity-75' onClick={() => setEditMode(true)}>
              <Edit />
            </Button>
          }
        >
          <div class="flex">
            <Button outlined classList='rounded-full min-w-12 min-h-12 mr-2' onClick={cancelEditing}>
              <Minus />
            </Button>
            <Button default classList='rounded-full min-w-12 min-h-12' onClick={updateCharacter}>
              <Plus />
            </Button>
          </div>
        </Show>
      </div>
    </>
  );
}
