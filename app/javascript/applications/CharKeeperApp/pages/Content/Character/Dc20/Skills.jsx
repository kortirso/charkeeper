import { createSignal, createEffect, For, Show, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { ErrorWrapper, Checkbox, Levelbox, EditWrapper, GuideWrapper, Input, Select, Button, Dice } from '../../../../components';
import config from '../../../../data/dc20.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier, translate, localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    helpMessage: 'Fill data about skills, trades and languages of your character. Points converting is not revertable.',
    skillPoints: 'Skill points',
    expertisePoints: 'Expertise points',
    tradePoints: 'Trade points',
    langPoints: 'Lang points',
    add: 'Add',
    skills: 'Skills',
    trades: 'Trades',
    languages: 'Languages'
  },
  ru: {
    helpMessage: 'Заполните данные по навыкам, ремёслам и языкам вашего персонажа. Конвертация очков необратима.',
    skillPoints: 'Очки навыков',
    expertisePoints: 'Очки мастерства',
    tradePoints: 'Очки ремёсел',
    langPoints: 'Очки языков',
    add: 'Добавить',
    skills: 'Изученные навыки',
    trades: 'Изученные ремёсла',
    languages: 'Изученные языки'
  }
}

export const Dc20Skills = (props) => {
  const character = () => props.character;

  const [skillPoints, setSkillPoints] = createStore({});
  const [tradeKnowledgeForm, setTradeKnowledgeForm] = createStore({
    name: '',
    ability: 'mig'
  });
  const [languageName, setLanguageName] = createSignal('');

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editSkillsMode, setEditSkillsMode] = createSignal(false);
  const [editTradesMode, setEditTradesMode] = createSignal(false);
  const [editLanguagesMode, setEditLanguagesMode] = createSignal(false);
  const [skillsData, setSkillsData] = createSignal([]);
  const [tradesData, setTradesData] = createSignal([]);
  const [languagesData, setLanguagesData] = createSignal({});
  const [tradeKnowledge, setTradeKnowledge] = createSignal({});

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id && character().guide_step !== 1) {
      setEditSkillsMode(character().guide_step === 2);
      return;
    }

    batch(() => {
      setSkillsData(character().skills);
      setTradesData(character().trades);
      setLanguagesData(character().language_levels);
      setTradeKnowledge(character().trade_knowledge);
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

  const convertSkillPoint = async () => {
    if (skillPoints.skillPoints > 0) {
      await updateCharacterRequest(
        appState.accessToken,
        character().provider,
        character().id,
        { character: { skill_points: skillPoints.skillPoints - 1, trade_points: skillPoints.tradePoints + 2 }, only_head: true }
      );
      setSkillPoints({ ...skillPoints, skillPoints: skillPoints.skillPoints - 1, tradePoints: skillPoints.tradePoints + 2 });
    }
  }

  const convertTradePoint = async () => {
    if (skillPoints.tradePoints > 0) {
      await updateCharacterRequest(
        appState.accessToken,
        character().provider,
        character().id,
        { character: { trade_points: skillPoints.tradePoints - 1, language_points: skillPoints.languagePoints + 2 }, only_head: true }
      );
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

  const updateLanguage = (slug) => {
    const currentLevel = languagesData()[slug];
    const newValue = currentLevel === 2 ? 0 : (currentLevel === undefined ? 1 : (currentLevel + 1));
    const difference = newValue - currentLevel

    batch(() => {
      setSkillPoints({ ...skillPoints, languagePoints: skillPoints.languagePoints - difference });
      setLanguagesData({ ...languagesData(), [slug]: newValue });
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
      setTradeKnowledge(character().trade_knowledge);
      setEditTradesMode(false);
    });
  }

  const cancelLanguagesEditing = () => {
    batch(() => {
      setLanguagesData(character().language_levels);
      setEditLanguagesMode(false);
    });
  }

  const saveTradeKnowledge = () => {
    if (tradeKnowledgeForm.name.length === 0) return;

    const trade = { slug: tradeKnowledgeForm.name, ability: tradeKnowledgeForm.ability, level: 0, expertise: false, modifier: 0 }
    batch(() => {
      setTradeKnowledge({ ...tradeKnowledge(), [tradeKnowledgeForm.name]: tradeKnowledgeForm.ability });
      setTradesData([trade].concat(tradesData()));
      setTradeKnowledgeForm({ name: '', ability: 'mig' });
    });
  }

  const saveLanguage = () => {
    if (languageName().length === 0) return;

    batch(() => {
      setLanguagesData({ ...languagesData(), [languageName()]: 0 });
      setLanguageName('');
    });
  }

  const updateCharacterSkills = async () => {
    const skillLevels = skillsData().reduce((acc, item) => { acc[item.slug] = item.level; return acc }, {});
    const skillExpertise = skillsData().filter((item) => item.expertise).map((item) => item.slug);

    const result = await updateCharacterRequest(
      appState.accessToken,
      character().provider,
      character().id,
      { character: { skill_levels: skillLevels, skill_expertise: skillExpertise } }
    );

    if (result.errors_list === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setEditSkillsMode(false);
      });
    } else renderAlerts(result.errors_list);
  }

  const updateCharacterTrades = async () => {
    const tradeLevels = tradesData().reduce((acc, item) => { acc[item.slug] = item.level; return acc }, {});
    const tradeExpertise = tradesData().filter((item) => item.expertise).map((item) => item.slug);

    const result = await updateCharacterRequest(
      appState.accessToken,
      character().provider,
      character().id,
      { character: { trade_levels: tradeLevels, trade_expertise: tradeExpertise, trade_knowledge: tradeKnowledge() } }
    );

    if (result.errors_list === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setEditTradesMode(false);
      });
    } else renderAlerts(result.errors_list);
  }

  const updateCharacterLanguages = async () => {
    const result = await updateCharacterRequest(
      appState.accessToken,
      character().provider,
      character().id,
      { character: { language_levels: languagesData() } }
    );

    if (result.errors_list === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setEditLanguagesMode(false);
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20Skills' }}>
      <GuideWrapper
        character={character()}
        guideStep={2}
        helpMessage={localize(TRANSLATION, locale())['helpMessage']}
        onReloadCharacter={props.onReloadCharacter}
        onNextClick={props.onNextGuideStepClick}
      >
        <div class="blockable pb-2">
          <div class="p-4 pb-0 sm:pb-4 flex flex-col sm:flex-row">
            <div class="dc20-points-caption">
              <p>{localize(TRANSLATION, locale())['skillPoints']} {skillPoints.skillPoints}</p>
              <p>{localize(TRANSLATION, locale())['expertisePoints']} {skillPoints.skillExpertisePoints}</p>
            </div>
            <div class="dc20-points-convert" onClick={convertSkillPoint}>
              <p>1:2</p>
            </div>
            <div class="dc20-points-caption">
              <p>{localize(TRANSLATION, locale())['tradePoints']} {skillPoints.tradePoints}</p>
              <p>{localize(TRANSLATION, locale())['expertisePoints']} {skillPoints.tradeExpertisePoints}</p>
            </div>
            <div class="dc20-points-convert" onClick={convertTradePoint}>
              <p>1:2</p>
            </div>
            <div class="dc20-points-caption">
              <p>{localize(TRANSLATION, locale())['langPoints']} {skillPoints.languagePoints}</p>
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
              onSaveChanges={updateCharacterSkills}
            >
              <div class="blockable p-4 mb-2">
                <p class="text-lg mb-2">{localize(TRANSLATION, locale())['skills']}</p>
                <For each={['prime'].concat(Object.keys(config.abilities))}>
                  {(slug) =>
                    <For each={(editSkillsMode() ? skillsData() : character().skills).filter((item) => item.ability === slug)}>
                      {(skill) =>
                        <div class="flex items-center mb-1 dark:text-snow">
                          <Show
                            when={editSkillsMode()}
                            fallback={<Levelbox classList="mr-2" value={skill.level} />}
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
                          <p class="uppercase mr-4">{skill.ability === 'prime' ? 'prm' : skill.ability}</p>
                          <p
                            class="flex-1 flex items-center"
                            classList={{ 'font-medium!': skill.level > 0 }}
                          >
                            {config.skills[skill.slug].name[locale()]}
                          </p>
                          <span>
                            <Dice
                              width="28"
                              height="28"
                              text={modifier(skill.modifier)}
                              onClick={() => props.openDiceRoll(`/check skill "${skill.slug}"`, skill.modifier)}
                            />
                          </span>
                        </div>
                      }
                    </For>
                  }
                </For>
              </div>
            </EditWrapper>
          </div>
          <div class="flex-1">
            <EditWrapper
              editMode={editTradesMode()}
              onSetEditMode={setEditTradesMode}
              onCancelEditing={cancelTradesEditing}
              onSaveChanges={updateCharacterTrades}
            >
              <div class="blockable p-4">
                <p class="text-lg mb-2">{localize(TRANSLATION, locale())['trades']}</p>
                <For each={Object.keys(config.abilities)}>
                  {(slug) =>
                    <For each={(editTradesMode() ? tradesData() : character().trades).filter((item) => item.ability === slug)}>
                      {(trade) =>
                        <div class="flex items-center mb-1 dark:text-snow">
                          <Show
                            when={editTradesMode()}
                            fallback={<Levelbox classList="mr-2" value={trade.level} />}
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
                          <p class="uppercase mr-4">{trade.ability}</p>
                          <p class={`flex-1 flex items-center ${trade.level > 0 ? 'font-normal!' : ''}`}>
                            {config.trades[trade.slug] ? config.trades[trade.slug].name[locale()] : trade.slug}
                          </p>
                          <span>
                            <Dice
                              width="28"
                              height="28"
                              text={modifier(trade.modifier)}
                              onClick={() => props.openDiceRoll(`/check trade "${trade.slug}"`, trade.modifier)}
                            />
                          </span>
                        </div>
                      }
                    </For>
                  }
                </For>
                <Show when={editTradesMode()}>
                  <div class="flex flex-row items-center gap-x-2 mt-4">
                    <Input
                      containerClassList="flex-1"
                      value={tradeKnowledgeForm.name}
                      onInput={(value) => setTradeKnowledgeForm({ ...tradeKnowledgeForm, name: value })}
                    />
                    <Select
                      containerClassList="flex-1"
                      items={translate(config.abilities, locale())}
                      selectedValue={tradeKnowledgeForm.ability}
                      onSelect={(value) => setTradeKnowledgeForm({ ...tradeKnowledgeForm, ability: value })}
                    />
                    <Button default textable onClick={saveTradeKnowledge}>{localize(TRANSLATION, locale())['add']}</Button>
                  </div>
                </Show>
              </div>
            </EditWrapper>
            <EditWrapper
              editMode={editLanguagesMode()}
              onSetEditMode={setEditLanguagesMode}
              onCancelEditing={cancelLanguagesEditing}
              onSaveChanges={updateCharacterLanguages}
            >
              <div class="blockable p-4 mt-2">
                <p class="text-lg dark:text-snow mb-2">{localize(TRANSLATION, locale())['languages']}</p>
                <For each={Object.entries(editLanguagesMode() ? languagesData() : character().language_levels)}>
                  {([name, level]) =>
                    <div class="flex items-center mb-1 dark:text-snow">
                      <Show
                        when={editLanguagesMode()}
                        fallback={<Levelbox classList="mr-2" value={level} />}
                      >
                        <Levelbox
                          classList="mr-2"
                          value={level}
                          onToggle={() => updateLanguage(name)}
                        />
                      </Show>
                      <p class={`flex-1 flex items-center ${level > 0 ? 'font-normal!' : ''}`}>{name}</p>
                      <span>
                        {level == 2 || level == 0 ? (
                            '-'
                          ) : (
                            <Dice
                              width="28"
                              height="28"
                              text={modifier(Math.max(...[character().modified_abilities.int, character().modified_abilities.cha]))}
                              onClick={() => props.openDiceRoll(`/check language "${name}"`, Math.max(...[character().modified_abilities.int, character().modified_abilities.cha]))}
                            />
                          )
                        }
                      </span>
                    </div>
                  }
                </For>
                <Show when={editLanguagesMode()}>
                  <div class="flex flex-row items-center gap-x-2 mt-4">
                    <Input
                      containerClassList="flex-1"
                      value={languageName()}
                      onInput={setLanguageName}
                    />
                    <Button default textable onClick={saveLanguage}>{localize(TRANSLATION, locale())['add']}</Button>
                  </div>
                </Show>
              </div>
            </EditWrapper>
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
