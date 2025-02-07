import { createSignal, Switch, Match, batch, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { createModal } from '../../../../molecules';
import { Checkbox } from '../../../../atoms';

import { useAppLocale } from '../../../../../context';
import { modifier } from '../../../../../helpers';

export const Dnd5Abilities = (props) => {
  // component state
  const [modalOpenMode, setModalOpenMode] = createSignal(null);

  // changeable data
  const [abilitiesData, setAbilitiesData] = createSignal(props.initialAbilities);
  const [spentHitDiceData, setSpentHitDiceData] = createSignal(props.initialSpentHitDice);
  const [skillsData, setSkillsData] = createSignal(props.initialSkills.filter((item) => item.selected).map((item) => item.name));

  const { Modal, openModal, closeModal } = createModal();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const openModalMode = (value) => {
    batch(() => {
      setModalOpenMode(value);
      openModal();
    });
  }

  const spendDice = async (dice, limit) => {
    let newValue;
    if (spentHitDiceData()[dice] && spentHitDiceData()[dice] < limit) {
      newValue = { ...spentHitDiceData(), [dice]: spentHitDiceData()[dice] + 1 };
    } else {
      newValue = { ...spentHitDiceData(), [dice]: 1 };
    }

    const result = await props.onRefreshCharacter({ spent_hit_dice: newValue });
    if (result.errors === undefined) setSpentHitDiceData(newValue);
  }

  const restoreDice = async (dice) => {
    let newValue;
    if (spentHitDiceData()[dice] && spentHitDiceData()[dice] > 0) {
      newValue = { ...spentHitDiceData(), [dice]: spentHitDiceData()[dice] - 1 };
    } else {
      newValue = { ...spentHitDiceData(), [dice]: 0 };
    }

    const result = await props.onRefreshCharacter({ spent_hit_dice: newValue });
    if (result.errors === undefined) setSpentHitDiceData(newValue);
  }

  const decreaseAbilityValue = (slug) => {
    if (abilitiesData[slug] === 1) return;
    setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] - 1 });
  }

  const increaseAbilityValue = (slug) => setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] + 1 });

  const toggleSkill = (slug) => {
    if (skillsData().includes(slug)) {
      setSkillsData(skillsData().filter((item) => item !== slug));
    } else {
      setSkillsData(skillsData().concat(slug));
    }
  }

  // submits
  const updateAbilities = async () => {
    const result = await props.onReloadCharacter({ abilities: abilitiesData() });

    if (result.errors === undefined) closeModal();
  }

  const updateSkills = async () => {
    const result = await props.onReloadCharacter({ selected_skills: skillsData() });

    if (result.errors === undefined) closeModal();
  }

  return (
    <>
      <div class="flex items-start mb-2">
        <div class="white-box flex flex-col items-center w-2/5 p-2">
          <p class="text-sm mb-1">{t('terms.proficiencyBonus')}</p>
          <p class="text-2xl mb-1">{modifier(props.proficiencyBonus)}</p>
        </div>
        <div class="w-3/5 pl-4">
          <div class="white-box p-2">
            <p class="text-center text-sm">{t('terms.hitDices')}</p>
            <For each={Object.entries(props.hitDice).filter(([, value]) => value > 0)}>
              {([dice, maxValue]) =>
                <div class="flex justify-center items-center mt-1">
                  <p class="w-8 mr-4">d{dice}</p>
                  <button
                    class="py-1 px-2 border border-gray-200 rounded flex justify-center items-center"
                    onClick={() => spentHitDiceData()[dice] !== maxValue ? spendDice(dice, maxValue) : null}
                  >-</button>
                  <p class="w-12 mx-1 text-center">
                    {spentHitDiceData()[dice] ? (maxValue - spentHitDiceData()[dice]) : maxValue}/{maxValue}
                  </p>
                  <button
                    class="py-1 px-2 border border-gray-200 rounded flex justify-center items-center"
                    onClick={() => (spentHitDiceData()[dice] || 0) > 0 ? restoreDice(dice) : null}
                  >+</button>
                </div>
              }
            </For>
          </div>
        </div>
      </div>
      <For each={Object.entries(dict().abilities)}>
        {([slug, ability]) =>
          <div class="flex items-start mb-2">
            <div
              class="white-box flex flex-col items-center w-2/5 p-2 cursor-pointer"
              onClick={() => openModalMode('changeAbilities')}
            >
              <p class="text-sm mb-1">{ability} {props.initialAbilities[slug]}</p>
              <p class="text-2xl mb-1">{modifier(props.modifiers[slug])}</p>
            </div>
            <div class="w-3/5 pl-4">
              <div
                class="white-box p-2 cursor-pointer"
                onClick={() => openModalMode('changeSkills')}
              >
                <div class="flex justify-between">
                  <p>{t('terms.saveDC')}</p>
                  <p>{modifier(props.saveDc[slug])}</p>
                </div>
                <div class="mt-2">
                  <For each={props.initialSkills.filter((item) => item.ability === slug)}>
                    {(skill) =>
                      <div class="flex justify-between">
                        <p class={`${skill.selected ? 'font-medium' : 'opacity-50'}`}>
                          {t(`skills.${skill.name}`)}
                        </p>
                        <p class={`${skill.selected ? 'font-medium' : 'opacity-50'}`}>
                          {modifier(skill.modifier)}
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
        <Switch>
          <Match when={modalOpenMode() === 'changeAbilities'}>
            <div class="white-box p-4 flex flex-col">
              <For each={Object.entries(dict().abilities)}>
                {([slug, ability]) =>
                  <div class="mb-4 flex items-center">
                    <p class="flex-1 text-sm text-left">{ability}</p>
                    <div class="flex justify-between items-center ml-4 w-32">
                      <button
                        class="btn-light flex justify-center items-center"
                        onClick={() => decreaseAbilityValue(slug)}
                      >-</button>
                      <p>{abilitiesData()[slug]}</p>
                      <button
                        class="btn-light flex justify-center items-center"
                        onClick={() => increaseAbilityValue(slug)}
                      >+</button>
                    </div>
                  </div>
                }
              </For>
              <button class="btn-primary" onClick={updateAbilities}>{t('save')}</button>
            </div>
          </Match>
          <Match when={modalOpenMode() === 'changeSkills'}>
            <div class="white-box p-4 flex flex-col">
              <For each={Object.entries(dict().skills).sort((a, b) => a[1] > b[1])}>
                {([slug, skill]) =>
                  <div class="mb-1">
                    <Checkbox
                      labelText={skill}
                      labelPosition="right"
                      labelClassList="text-sm ml-4"
                      checked={skillsData().includes(slug)}
                      onToggle={() => toggleSkill(slug)}
                    />
                  </div>
                }
              </For>
              <button class="btn-primary mt-2" onClick={updateSkills}>{t('save')}</button>
            </div>
          </Match>
        </Switch>
      </Modal>
    </>
  );
}
