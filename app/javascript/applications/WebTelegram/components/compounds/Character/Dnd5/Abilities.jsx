import { createSignal, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { createModal } from '../../../molecules';
import { Checkbox, Button } from '../../../atoms';

import { useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall, Minus } from '../../../../assets';

import { modifier } from '../../../../../../helpers';

export const Dnd5Abilities = (props) => {
  const character = () => props.character;
  const selectedSkillsSlugs = () => character().skills.filter((item) => item.selected).map((item) => item.slug);

  // changeable data
  const [abilitiesData, setAbilitiesData] = createSignal(character().abilities);

  const { Modal, openModal, closeModal } = createModal();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const decreaseAbilityValue = (slug) => {
    if (abilitiesData[slug] === 1) return;
    setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] - 1 });
  }

  const increaseAbilityValue = (slug) => setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] + 1 });

  // submits
  const updateAbilities = async () => {
    const result = await props.onReloadCharacter({ abilities: abilitiesData() });
    if (result.errors === undefined) closeModal();
    else renderAlerts(result.errors);
  }

  const updateSkill = async (slug) => {
    const newValue = selectedSkillsSlugs().includes(slug) ? selectedSkillsSlugs().filter((item) => item !== slug) : selectedSkillsSlugs().concat(slug);
    const result = await props.onReloadCharacter({ selected_skills: newValue });
    if (result.errors) renderAlerts(result.errors);
  }

  return (
    <>
      <div class="flex items-start mb-2">
        <div class="white-box flex flex-col items-center w-2/5 p-2">
          <p class="text-sm mb-1">{t('terms.proficiencyBonus')}</p>
          <p class="text-2xl mb-1">{modifier(character().proficiency_bonus)}</p>
        </div>
        <div class="w-3/5 pl-4">
          <div class="white-box p-2">
            <p class="text-center text-sm">{t('terms.hitDices')}</p>
            <For each={Object.entries(character().hit_dice).filter(([, value]) => value > 0)}>
              {([dice, maxValue]) =>
                <div class="flex justify-center items-center mt-1">
                  <p class="w-8 mr-4">d{dice}</p>
                  <Button default size="small" onClick={() => props.spentHitDiceData[dice] !== maxValue ? props.onSpendDice(dice, maxValue) : null}>
                    <Minus />
                  </Button>
                  <p class="w-12 mx-1 text-center">
                    {props.spentHitDiceData[dice] ? (maxValue - props.spentHitDiceData[dice]) : maxValue}/{maxValue}
                  </p>
                  <Button default size="small" onClick={() => (props.spentHitDiceData[dice] || 0) > 0 ? props.onRestoreDice(dice) : null}>
                    <PlusSmall />
                  </Button>
                </div>
              }
            </For>
          </div>
        </div>
      </div>
      <For each={Object.entries(dict().dnd.abilities)}>
        {([slug, ability]) =>
          <div class="flex items-start mb-2">
            <div
              class="white-box flex flex-col items-center w-2/5 p-2 cursor-pointer"
              onClick={openModal}
            >
              <p class="text-sm mb-1">{ability} {character().abilities[slug]}</p>
              <p class="text-2xl mb-1">{modifier(character().modifiers[slug])}</p>
            </div>
            <div class="w-3/5 pl-4">
              <div class="white-box p-2">
                <div class="flex justify-between">
                  <p>{t('terms.saveDC')}</p>
                  <p>{modifier(character().save_dc[slug])}</p>
                </div>
                <div class="mt-2">
                  <For each={character().skills.filter((item) => item.ability === slug)}>
                    {(skill) =>
                      <div class="flex justify-between mb-1">
                        <Checkbox
                          checked={selectedSkillsSlugs().includes(skill.slug)}
                          onToggle={() => updateSkill(skill.slug)}
                        />
                        <p class={`${selectedSkillsSlugs().includes(skill.slug) ? 'font-medium flex items-center' : 'opacity-50 flex items-center'}`}>
                          <span class="text-sm mr-2">{t(`dnd.skills.${skill.slug}`)}</span>
                          <span>{modifier(skill.modifier)}</span>
                        </p>
                      </div>
                    }
                  </For>
                </div>
              </div>
            </div>
          </div>
        }
      </For>
      <Modal>
        <div class="white-box p-4 flex flex-col">
          <For each={Object.entries(dict().dnd.abilities)}>
            {([slug, ability]) =>
              <div class="mb-4 flex items-center">
                <p class="flex-1 text-sm text-left">{ability}</p>
                <div class="flex justify-between items-center ml-4 w-32">
                  <Button default size="small" big onClick={() => decreaseAbilityValue(slug)}>
                    <Minus />
                  </Button>
                  <p>{abilitiesData()[slug]}</p>
                  <Button default size="small" big onClick={() => increaseAbilityValue(slug)}>
                    <PlusSmall />
                  </Button>
                </div>
              </div>
            }
          </For>
          <Button default textable onClick={updateAbilities}>{t('save')}</Button>
        </div>
      </Modal>
    </>
  );
}
