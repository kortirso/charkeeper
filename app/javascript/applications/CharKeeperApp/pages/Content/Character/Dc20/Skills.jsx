import { createSignal, createEffect, createMemo, For, Show, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { ErrorWrapper, Checkbox, Levelbox, EditWrapper, GuideWrapper, Input, Select, Button, Dice } from '../../../../components';
import config from '../../../../data/dc20.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier, translate, localize, performResponse } from '../../../../helpers';

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
    languages: 'Languages',
    convert: 'Convert',
    toTrades: 'to 2 trades',
    toLangs: 'to 2 langs',
    overQualified: 'Too many skill points spent',
    overQualifiedTrades: 'Too many trade points spent',
    fluent: 'Fluent'
  },
  ru: {
    helpMessage: 'Заполните данные по навыкам, ремёслам и языкам вашего персонажа. Конвертация очков необратима.',
    skillPoints: 'Очки навыков',
    expertisePoints: 'Очки мастерства',
    tradePoints: 'Очки ремёсел',
    langPoints: 'Очки языков',
    add: 'Добавить',
    skills: 'Навыки',
    trades: 'Ремёсла',
    languages: 'Языки',
    convert: 'Обменять',
    toTrades: 'на 2 ремесла',
    toLangs: 'на 2 языка',
    overQualified: 'Потрачено много очков навыков',
    overQualifiedTrades: 'Потрачено много очков ремёсел',
    fluent: 'Владение'
  },
  es: {
    helpMessage: 'Complete los datos sobre las habilidades, oficios y idiomas de tu personaje. La conversión de puntos no es reversible.',
    skillPoints: 'Puntos de habilidad',
    expertisePoints: 'Puntos de experiencia',
    tradePoints: 'Puntos de oficio',
    langPoints: 'Puntos de lenguaje',
    add: 'Agregar',
    skills: 'Habilidades',
    trades: 'Oficios',
    languages: 'Idiomas',
    convert: 'Convertir',
    toTrades: 'a 2 oficios',
    toLangs: 'a 2 idiomas',
    overQualified: 'Demasiados puntos de habilidad gastados',
    overQualifiedTrades: 'Demasiados puntos de oficio gastados',
    fluent: 'Fluido'
  }
}

export const Dc20Skills = (props) => {
  const character = () => props.character;

  const [skillPoints, setSkillPoints] = createStore({});
  const [tradeKnowledgeForm, setTradeKnowledgeForm] = createStore({ name: '', ability: 'mig' });
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
  const [{ renderAlerts, renderAlert }] = useAppAlert();
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
      });
    });
  });

  const maxSkillLevel = createMemo(() => Math.floor(character().level / 5) + 1);

  const convertSkillPoint = async () => {
    if (skillPoints.skillPoints <= 0) return;

    updateCharacter(
      { character: { skill_points: skillPoints.skillPoints - 1, trade_points: skillPoints.tradePoints + 2 }, only_head: true },
      setSkillPoints,
      { ...skillPoints, skillPoints: skillPoints.skillPoints - 1, tradePoints: skillPoints.tradePoints + 2 }
    );
  }

  const convertTradePoint = () => {
    if (skillPoints.tradePoints <= 0) return;

    updateCharacter(
      { character: { trade_points: skillPoints.tradePoints - 1, language_points: skillPoints.languagePoints + 2 }, only_head: true },
      setSkillPoints,
      { ...skillPoints, tradePoints: skillPoints.tradePoints - 1, languagePoints: skillPoints.languagePoints + 2 }
    );
  }

  const renderSkillBoxes = (object, checkCallback, toggleCallback) => {
    const maxValue = maxSkillLevel() + (object.expertise ? 1 : 0);
    const disabled = 5 - maxValue;

    return (
      <div class="flex gap-0.5">
        <For each={Array.from([...Array(maxValue).keys()], (x) => x + 1)}>
          {(index) =>
            <Checkbox filled checked={object.level >= index} onToggle={() => checkCallback(object.slug, index)} />
          }
        </For>
        <Show when={disabled > 0}>
          <For each={Array.from([...Array(disabled).keys()])}>
            {() =>
              <Checkbox disabled checked={false} />
            }
          </For>
        </Show>
        <Checkbox filled classList="ml-2 rotate-45" checked={object.expertise} onToggle={() => toggleCallback(object.slug)} />
      </div>
    );
  }

  const updateSkill = (slug, nextValue) => {
    let modifier;

    const result = skillsData().slice().map((item) => {
      if (item.slug !== slug) return item;

      if (nextValue === 1 && item.level === 1) {
        modifier = -1;
        nextValue = 0;
      } else modifier = nextValue - item.level;
      return { ...item, level: nextValue } 
    });
    batch(() => {
      setSkillPoints({ ...skillPoints, skillPoints: skillPoints.skillPoints - modifier });
      setSkillsData(result);
    });
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

  const updateTrade = (slug, nextValue) => {
    let modifier;

    const result = tradesData().slice().map((item) => {
      if (item.slug !== slug) return item;

      if (nextValue === 1 && item.level === 1) {
        modifier = -1;
        nextValue = 0;
      } else modifier = nextValue - item.level;
      return { ...item, level: nextValue } 
    });
    batch(() => {
      setSkillPoints({ ...skillPoints, tradePoints: skillPoints.tradePoints - modifier });
      setTradesData(result);
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

  const updateLanguage = (slug, nextValue) => {
    let modifier;
    if (nextValue === 1 && languagesData()[slug] === 1) {
      modifier = -1;
      nextValue = 0;
    } else modifier = nextValue - languagesData()[slug];

    batch(() => {
      setSkillPoints({ ...skillPoints, languagePoints: skillPoints.languagePoints - modifier });
      setLanguagesData({ ...languagesData(), [slug]: nextValue });
    });
  }

  const cancelSkillsEditing = () => {
    batch(() => {
      setSkillsData(character().skills);
      setSkillPoints({
        ...skillPoints,
        skillPoints: character().skill_points,
        skillExpertisePoints: character().skill_expertise_points
      });
      setEditSkillsMode(false);
    });
  }

  const cancelTradesEditing = () => {
    batch(() => {
      setTradesData(character().trades);
      setTradeKnowledge(character().trade_knowledge);
      setSkillPoints({
        ...skillPoints,
        tradePoints: character().trade_points,
        tradeExpertisePoints: character().trade_expertise_points
      });
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

  const updateCharacterSkills = () => {
    const overQualified = skillsData().filter((item) => item.level > maxSkillLevel() + (item.expertise ? 1 : 0)).map((item) => localize(config.skills[item.slug].name, locale()));
    if (overQualified.length > 0) return renderAlert(`${localize(TRANSLATION, locale()).overQualified}: ${overQualified.join(', ')}`);

    const skillLevels = skillsData().reduce((acc, item) => { acc[item.slug] = item.level; return acc }, {});
    const skillExpertise = skillsData().filter((item) => item.expertise).map((item) => item.slug);

    updateCharacter({ character: { skill_levels: skillLevels, skill_expertise: skillExpertise } }, setEditSkillsMode, false);
  }

  const updateCharacterTrades = () => {
    const overQualified = tradesData().filter((item) => item.level > maxSkillLevel() + (item.expertise ? 1 : 0))
    if (overQualified.length > 0) return renderAlert(localize(TRANSLATION, locale()).overQualifiedTrades);

    const tradeLevels = tradesData().reduce((acc, item) => { acc[item.slug] = item.level; return acc }, {});
    const tradeExpertise = tradesData().filter((item) => item.expertise).map((item) => item.slug);

    updateCharacter(
      { character: { trade_levels: tradeLevels, trade_expertise: tradeExpertise, trade_knowledge: tradeKnowledge() } },
      setEditTradesMode,
      false
    );
  }

  const updateCharacterLanguages = () => updateCharacter({ character: { language_levels: languagesData() } }, setEditLanguagesMode, false);

  const updateCharacter = async (payload, callback, callbackPayload) => {
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, payload);

    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        batch(() => {
          props.onReplaceCharacter(result.character);
          callback(callbackPayload);
        });
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20Skills' }}>
      <GuideWrapper
        character={character()}
        guideStep={2}
        helpMessage={localize(TRANSLATION, locale()).helpMessage}
        onReloadCharacter={props.onReloadCharacter}
        onNextClick={props.onNextGuideStepClick}
      >
        <div class="grid grid-cols-1 emd:grid-cols-2 emd:gap-2 mt-2">
          <div>
            <EditWrapper
              editMode={editSkillsMode()}
              onSetEditMode={setEditSkillsMode}
              onCancelEditing={cancelSkillsEditing}
              onSaveChanges={updateCharacterSkills}
            >
              <div class="dc20-skill-box">
                <p class="dc20-skill-box-title">{localize(TRANSLATION, locale()).skills}</p>
                <Show when={skillPoints.skillPoints > 0 || skillPoints.skillExpertisePoints > 0}>
                  <div class="dc20-skill-converter">
                    <div>
                      <p>{localize(TRANSLATION, locale()).skillPoints} {skillPoints.skillPoints}</p>
                      <p>{localize(TRANSLATION, locale()).expertisePoints} {skillPoints.skillExpertisePoints}</p>
                    </div>
                    <Show when={skillPoints.skillPoints > 0}>
                      <Button default classList="rounded py-1 px-2" onClick={convertSkillPoint}>
                        <div>
                          <p class="text-center">{localize(TRANSLATION, locale()).convert}</p>
                          <p>{localize(TRANSLATION, locale()).toTrades}</p>
                        </div>
                      </Button>
                    </Show>
                  </div>
                </Show>
                <div>
                  <For each={['prime'].concat(Object.keys(config.abilities))}>
                    {(slug) =>
                      <Show
                        when={editSkillsMode()}
                        fallback={
                          <For each={character().skills.filter((item) => item.ability === slug)}>
                            {(skill) =>
                              <div class="dc20-skill">
                                <Levelbox classList="mr-2" value={skill.level} />
                                <p class="uppercase mr-4">{skill.ability === 'prime' ? 'prm' : skill.ability}</p>
                                <p class="flex-1" classList={{ 'font-medium!': skill.expertise }}>
                                  {localize(config.skills[skill.slug].name, locale())}
                                </p>
                                <Dice
                                  width="28"
                                  height="28"
                                  text={modifier(skill.modifier)}
                                  onClick={() => props.openD20Test(`/check skill "${skill.slug}"`, localize(config.skills[skill.slug].name, locale()), skill.modifier, 10)}
                                />
                              </div>
                            }
                          </For>
                        }
                      >
                        <For each={skillsData().filter((item) => item.ability === slug)}>
                          {(skill) =>
                            <div class="dc20-skill justify-between">
                              <p class="flex-1 text-sm line-clamp-1" classList={{ 'font-medium!': skill.expertise }}>
                                {localize(config.skills[skill.slug].name, locale())}
                              </p>
                              {renderSkillBoxes(skill, updateSkill, toggleSkillExpertise)}
                            </div>
                          }
                        </For>
                      </Show>
                    }
                  </For>
                </div>
              </div>
            </EditWrapper>
          </div>
          <div>
            <EditWrapper
              editMode={editTradesMode()}
              onSetEditMode={setEditTradesMode}
              onCancelEditing={cancelTradesEditing}
              onSaveChanges={updateCharacterTrades}
            >
              <div class="dc20-skill-box">
                <p class="dc20-skill-box-title">{localize(TRANSLATION, locale()).trades}</p>
                <Show when={skillPoints.tradePoints > 0 || skillPoints.tradeExpertisePoints > 0}>
                  <div class="dc20-skill-converter">
                    <div>
                      <p>{localize(TRANSLATION, locale()).tradePoints} {skillPoints.tradePoints}</p>
                      <p>{localize(TRANSLATION, locale()).expertisePoints} {skillPoints.tradeExpertisePoints}</p>
                    </div>
                    <Show when={skillPoints.tradePoints > 0}>
                      <Button default classList="rounded py-1 px-2" onClick={convertTradePoint}>
                        <div>
                          <p class="text-center">{localize(TRANSLATION, locale()).convert}</p>
                          <p>{localize(TRANSLATION, locale()).toLangs}</p>
                        </div>
                      </Button>
                    </Show>
                  </div>
                </Show>
                <div>
                  <For each={Object.keys(config.abilities)}>
                    {(slug) =>
                      <Show
                        when={editTradesMode()}
                        fallback={
                          <For each={character().trades.filter((item) => item.ability === slug)}>
                            {(trade) =>
                              <div class="dc20-skill">
                                <Levelbox classList="mr-2" value={trade.level} />
                                <p class="uppercase mr-4">{trade.ability}</p>
                                <p class="flex-1" classList={{ 'font-medium!': trade.expertise }}>
                                  {config.trades[trade.slug] ? localize(config.trades[trade.slug].name, locale()) : trade.slug}
                                </p>
                                <Dice
                                  width="28"
                                  height="28"
                                  text={modifier(trade.modifier)}
                                  onClick={() => props.openD20Test(`/check skill "${trade.slug}"`, null, trade.modifier, 10)}
                                />
                              </div>
                            }
                          </For>
                        }
                      >
                        <For each={tradesData().filter((item) => item.ability === slug)}>
                          {(trade) =>
                            <div class="dc20-skill">
                              <p class="flex-1 text-sm md:text-base" classList={{ 'font-medium!': trade.expertise }}>
                                {config.trades[trade.slug] ? localize(config.trades[trade.slug].name, locale()) : trade.slug}
                              </p>
                              {renderSkillBoxes(trade, updateTrade, toggleTradeExpertise)}
                            </div>
                          }
                        </For>
                      </Show>
                    }
                  </For>
                </div>
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
                    <Button default textable onClick={saveTradeKnowledge}>{localize(TRANSLATION, locale()).add}</Button>
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
              <div class="dc20-skill-box">
                <p class="dc20-skill-box-title">{localize(TRANSLATION, locale()).languages}</p>
                <Show when={skillPoints.languagePoints > 0}>
                  <p class="text-sm mb-2">{localize(TRANSLATION, locale()).langPoints} {skillPoints.languagePoints}</p>
                </Show>
                <For each={Object.entries(editLanguagesMode() ? languagesData() : character().language_levels)}>
                  {([name, level]) =>
                    <div class="dc20-skill gap-x-1">
                      <Show
                        when={editLanguagesMode()}
                        fallback={
                          <>
                            <p class={`flex-1 ${level > 0 ? 'font-normal!' : ''}`}>{name}</p>
                            <span>
                              <Show when={level === 0}>-</Show>
                              <Show when={level === 1}>
                                <Dice
                                  width="28"
                                  height="28"
                                  text={modifier(Math.max(...[character().modified_abilities.int, character().modified_abilities.cha]))}
                                  onClick={() => props.openD20Test(`/check language "${name}"`, name, Math.max(...[character().modified_abilities.int, character().modified_abilities.cha]), 10)}
                                />
                              </Show>
                              <Show when={level === 2}>{localize(TRANSLATION, locale()).fluent}</Show>
                            </span>
                          </>
                        }
                      >
                        <p class={`flex-1 flex ${level > 0 ? 'font-normal!' : ''}`}>{name}</p>
                        <Checkbox filled checked={level >= 1} onToggle={() => updateLanguage(name, 1)} />
                        <Checkbox filled checked={level >= 2} onToggle={() => updateLanguage(name, 2)} />
                      </Show>
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
                    <Button default textable onClick={saveLanguage}>{localize(TRANSLATION, locale()).add}</Button>
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
