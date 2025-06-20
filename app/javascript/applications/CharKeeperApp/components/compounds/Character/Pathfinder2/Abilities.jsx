import { createSignal, For, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Levelbox, Button } from '../../../atoms';

import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall, Minus, Edit, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

import { modifier } from '../../../../helpers';

const SAVING_THROWS = { con: 'fortitude', dex: 'reflex', wis: 'will' }

export const Pathfinder2Abilities = (props) => {
  const character = () => props.character;

  const [editMode, setEditMode] = createSignal(false);
  const [abilitiesData, setAbilitiesData] = createSignal(character().abilities);
  const [skillsData, setSkillsData] = createSignal(character().skills);
  const [savingThrowsData, setSavingThrowsData] = createSignal(character().saving_throws);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const decreaseAbilityValue = (slug) => {
    setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] - 1 });
  }

  const increaseAbilityValue = (slug) => setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] + 1 });

  const updateSkill = (slug) => {
    const result = skillsData().slice().map((item) => {
      if (item.slug !== slug) return item;

      const newValue = item.level === 4 ? 0 : (item.level + 1);
      return { ...item, level: newValue } 
    });
    setSkillsData(result);
  }

  const updateSavingThrow = (slug) => {
    const newValue = savingThrowsData()[slug] === 4 ? 0 : (savingThrowsData()[slug] + 1);
    setSavingThrowsData({ ...savingThrowsData(), [slug]: newValue });
  }

  const cancelEditing = () => {
    batch(() => {
      setAbilitiesData(character().abilities);
      setSkillsData(character().skills);
      setEditMode(false);
    });
  }

  const updateCharacter = async () => {
    const transformedAbilities = Object.fromEntries(
      Object.entries(abilitiesData()).map(([key, value]) => [key, (value * 2) + 10])
    );
    const payload = {
      abilities: transformedAbilities,
      saving_throws: savingThrowsData(),
      selected_skills: skillsData()
        .filter((item) => item.slug !== 'lore1' && item.slug !== 'lore2' && item.level > 0)
        .reduce((acc, item) => {
          acc[item.slug] = item.level

          return acc
        }, {}),
      lore_skills: skillsData()
        .filter((item) => item.slug === 'lore1' || item.slug === 'lore2')
        .reduce((acc, item) => {
          acc[item.slug] = { name: item.name, level: item.level }

          return acc
        }, {}),
    }
    const result = await updateCharacterRequest(appState.accessToken, 'pathfinder2', character().id, { character: payload });

    if (result.errors === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setAbilitiesData(result.character.abilities);
        setSkillsData(result.character.skills);
        setSavingThrowsData(result.character.saving_throws);
        setEditMode(false);
      });
    } else renderAlerts(result.errors);
  }

  return (
    <>
      <For each={Object.entries(dict().dnd.abilities)}>
        {([slug, ability]) =>
          <div class="white-box p-4 mb-2">
            <p class="uppercase text-center mb-4">{ability}</p>
            <div class="flex">
              <div class="w-32 mr-8">
                <div class="h-20">
                  <div class="mx-auto w-20 h-20 rounded-full border border-gray-200 flex items-center justify-center">
                    <p class="text-4xl">{editMode() ? abilitiesData()[slug] : character().abilities[slug]}</p>
                  </div>
                </div>
                <Show when={editMode()}>
                  <div class="mt-2 flex justify-center gap-2">
                    <Button default size="small" onClick={() => decreaseAbilityValue(slug)}>
                      <Minus />
                    </Button>
                    <Button default size="small" onClick={() => increaseAbilityValue(slug)}>
                      <PlusSmall />
                    </Button>
                  </div>
                </Show>
              </div>
              <div class="flex-1">
                <For each={Object.entries(SAVING_THROWS)}>
                  {([savingAbility, savingName]) =>
                    <Show when={savingAbility === slug}>
                      <div class="flex justify-between items-center mb-2">
                        <Show when={editMode()} fallback={<p />}>
                          <Levelbox
                            value={savingThrowsData()[savingName]}
                            onToggle={() => updateSavingThrow(savingName)}
                          />
                        </Show>
                        <p class="flex items-center">
                          <span class="mr-2">{t(`pathfinder2.savingThrows.${savingName}`)}</span>
                          <span>{modifier(character().saving_throws_value[savingName])}</span>
                        </p>
                      </div>
                    </Show>
                  }
                </For>
                <For each={(editMode() ? skillsData() : character().skills).filter((item) => item.ability === slug)}>
                  {(skill) =>
                    <div class="flex justify-between items-center mb-1">
                      <Show when={editMode()} fallback={<p />}>
                        <Levelbox
                          value={skill.level}
                          onToggle={() => updateSkill(skill.slug)}
                        />
                      </Show>
                      <p class={`flex items-center ${skill.level > 0 ? '' : 'font-cascadia-light'}`}>
                        <span class="mr-2">{skill.name || t(`pathfinder2.skills.${skill.slug}`)}</span>
                        <span>{modifier(skill.modifier + skill.prof + skill.item + (skill.armor || 0))}</span>
                      </p>
                    </div>
                  }
                </For>
              </div>
            </div>
          </div>
        }
      </For>
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
