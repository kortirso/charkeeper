import { createSignal, createEffect, For, Show, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { ErrorWrapper, Checkbox, Levelbox, EditWrapper, GuideWrapper } from '../../../../components';
import config from '../../../../data/dc20.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier } from '../../../../helpers';

const TRANSLATION = {
  en: {
    helpMessage: 'Fill data about skills, trades and languages of your character.',
    skillPoints: 'Skill points',
    expertisePoints: 'Expertise points',
    tradePoints: 'Trade points',
    langPoints: 'Lang points'
  },
  ru: {
    helpMessage: 'Заполните данные по навыкам, ремёслам и языкам вашего персонажа.',
    skillPoints: 'Очки навыков',
    expertisePoints: 'Очки мастерства',
    tradePoints: 'Очки ремёсел',
    langPoints: 'Очки языков'
  }
}

export const Dc20Skills = (props) => {
  const character = () => props.character;

  const [skillPoints, setSkillPoints] = createStore({});

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editSkillsMode, setEditSkillsMode] = createSignal(false);
  const [editTradesMode, setEditTradesMode] = createSignal(false);
  const [skillsData, setSkillsData] = createSignal([]);
  const [tradesData, setTradesData] = createSignal([]);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setSkillsData(character().skills);
      setTradesData(character().trades);
      setLastActiveCharacterId(character().id);
      setSkillPoints({
        skillPoints: character().skill_points,
        skillExpertisePoints: character().skill_expertise_points,
        tradePoints: character().trade_points,
        tradeExpertisePoints: character().trade_expertise_points,
        languagePoints: character().language_points
      })
    });
  });

  const convertSkillPoint = () => {
    if (skillPoints.skillPoints > 0) {
      setSkillPoints({ ...skillPoints, skillPoints: skillPoints.skillPoints - 1, tradePoints: skillPoints.tradePoints + 2 });
    }
  }

  const convertTradePoint = () => {
    if (skillPoints.tradePoints > 0) {
      setSkillPoints({ ...skillPoints, tradePoints: skillPoints.tradePoints - 1, languagePoints: skillPoints.languagePoints + 2 });
    }
  }

  const toggleSkillExpertise = (slug) => {
    let modifier;
    const result = skillsData().slice().map((item) => {
      if (item.slug !== slug) return item;
      modifier = item.expertise ? -1 : 1;

      return { ...item, expertise: !item.expertise } 
    });
    batch(() => {
      if (modifier > 0) {
        if (skillPoints.skillExpertisePoints > 0) {
          setSkillPoints({ ...skillPoints, skillExpertisePoints: skillPoints.skillExpertisePoints - 1 });
        } else {
          setSkillPoints({ ...skillPoints, skillPoints: skillPoints.skillPoints - 1 });
        }
      } else {
        if (skillsData().filter((item) => item.expertise).length > character().skill_expertise_points) {
          setSkillPoints({ ...skillPoints, skillPoints: skillPoints.skillPoints + 1 });
        } else {
          setSkillPoints({ ...skillPoints, skillExpertisePoints: skillPoints.skillExpertisePoints +1 });
        }
      }
      setSkillsData(result);
    });
  }

  const updateSkill = (slug) => {
    let difference;
    const result = skillsData().slice().map((item) => {
      if (item.slug !== slug) return item;

      const maxLevel = Math.round(character().level / 5) + 1 + (item.expertise ? 1 : 0);

      const newValue = item.level === maxLevel ? 0 : (item.level === undefined ? 1 : (item.level + 1));
      difference = newValue - item.level;
      return { ...item, level: newValue } 
    });
    batch(() => {
      setSkillPoints({ ...skillPoints, skillPoints: skillPoints.skillPoints - difference });
      setSkillsData(result);
    });
  }

  const toggleTradeExpertise = (slug) => {
    let modifier;
    const result = tradesData().slice().map((item) => {
      if (item.slug !== slug) return item;
      modifier = item.expertise ? -1 : 1;

      return { ...item, expertise: !item.expertise } 
    });
    batch(() => {
      if (modifier > 0) {
        if (skillPoints.tradeExpertisePoints > 0) {
          setSkillPoints({ ...skillPoints, tradeExpertisePoints: skillPoints.tradeExpertisePoints - 1 });
        } else {
          setSkillPoints({ ...skillPoints, tradePoints: skillPoints.tradePoints - 1 });
        }
      } else {
        if (tradesData().filter((item) => item.expertise).length > character().trade_expertise_points) {
          setSkillPoints({ ...skillPoints, tradePoints: skillPoints.tradePoints + 1 });
        } else {
          setSkillPoints({ ...skillPoints, tradeExpertisePoints: skillPoints.tradeExpertisePoints +1 });
        }
      }
      setTradesData(result);
    });
  }

  const updateTrade = (slug) => {
    let difference;
    const result = tradesData().slice().map((item) => {
      if (item.slug !== slug) return item;

      const maxLevel = Math.round(character().level / 5) + 1 + (item.expertise ? 1 : 0);

      const newValue = item.level === maxLevel ? 0 : (item.level === undefined ? 1 : (item.level + 1));
      difference = newValue - item.level;
      return { ...item, level: newValue } 
    });
    batch(() => {
      setSkillPoints({ ...skillPoints, tradePoints: skillPoints.tradePoints - difference });
      setTradesData(result);
    });
  }

  const cancelSkillsEditing = () => {
    batch(() => {
      setSkillsData(character().skills);
      setEditSkillsMode(false);
    });
  }

  const cancelTradesEditing = () => {
    batch(() => {
      setTradesData(character().trades);
      setEditTradesMode(false);
    });
  }

  const updateCharacter = async () => {
    const skillLevels = skillsData().reduce((acc, item) => { acc[item.slug] = item.level; return acc }, {});

    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { skill_levels: skillLevels } }
    );

    if (result.errors_list === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setEditSkillsMode(false);
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20Skills' }}>
      <GuideWrapper
        character={character()}
        guideStep={2}
        helpMessage={TRANSLATION[locale()]['helpMessage']}
        onReloadCharacter={props.onReloadCharacter}
        finishGuideStep={true}
      >
        <div class="blockable pb-2">
          <div class="p-4 flex mb-2">
            <div class="dc20-points-caption">
              <p>{TRANSLATION[locale()]['skillPoints']} - {skillPoints.skillPoints}</p>
              <p>{TRANSLATION[locale()]['expertisePoints']} - {skillPoints.skillExpertisePoints}</p>
            </div>
            <div class="dc20-points-convert cursor-pointer" onClick={convertSkillPoint}>
              <p>1:2</p>
            </div>
            <div class="dc20-points-caption">
              <p>{TRANSLATION[locale()]['tradePoints']} - {skillPoints.tradePoints}</p>
              <p>{TRANSLATION[locale()]['expertisePoints']} - {skillPoints.tradeExpertisePoints}</p>
            </div>
            <div class="dc20-points-convert cursor-pointer" onClick={convertTradePoint}>
              <p>1:2</p>
            </div>
            <div class="dc20-points-caption">
              <p>{TRANSLATION[locale()]['langPoints']} - {skillPoints.languagePoints}</p>
              <p />
            </div>
          </div>
        </div>
        <div class="flex flex-col emd:flex-row emd:gap-2 mt-2">
          <div class="flex-1">
            <EditWrapper
              editMode={editSkillsMode()}
              onSetEditMode={setEditSkillsMode}
              onCancelEditing={cancelSkillsEditing}
              onSaveChanges={updateCharacter}
            >
              <div class="blockable p-4 mb-2">
                <For each={['prime'].concat(Object.keys(config.abilities))}>
                  {(slug) =>
                    <For each={(editSkillsMode() ? skillsData() : character().skills).filter((item) => item.ability === slug)}>
                      {(skill) =>
                        <div class="flex items-center mb-1">
                          <Show
                            when={editSkillsMode()}
                            fallback={
                              <p class="dark:text-snow mr-4">{skill.level ? skill.level : (skill.expertise ? 1 : 0)}</p>
                            }
                          >
                            <Checkbox
                              classList="mr-2"
                              checked={skill.expertise}
                              onToggle={() => toggleSkillExpertise(skill.slug)}
                            />
                            <Levelbox
                              classList="mr-2"
                              value={skill.level}
                              onToggle={() => updateSkill(skill.slug)}
                            />
                          </Show>
                          <p class="uppercase dark:text-snow mr-4">{skill.ability === 'prime' ? 'prm' : skill.ability}</p>
                          <p class={`flex-1 flex items-center dark:text-snow ${skill.level > 0 ? 'font-normal!' : ''}`}>
                            {config.skills[skill.slug].name[locale()]}
                          </p>
                          <span class="dark:text-snow">{modifier(skill.modifier)}</span>
                        </div>
                      }
                    </For>
                  }
                </For>
              </div>
            </EditWrapper>
          </div>
          <div class="flex-1">
            <div class="flex-1">
            <EditWrapper
              editMode={editTradesMode()}
              onSetEditMode={setEditTradesMode}
              onCancelEditing={cancelTradesEditing}
              onSaveChanges={updateCharacter}
            >
              <div class="blockable p-4 mb-2">
                <For each={Object.keys(config.abilities)}>
                  {(slug) =>
                    <For each={(editTradesMode() ? tradesData() : character().trades).filter((item) => item.ability === slug)}>
                      {(trade) =>
                        <div class="flex items-center mb-1">
                          <Show
                            when={editTradesMode()}
                            fallback={
                              <p class="dark:text-snow mr-4">{trade.level ? trade.level : (trade.expertise ? 1 : 0)}</p>
                            }
                          >
                            <Checkbox
                              classList="mr-2"
                              checked={trade.expertise}
                              onToggle={() => toggleTradeExpertise(trade.slug)}
                            />
                            <Levelbox
                              classList="mr-2"
                              value={trade.level}
                              onToggle={() => updateTrade(trade.slug)}
                            />
                          </Show>
                          <p class="uppercase dark:text-snow mr-4">{trade.ability}</p>
                          <p class={`flex-1 flex items-center dark:text-snow ${trade.level > 0 ? 'font-normal!' : ''}`}>
                            {config.trades[trade.slug].name[locale()]}
                          </p>
                          <span class="dark:text-snow">{modifier(trade.modifier)}</span>
                        </div>
                      }
                    </For>
                  }
                </For>
              </div>
            </EditWrapper>
          </div>
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
