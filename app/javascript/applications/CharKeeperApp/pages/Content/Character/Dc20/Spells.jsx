import { createSignal, createEffect, createMemo, For, Show, batch } from 'solid-js';

import config from '../../../../data/dc20.json';
import { ErrorWrapper, GuideWrapper, Toggle, Button, Checkbox, createModal, StatsBlock, Dice } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall, Minus } from '../../../../assets';
import { fetchSpellsRequest } from '../../../../requests/fetchSpellsRequest';
import { fetchCharacterSpellsRequest } from '../../../../requests/fetchCharacterSpellsRequest';
import { createCharacterSpellRequest } from '../../../../requests/createCharacterSpellRequest';
import { removeCharacterSpellRequest } from '../../../../requests/removeCharacterSpellRequest';
import { fetchCharacterItemsRequest } from '../../../../requests/fetchCharacterItemsRequest';
import { fetchTagInfoRequest } from '../../../../requests/fetchTagInfoRequest';
import { modifier, localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    mana_spend_limit: 'Mana spend limit',
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
      'Long-Ranged': 'Long-Ranged'
    },
    attack: 'Spell Check'
  },
  ru: {
    mana_spend_limit: 'Предел траты маны',
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
      'Long-Ranged': 'Дальнобойное'
    },
    attack: 'Бонус атаки'
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
    if (availableListFilter()) {
      if (character().spell_list.length > 0) {
        return Object.keys(spellLists()).filter((item) => character().spell_list.includes(item));
      }
    }

    return Object.keys(spellLists());
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

  const renderSpellPrice = (price) => {
    return Object.entries(price).map(([slug, price]) => {
      if (price === null) return `X ${localize(TRANSLATION, locale()).prices[slug]}`;

      return `${price} ${localize(TRANSLATION, locale()).prices[slug]}`;
    }).join(', ');
  }

  const renderSpellRange = (range) => {
    if (range === 'self') return localize(TRANSLATION, locale()).self;

    return `${range} ${localize(TRANSLATION, locale()).squares}`;
  }

  const renderSpellDuration = (duration) => {
    if (duration === 'instant') return `${localize(TRANSLATION, locale()).duration}: ${localize(TRANSLATION, locale()).instant}`;
    if (duration >= 60) return `${localize(TRANSLATION, locale()).duration} (${localize(TRANSLATION, locale()).hours}): ${duration / 60}`;

    return `${localize(TRANSLATION, locale()).duration} (${localize(TRANSLATION, locale()).minutes}): ${duration}`;
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
                  <Toggle title={spellLists()[list].name[locale()]}>
                    <div>
                      <For each={spells().filter((spell) => spell.origin_value.includes(list))}>
                        {(spell) =>
                          <div
                            class="even:bg-stone-100 dark:even:bg-dark-dusty p-1"
                            classList={{ 'opacity-50': learnedSpellIds().includes(spell.id) }}
                          >
                            <div class="flex items-center justify-between mb-2">
                              <p class="font-normal! text-lg">{spell.title}</p>
                              <p>{schools()[spell.school].name[locale()]}</p>
                            </div>
                            <p
                              class="feat-markdown text-xs"
                              innerHTML={spell.description} // eslint-disable-line solid/no-innerhtml
                            />
                            <div class="flex flex-row justify-end">
                              <Show
                                when={!learnedSpellIds().includes(spell.id)}
                                fallback={
                                  <Button default size="small" onClick={() => forgetSpell(spell.id)}>
                                    <Minus />
                                  </Button>
                                }
                              >
                                <Button default size="small" onClick={() => learnSpell(spell.id)}>
                                  <PlusSmall />
                                </Button>
                              </Show>
                            </div>
                          </div>
                        }
                      </For>
                    </div>
                  </Toggle>
                }
              </For>
              <Button default textable onClick={() => setSpellsSelectingMode(false)}>{localize(TRANSLATION, locale()).back}</Button>
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
                      text={modifier(character().attack)}
                      onClick={() => props.openDiceRoll('/check attack spell', character().attack)}
                    />
                }
              ]}
            />
            <Show when={characterItems().length > 0}>
              <div class="blockable p-4 mt-2">
                <h2 class="text-lg flex items-center gap-x-2">Фокусировка</h2>
                <For each={characterItems()}>
                  {(item) =>
                    <div class="mt-2">
                      <p>{item.name}</p>
                      <div class="flex flex-wrap gap-x-2 gap-y-1 mt-1">
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
            <Show when={learnedSpellIds().length > 0}>
              <div class="mt-2">
                <For each={learnedSpells()}>
                  {(spell) =>
                    <Toggle title={spell.title}>
                      <div>
                        <Show when={spell.price}>
                          <p class="text-sm mt-1">{localize(TRANSLATION, locale()).price}: {renderSpellPrice(spell.price)}</p>
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
                      <div class="mt-4">
                        <p class="font-normal!">{localize(TRANSLATION, locale()).enhancements}</p>
                        <For each={spell.info.enhancements}>
                          {(enhancement) =>
                            <p class="feat-markdown text-sm mt-1">
                              <span class="font-medium!">{enhancement.name[locale()]}</span>
                              : ({renderSpellPrice(enhancement.price)}) {enhancement.description[locale()]}
                            </p>
                          }
                        </For>
                      </div>
                      <Show when={spell.notes}><p class="text-sm mt-2">{spell.notes}</p></Show>
                    </Toggle>
                  }
                </For>
              </div>
            </Show>
            <Button default textable classList="mt-2" onClick={() => setSpellsSelectingMode(true)}>
              {localize(TRANSLATION, locale()).selectSpells}
            </Button>
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
