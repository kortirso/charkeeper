import { createSignal, For, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Checkbox, Button, Levelbox } from '../../../atoms';
import { ErrorWrapper } from '../../../molecules';

import { useAppLocale, useAppAlert, useAppState } from '../../../../context';
import { PlusSmall, Minus, Edit, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

import { modifier } from '../../../../helpers';

export const Dnd5Abilities = (props) => {
  const character = () => props.character;

  // changeable data
  const [editMode, setEditMode] = createSignal(false);
  const [abilitiesData, setAbilitiesData] = createSignal(character().abilities);
  const [skillsData, setSkillsData] = createSignal(character().skills);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const spendDice = async (dice, limit) => {
    let newValue;
    if (character().spent_hit_dice[dice] && character().spent_hit_dice[dice] < limit) {
      newValue = { ...character().spent_hit_dice, [dice]: character().spent_hit_dice[dice] + 1 };
    } else {
      newValue = { ...character().spent_hit_dice, [dice]: 1 };
    }

    const payload = { spent_hit_dice: newValue };
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload, only_head: true });

    if (result.errors === undefined) props.onReplaceCharacter(payload);
    else renderAlerts(result.errors);
  }

  const restoreDice = async (dice) => {
    let newValue;
    if (character().spent_hit_dice[dice] && character().spent_hit_dice[dice] > 0) {
      newValue = { ...character().spent_hit_dice, [dice]: character().spent_hit_dice[dice] - 1 };
    } else {
      newValue = { ...character().spent_hit_dice, [dice]: 0 };
    }

    const payload = { spent_hit_dice: newValue };
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload, only_head: true });

    if (result.errors === undefined) props.onReplaceCharacter(payload);
    else renderAlerts(result.errors);
  }

  const decreaseAbilityValue = (slug) => {
    if (abilitiesData[slug] === 1) return;
    setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] - 1 });
  }

  const increaseAbilityValue = (slug) => setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] + 1 });

  // submits
  const toggleSkill = (slug) => {
    const result = skillsData().slice().map((item) => {
      if (item.slug !== slug) return item;

      return { ...item, selected: !item.selected } 
    });
    setSkillsData(result);
  }

  const updateSkill = (slug) => {
    const result = skillsData().slice().map((item) => {
      if (item.slug !== slug) return item;

      const newValue = item.level === 2 ? 0 : (item.level === undefined ? 1 : (item.level + 1));
      return { ...item, level: newValue } 
    });
    setSkillsData(result);
  }

  const cancelEditing = () => {
    batch(() => {
      setAbilitiesData(character().abilities);
      setSkillsData(character().skills);
      setEditMode(false);
    });
  }

  const updateCharacter = async () => {
    let selectedSkills;
    if (character().provider === 'dnd2024') {
      selectedSkills = skillsData().reduce((acc, item) => { acc[item.slug] = item.level; return acc }, {})
    } else {
      selectedSkills = skillsData().filter((item) => item.selected).map((item) => item.slug)
    }

    const payload = {
      abilities: abilitiesData(),
      selected_skills: selectedSkills
    }
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload }
    );

    if (result.errors === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setSkillsData(result.character.skills);
        setAbilitiesData(result.character.abilities);
        setEditMode(false);
      });
    } else renderAlerts(result.errors);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd5Abilities' }}>
      <div class="white-box flex mb-2 p-4">
        <div class="flex-1 flex flex-col items-center">
          <p class="text-sm mb-1">{t('terms.proficiencyBonus')}</p>
          <p class="text-2xl mb-1">{modifier(character().proficiency_bonus)}</p>
        </div>
        <div class="flex-1">
          <p class="text-center text-sm">{t('terms.hitDices')}</p>
          <For each={Object.entries(character().hit_dice).filter(([, value]) => value > 0)}>
            {([dice, maxValue]) =>
              <div class="flex justify-center items-center mt-1">
                <p class="w-8 mr-4">d{dice}</p>
                <Button default size="small" onClick={() => character().spent_hit_dice[dice] !== maxValue ? spendDice(dice, maxValue) : null}>
                  <Minus />
                </Button>
                <p class="w-12 mx-1 text-center">
                  {character().spent_hit_dice[dice] ? (maxValue - character().spent_hit_dice[dice]) : maxValue}/{maxValue}
                </p>
                <Button default size="small" onClick={() => (character().spent_hit_dice[dice] || 0) > 0 ? restoreDice(dice) : null}>
                  <PlusSmall />
                </Button>
              </div>
            }
          </For>
        </div>
      </div>
      <For each={Object.entries(dict().dnd.abilities)}>
        {([slug, ability]) =>
          <div class="white-box p-4 mb-2">
            <p class="uppercase text-center mb-4">{ability}</p>
            <div class="flex">
              <div class="mr-4">
                <div class="h-20 relative pr-8">
                  <div class="w-20 h-20 rounded-full border border-gray-200 flex items-center justify-center">
                    <p class="text-4xl">{modifier(character().modifiers[slug])}</p>
                  </div>
                  <div class="absolute right-0 bottom-0 w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center">
                    <p class="text-2xl">{editMode() ? abilitiesData()[slug] : character().abilities[slug]}</p>
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
                <div class="flex justify-end items-center mb-2">
                  <span class="mr-2">{t('terms.saveDC')}</span>
                  <span>{modifier(character().save_dc[slug])}</span>
                </div>
                <For each={(editMode() ? skillsData() : character().skills).filter((item) => item.ability === slug)}>
                  {(skill) =>
                    <div class="flex justify-end items-center mb-1">
                      <p class={`flex items-center ${skill.selected ? '' : 'font-cascadia-light'}`}>
                        <span class="mr-2 text-sm">{t(`dnd.skills.${skill.slug}`)}</span>
                        <span>{modifier(skill.modifier)}</span>
                      </p>
                      <Show when={editMode() && character().provider === 'dnd5'} fallback={<p />}>
                        <Checkbox
                          classList="ml-2"
                          checked={skill.selected}
                          onToggle={() => toggleSkill(skill.slug)}
                        />
                      </Show>
                      <Show when={editMode() && character().provider === 'dnd2024'} fallback={<p />}>
                        <Levelbox
                          classList="ml-2"
                          value={skill.level}
                          onToggle={() => updateSkill(skill.slug)}
                        />
                      </Show>
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
    </ErrorWrapper>
  );
}
