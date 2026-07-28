import { createSignal, createEffect, createMemo, For, Show, Switch, Match, batch } from 'solid-js';

import config from '../../../../data/dc20.json';
import {
  ErrorWrapper, GuideWrapper, Toggle, Button, Checkbox, createModal, StatsBlock, Dice, Select
} from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall, Minus } from '../../../../assets';
import { fetchSpellsRequest } from '../../../../requests/fetchSpellsRequest';
import { fetchCharacterSpellsRequest } from '../../../../requests/fetchCharacterSpellsRequest';
import { createCharacterSpellRequest } from '../../../../requests/createCharacterSpellRequest';
import { removeCharacterSpellRequest } from '../../../../requests/removeCharacterSpellRequest';
import { fetchCharacterItemsRequest } from '../../../../requests/fetchCharacterItemsRequest';
import { fetchTagInfoRequest } from '../../../../requests/fetchTagInfoRequest';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { clearCharacterSpellsRequest } from '../../../../requests/clearCharacterSpellsRequest';
import { modifier, localize, translate } from '../../../../helpers';

const TRANSLATION = {
  en: {
    mana_spend_limit: 'Spend limit',
    spells: 'Spells',
    selectSpells: 'Select spells',
    back: 'Back',
    spellIsLearned: 'Spell is learned',
    range: 'Range',
    price: 'Price',
    duration: 'Duration',
    instant: 'Instantaneous',
    hours: 'hours',
    minutes: 'minutes',
    self: 'Self',
    squares: 'spaces',
    enhancements: 'Enhancements',
    onlyAvailableSpells: 'Only available spells',
    prices: {
      ap: 'AP',
      mp: 'MP'
    },
    features: {
      'Long-Ranged': 'Long-Ranged',
      'Channeling': 'Channeling',
      'Close Quarters': 'Close Quarters',
      'Muffled': 'Muffled',
      'Powerful': 'Powerful',
      'Protective': 'Protective',
      'Reach': 'Reach',
      'Reactive': 'Reactive',
      'Two-Handed': 'Two-Handed',
      'Vicious': 'Vicious',
      'Warded': 'Warded'
    },
    attack: 'Spell Check',
    repeatable: 'Repeatable',
    selectSpellclass: 'Choose spellcaster class',
    spellclasses: {
      bard: 'Bard',
      cleric: 'Cleric',
      druid: 'Druid',
      sorcerer: 'Sorcerer',
      spellblade: 'Spellblade',
      warlock: 'Warlock',
      wizard: 'Wizard'
    },
    saveButton: 'Save',
    selectBard: 'Choose 1 school for bard',
    selectSpellblade: 'Choose 2 schools for spellblade',
    selectWarlock: 'Choose 3 schools for warlock',
    selectSorcerer: 'Choose spell source for sorcerer',
    focuses: 'Focuses',
    clear: 'Clear'
  },
  ru: {
    mana_spend_limit: 'Предел траты',
    spells: 'Заклинания',
    selectSpells: 'Выбрать заклинания',
    back: 'Назад',
    spellIsLearned: 'Заклинание изучено',
    range: 'Дальность',
    price: 'Цена',
    duration: 'Продолжительность',
    instant: 'Мгновенно',
    hours: 'часов',
    minutes: 'минут',
    self: 'На себя',
    squares: 'квадратов',
    enhancements: 'Улучшения',
    onlyAvailableSpells: 'Только доступные заклинания',
    prices: {
      ap: 'ОД',
      mp: 'ОМ'
    },
    features: {
      'Long-Ranged': 'Дальнобойное',
      'Channeling': 'Направляющее',
      'Close Quarters': 'Ближний бой',
      'Muffled': 'Приглушенное',
      'Powerful': 'Мощное',
      'Protective': 'Защитное',
      'Reach': 'Досягаемое',
      'Reactive': 'Реактивное',
      'Two-Handed': 'Двуручное',
      'Vicious': 'Беспощадное',
      'Warded': 'Ограждающее'
    },
    attack: 'Бонус атаки',
    repeatable: 'Многократное',
    selectSpellclass: 'Выберите заклинательный класс',
    spellclasses: {
      bard: 'Бард',
      cleric: 'Жрец',
      druid: 'Друид',
      sorcerer: 'Чародей',
      spellblade: 'Маг клинка',
      warlock: 'Колдун',
      wizard: 'Волшебник'
    },
    saveButton: 'Сохранить',
    selectBard: 'Выберите 1 школу для барда',
    selectSpellblade: 'Выберите 2 школы для мага клинка',
    selectWarlock: 'Выберите 3 школы для колдуна',
    selectSorcerer: 'Выберите список для чародея',
    focuses: 'Фокусировка',
    clear: 'Сбросить'
  },
  es: {
    mana_spend_limit: 'Límite de gasto',
    spells: 'Hechizos',
    selectSpells: 'Seleccionar hechizos',
    back: 'Atrás',
    spellIsLearned: 'Hechizo aprendido',
    range: 'Alcance',
    price: 'Precio',
    duration: 'Duración',
    instant: 'Instantáneo',
    hours: 'horas',
    minutes: 'minutos',
    self: 'a sí mismo',
    squares: 'espacios',
    enhancements: 'Mejoras',
    onlyAvailableSpells: 'Solo hechizos disponibles',
    prices: {
      ap: 'PA',
      mp: 'PM'
    },
    features: {
      'Long-Ranged': 'Long-Ranged',
      'Channeling': 'Channeling',
      'Close Quarters': 'Close Quarters',
      'Muffled': 'Muffled',
      'Powerful': 'Powerful',
      'Protective': 'Protective',
      'Reach': 'Reach',
      'Reactive': 'Reactive',
      'Two-Handed': 'Two-Handed',
      'Vicious': 'Vicious',
      'Warded': 'Warded'
    },
    attack: 'Tirada de Hechizo',
    repeatable: 'Repetible',
    selectSpellclass: 'Choose spellcaster class',
    spellclasses: {
      bard: 'Bard',
      cleric: 'Cleric',
      druid: 'Druid',
      sorcerer: 'Sorcerer',
      spellblade: 'Spellblade',
      warlock: 'Warlock',
      wizard: 'Wizard'
    },
    saveButton: 'Save',
    selectBard: 'Choose 1 school for bard',
    selectSpellblade: 'Choose 2 schools for spellblade',
    selectWarlock: 'Choose 3 schools for warlock',
    selectSorcerer: 'Choose spell source for sorcerer',
    focuses: 'Focuses',
    clear: 'Clear'
  }
}

export const Dc20Spells = (props) => {
  const character = () => props.character;
  const spellLists = () => config.spell_lists;
  const schools = () => config.schools;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [characterSpells, setCharacterSpells] = createSignal(undefined);
  const [spells, setSpells] = createSignal(undefined);
  const [spellsSelectingMode, setSpellsSelectingMode] = createSignal(false);
  const [availableListFilter, setAvailableListFilter] = createSignal(true);
  const [characterItems, setCharacterItems] = createSignal(undefined);
  const [tagInfo, setTagInfo] = createSignal([]);

  const [spellclass, setSpellclass] = createSignal(undefined);
  const [spellschools, setSpellschools] = createSignal([]);
  const [source, setSource] = createSignal([]);

  const { Modal, openModal } = createModal();
  const [appState] = useAppState();
  const [{ renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    const fetchSpells = async () => await fetchSpellsRequest(appState.accessToken, character().provider);
    const fetchCharacterSpells = async () => await fetchCharacterSpellsRequest(appState.accessToken, character().provider, character().id);
    const fetchCharacterItems = async () => await fetchCharacterItemsRequest(appState.accessToken, character().provider, character().id);

    Promise.all([fetchSpells(), fetchCharacterSpells(), fetchCharacterItems()]).then(
      ([spellsData, characterSpellsData, characterItemsData]) => {
        batch(() => {
          setSpells(spellsData.spells.sort((a, b) => a.title > b.title));
          setCharacterSpells(characterSpellsData.spells);
          setCharacterItems(characterItemsData.items.filter((item) => item.kind === 'focus' && item.states.hands > 0));
        });
      }
    );

    setLastActiveCharacterId(character().id);
  });

  const renderingLists = createMemo(() => {
    if (availableListFilter() && character().spell_filter.source) {
      return Object.keys(config.spell_lists).filter((item) => character().spell_filter.source === item);
    }

    return Object.keys(config.spell_lists);
  });

  const filteredSpells = createMemo(() => {
    if (!spells()) return [];
    if (!availableListFilter()) return spells().sort((a, b) => a.title.localeCompare(b.title));

    const checkSchools = character().spell_filter.schools && character().spell_filter.schools.length > 0;
    const checkSource = character().spell_filter.source;

    return spells().filter((item) => {
      if (checkSchools && !character().spell_filter.schools.includes(item.school)) return false;
      if (checkSource && !item.base_origin_values.includes(checkSource)) return false;

      return true;
    }).sort((a, b) => a.title.localeCompare(b.title));
  });

  const learnedSpellIds = createMemo(() => {
    if (spells() === undefined) return [];
    if (characterSpells() === undefined) return [];

    return characterSpells().map((item) => item.spell_id);
  });

  const learnedSpells = createMemo(() => {
    if (spells() === undefined) return [];
    if (characterSpells() === undefined) return [];

    const characterSpellIds = characterSpells().map((item) => item.spell_id);

    return spells().filter((spell) => characterSpellIds.includes(spell.id));
  });

  const renderSpellPrice = (object) => {
    const result = Object.entries(object.price).map(([slug, price]) => {
      if (price === null) return `X ${localize(TRANSLATION, locale()).prices[slug]}`;

      return `${price} ${localize(TRANSLATION, locale()).prices[slug]}`;
    });

    if (object.repeatable) result.push(localize(TRANSLATION, locale()).repeatable);

    return result.join(', ');
  }

  const renderSpellRange = (range) => {
    if (range === 'self') return localize(TRANSLATION, locale()).self;

    return `${range} ${localize(TRANSLATION, locale()).squares}`;
  }

  const renderSpellDuration = (duration) => {
    if (duration === 'instant') return `${localize(TRANSLATION, locale()).duration}: ${localize(TRANSLATION, locale()).instant}`;

    const values = duration.split(',');
    if (values[1] === 'h') return `${localize(TRANSLATION, locale()).duration} (${localize(TRANSLATION, locale()).hours}): ${values[0]}`;

    return `${localize(TRANSLATION, locale()).duration} (${localize(TRANSLATION, locale()).minutes}): ${values[0]}`;
  }

  const showTagInfo = async (tag, value) => {
    const result = await fetchTagInfoRequest(appState.accessToken, character().provider, 'focus', tag);
    batch(() => {
      openModal();
      setTagInfo([value, result.value]);
    });
  }

  const learnSpell = async (spellId) => {
    const result = await createCharacterSpellRequest(
      appState.accessToken,
      character().provider,
      character().id,
      { spell_id: spellId }
    );

    if (result.errors_list === undefined) {
      batch(() => {
        setCharacterSpells([result.spell].concat(characterSpells()));
        renderNotice(localize(TRANSLATION, locale()).spellIsLearned);
      });
    }
  }

  const forgetSpell = async (spellId) => {
    const result = await removeCharacterSpellRequest(
      appState.accessToken, character().provider, character().id, spellId
    );
    if (result.errors_list === undefined) setCharacterSpells(characterSpells().filter((item) => item.spell_id !== spellId));
  }

  const setMultiSchools = (value) => {
    const newValue = spellschools().includes(value) ? spellschools().filter((item) => item !== value) : spellschools().concat([value]);
    setSpellschools(newValue);
  }

  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload, only_head: true });

    if (result.errors_list === undefined) props.onReplaceCharacter(payload);
  }

  const clearSpells = async () => {
    const result = await clearCharacterSpellsRequest(appState.accessToken, character().provider, character().id);

    if (result.errors_list === undefined) props.onReloadCharacter();
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20Spells' }}>
      <GuideWrapper character={character()}>
        <Show
          when={!spellsSelectingMode()}
          fallback={
            <>
              <div class="flex justify-between items-center mb-2">
                <Checkbox
                  labelText={localize(TRANSLATION, locale()).onlyAvailableSpells}
                  labelPosition="right"
                  labelClassList="ml-2"
                  checked={availableListFilter()}
                  onToggle={() => setAvailableListFilter(!availableListFilter())}
                />
              </div>
              <For each={renderingLists()}>
                {(list) =>
                  <Toggle title={localize(spellLists()[list].name, locale())}>
                    <div>
                      <For each={filteredSpells().filter((spell) => spell.origin_value.includes(list))}>
                        {(spell) =>
                          <div class="dc20-spell" classList={{ 'opacity-50': learnedSpellIds().includes(spell.id) }}>
                            <div class="dc20-spell-title">
                              <p class="font-normal! text-lg">{spell.title}</p>
                              <p>{localize(schools()[spell.school].name, locale())}</p>
                            </div>
                            <div class="dc20-spell-tags">
                              <For each={spell.origin_values}>
                                {(tag) =>
                                  <span class="text-sm tag">{tag}</span>
                                }
                              </For>
                            </div>
                            <Show when={spell.price}>
                              <p class="text-sm mb-1">{localize(TRANSLATION, locale()).price}: {renderSpellPrice(spell)}</p>
                            </Show>
                            <p
                              class="feat-markdown text-xs"
                              innerHTML={spell.description} // eslint-disable-line solid/no-innerhtml
                            />
                            <div class="dc20-spell-action">
                              <Show
                                when={!learnedSpellIds().includes(spell.id)}
                                fallback={<Button default size="small" onClick={() => forgetSpell(spell.id)}><Minus /></Button>}
                              >
                                <Button default size="small" onClick={() => learnSpell(spell.id)}><PlusSmall /></Button>
                              </Show>
                            </div>
                          </div>
                        }
                      </For>
                    </div>
                  </Toggle>
                }
              </For>
              <Button default textable onClick={() => setSpellsSelectingMode(false)}><span>{localize(TRANSLATION, locale()).back}</span></Button>
            </>
          }
        >
          <Show when={characterSpells() !== undefined}>
            <StatsBlock
              items={[
                { title: localize(TRANSLATION, locale()).mana_spend_limit, value: character().mana_spend_limit },
                { title: localize(TRANSLATION, locale()).spells, value: character().spells },
                {
                  title: localize(TRANSLATION, locale()).attack,
                  value:
                    <Dice
                      width="36"
                      height="36"
                      text={modifier(character().spell_attack)}
                      onClick={() => props.openD20Test('/check attack spell', null, character().spell_attack)}
                    />
                }
              ]}
            />
            <Show when={characterItems().length > 0}>
              <div class="blockable p-4 mt-2">
                <h2 class="text-lg">{localize(TRANSLATION, locale()).focuses}</h2>
                <For each={characterItems()}>
                  {(item) =>
                    <div class="mt-2">
                      <p>{item.name}</p>
                      <div class="dc20-focus-features">
                        <For each={item.info.features}>
                          {(feature) =>
                            <p class="tag" onClick={() => showTagInfo(feature, localize(TRANSLATION, locale()).features[feature])}>
                              {localize(TRANSLATION, locale()).features[feature]}
                            </p>
                          }
                        </For>
                      </div>
                    </div>
                  }
                </For>
              </div>
            </Show>
            <Switch
              fallback={
                <div class="mt-2 flex gap-2">
                  <Button default textable classList="flex-1" onClick={() => setSpellsSelectingMode(true)}>
                    <span>{localize(TRANSLATION, locale()).selectSpells}</span>
                    <Show when={character().spell_class !== character().main_class}>
                      <span class="ml-2">({localize(config.classes[character().spell_class].name, locale())})</span>
                    </Show>
                  </Button>
                  <Button default textable onClick={clearSpells}><span>{localize(TRANSLATION, locale()).clear}</span></Button>
                </div>
              }
            >
              <Match when={!character().spell_class}>
                <div class="character-info-block mb-2">
                  <Select
                    labelText={localize(TRANSLATION, locale()).selectSpellclass}
                    items={localize(TRANSLATION, locale()).spellclasses}
                    selectedValue={spellclass()}
                    onSelect={setSpellclass}
                  />
                  <Show when={spellclass()}>
                    <Button default textable classList="inline-block mt-2" onClick={() => updateCharacter({ spell_class: spellclass(), spell_filter: { source: null, schools: [] } })}>
                      <span>{localize(TRANSLATION, locale()).saveButton}</span>
                    </Button>
                  </Show>
                </div>
              </Match>
              <Match when={character().spell_class === 'bard' && character().spell_filter.schools && character().spell_filter.schools.length !== 1}>
                <div class="character-info-block mb-2">
                  <Select
                    labelText={localize(TRANSLATION, locale()).selectBard}
                    items={translate(config.schools, locale())}
                    selectedValue={spellschools()[0]}
                    onSelect={(value) => setSpellschools([value])}
                  />
                  <Show when={spellschools().length === 1}>
                    <Button default textable classList="inline-block mt-2" onClick={() => updateCharacter({ spell_filter: { schools: spellschools() } })}>
                      <span>{localize(TRANSLATION, locale()).saveButton}</span>
                    </Button>
                  </Show>
                </div>
              </Match>
              <Match when={character().spell_class === 'spellblade' && character().spell_filter.schools && character().spell_filter.schools.length !== 2}>
                <div class="character-info-block mb-2">
                  <Select
                    multi
                    labelText={localize(TRANSLATION, locale()).selectSpellblade}
                    items={translate(config.schools, locale())}
                    selectedValues={spellschools()}
                    onSelect={setMultiSchools}
                  />
                  <Show when={spellschools().length === 2}>
                    <Button default textable classList="inline-block mt-2" onClick={() => updateCharacter({ spell_filter: { schools: spellschools() } })}>
                      <span>{localize(TRANSLATION, locale()).saveButton}</span>
                    </Button>
                  </Show>
                </div>
              </Match>
              <Match when={character().spell_class === 'warlock' && character().spell_filter.schools && character().spell_filter.schools.length !== 3}>
                <div class="character-info-block mb-2">
                  <Select
                    multi
                    labelText={localize(TRANSLATION, locale()).selectWarlock}
                    items={translate(config.schools, locale())}
                    selectedValues={spellschools()}
                    onSelect={setMultiSchools}
                  />
                  <Show when={spellschools().length === 3}>
                    <Button default textable classList="inline-block mt-2" onClick={() => updateCharacter({ spell_filter: { schools: spellschools() } })}>
                      <span>{localize(TRANSLATION, locale()).saveButton}</span>
                    </Button>
                  </Show>
                </div>
              </Match>
              <Match when={character().spell_class === 'sorcerer' && !character().spell_filter.source}>
                <div class="character-info-block mb-2">
                  <Select
                    labelText={localize(TRANSLATION, locale()).selectSorcerer}
                    items={translate(config.spell_lists, locale())}
                    selectedValue={source()}
                    onSelect={setSource}
                  />
                  <Show when={source()}>
                    <Button default textable classList="inline-block mt-2" onClick={() => updateCharacter({ spell_filter: { source: source() } })}>
                      <span>{localize(TRANSLATION, locale()).saveButton}</span>
                    </Button>
                  </Show>
                </div>
              </Match>
            </Switch>
            <Show when={learnedSpellIds().length > 0}>
              <div class="mt-2">
                <For each={learnedSpells().sort((a, b) => a.title.localeCompare(b.title))}>
                  {(spell) =>
                    <Toggle
                      title={
                        <div class="flex items-center justify-between">
                          <p>{spell.title}</p>
                          <p>{localize(schools()[spell.school].name, locale())}</p>
                        </div>
                      }
                    >
                      <div>
                        <div class="flex gap-2 flex-wrap mb-1">
                          <For each={spell.origin_values}>
                            {(tag) =>
                              <span class="text-sm tag cursor-default!">{tag}</span>
                            }
                          </For>
                        </div>
                        <Show when={spell.price}>
                          <p class="text-sm mt-1">{localize(TRANSLATION, locale()).price}: {renderSpellPrice(spell)}</p>
                        </Show>
                        <Show when={spell.info.range}>
                          <p class="text-sm mt-1">{localize(TRANSLATION, locale()).range}: {renderSpellRange(spell.info.range)}</p>
                        </Show>
                        <Show when={spell.info.duration}>
                          <p class="text-sm mt-1">{renderSpellDuration(spell.info.duration)}</p>
                        </Show>
                      </div>
                      <p
                        class="feat-markdown text-xs mt-4"
                        innerHTML={spell.description} // eslint-disable-line solid/no-innerhtml
                      />
                      <Show when={spell.info.enhancements.length > 0}>
                        <div class="mt-4">
                          <p class="font-normal!">{localize(TRANSLATION, locale()).enhancements}</p>
                          <For each={spell.info.enhancements}>
                            {(enhancement) =>
                              <p class="feat-markdown text-sm mt-1">
                                <span class="font-medium!">{localize(enhancement.name, locale())}</span>
                                : ({renderSpellPrice(enhancement)}) {localize(enhancement.description, locale())}
                              </p>
                            }
                          </For>
                        </div>
                      </Show>
                      <Show when={spell.notes}><p class="text-sm mt-2">{spell.notes}</p></Show>
                    </Toggle>
                  }
                </For>
              </div>
            </Show>
          </Show>
        </Show>
        <Modal classList="md:max-w-md!">
          <p class="mb-3 text-xl">{tagInfo()[0]}</p>
          <p>{tagInfo()[1]}</p>
        </Modal>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
