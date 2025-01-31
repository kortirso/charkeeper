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

  const updateAbilities = () => {
    batch(() => {
      props.onReloadCharacter({ abilities: abilitiesData() });
      closeModal();
    });
  }

  const updateSkills = () => {
    batch(() => {
      props.onReloadCharacter({ selected_skills: skillsData() });
      closeModal();
    });
  }

  return (
    <>
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
                        class="white-box flex py-2 px-4 justify-center items-center"
                        onClick={() => decreaseAbilityValue(slug)}
                      >-</button>
                      <p>{abilitiesData()[slug]}</p>
                      <button
                        class="white-box flex py-2 px-4 justify-center items-center"
                        onClick={() => increaseAbilityValue(slug)}
                      >+</button>
                    </div>
                  </div>
                }
              </For>
              <button
                class="py-2 px-4 bg-gray-200 rounded"
                onClick={updateAbilities}
              >{t('buttons.save')}</button>
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
              <button
                class="mt-2 py-2 px-4 bg-gray-200 rounded"
                onClick={updateSkills}
              >{t('buttons.save')}</button>
            </div>
          </Match>
        </Switch>
      </Modal>
    </>
  );
}
