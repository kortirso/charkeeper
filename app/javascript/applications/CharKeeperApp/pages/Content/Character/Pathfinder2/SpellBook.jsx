import { createSignal, createMemo, For, Show } from 'solid-js';

import { Pathfinder2Spell } from '../../../../pages';
import { StatsBlock, Button, Checkbox, Select, Input } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { localize, performResponse, translate } from '../../../../helpers';
import config from '../../../../data/pathfinder2.json';
import { createCharacterSpellRequest } from '../../../../requests/createCharacterSpellRequest';
import { removeCharacterSpellRequest } from '../../../../requests/removeCharacterSpellRequest';

const TRANSLATION = {
  en: {
    cantripsAmount: 'Cantrips amount',
    spellsAmount: 'Spells amount',
    spellIsLearned: 'Spell is learned',
    back: 'Back to preparing spells',
    filters: 'Show filters',
    tradition: 'Tradition',
    levels: 'Levels',
    cantrips: 'Cantrips',
    search: 'Search',
    searchByTitle: 'Search by title'
  },
  ru: {
    cantripsAmount: 'Лимит фокусов',
    spellsAmount: 'Лимит заклинаний',
    spellIsLearned: 'Заклинание выучено',
    back: 'К подготовке заклинаний',
    filters: 'Показать фильтры',
    tradition: 'Традиция',
    levels: 'Уровни',
    cantrips: 'Фокусы',
    search: 'Search',
    searchByTitle: 'Поиск по названию'
  }
}

export const Pathfinder2SpellBook = (props) => {
  const spells = () => props.spells;
  const character = () => props.character;

  const [showFilters, setShowFilters] = createSignal(false);
  const [traditionFilter, setTraditionFilter] = createSignal(props.character.spell_list ? [props.character.spell_list] : [])
  const [levelFilter, setLevelFilter] = createSignal(Array.from([...Array(props.character.spells_info.max_spell_level).keys()], (x) => x.toString()));
  const [titleFilter, setTitleFilter] = createSignal('');

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();

  const changeFilter = (currentValues, callback, value) => {
    callback(
      currentValues.includes(value) ? currentValues.filter((item) => item !== value) : currentValues.concat([value])
    );
  }

  const hasSharedElement = (initialList, filterSet) => {
    return initialList.some(item => filterSet.has(item)); // O(n) time complexity
  }

  const filteredSpells = createMemo(() => {
    if (!spells()) return [];

    const traditionFilterSet = traditionFilter().length > 0 ? (new Set(traditionFilter())) : null;
    const levelFilterSet = levelFilter().length > 0 ? levelFilter().map((item) => parseInt(item)) : null;
    const searchPattern = titleFilter().length > 2 ? titleFilter().toLowerCase() : null;
    return spells().filter((item) => {
      if (traditionFilterSet && !hasSharedElement(item.origin_value, traditionFilterSet)) return false;
      if (levelFilterSet && !levelFilterSet.includes(item.info.level)) return false;
      if (searchPattern && !(item.title.toLowerCase().includes(searchPattern) || item.original_title?.toLowerCase()?.includes(searchPattern))) return false;

      return true;
    });
  });

  const learnedSpellIds = createMemo(() => {
    if (props.characterSpells === undefined) return [];

    return props.characterSpells.map((item) => item.spell.id);
  });

  const learnedCantrips = createMemo(() => {
    if (props.characterSpells === undefined) return 0;

    return props.characterSpells.filter((item) => item.spell.info.level === 0).length;
  });

  const learnSpell = async (spellId) => {
    const result = await createCharacterSpellRequest(appState.accessToken, character().provider, character().id, { spell_id: spellId });

    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onSetCharacterSpells([result.spell].concat(props.characterSpells));
        renderNotice(localize(TRANSLATION, locale()).spellIsLearned);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const forgetSpell = async (spellId) => {
    const result = await removeCharacterSpellRequest(appState.accessToken, character().provider, character().id, spellId);
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onSetCharacterSpells(props.characterSpells.filter((item) => item.spell.id !== spellId));
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <>
      <StatsBlock
        items={[
          { title: localize(TRANSLATION, locale()).cantripsAmount, value: `${learnedCantrips()}/${character().spells_info.cantrips_amount}` },
          { title: localize(TRANSLATION, locale()).spellsAmount, value: `${learnedSpellIds().length - learnedCantrips()}/${character().spells_info.spells_amount}` }
        ]}
      />
      <Button default textable classList="mb-2" onClick={props.onBack}>{localize(TRANSLATION, locale()).back}</Button>
      <Checkbox
        labelText={localize(TRANSLATION, locale()).filters}
        labelPosition="right"
        labelClassList="ml-2"
        classList="mb-2"
        checked={showFilters()}
        onToggle={() => setShowFilters(!showFilters())}
      />
      <Show when={showFilters()}>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-2">
          <Select
            multi
            labelText={localize(TRANSLATION, locale()).tradition}
            items={translate(config.spellLists, locale())}
            selectedValues={traditionFilter()}
            onSelect={(value) => changeFilter(traditionFilter(), setTraditionFilter, value)}
          />
          <Select
            multi
            labelText={localize(TRANSLATION, locale()).levels}
            items={{ 0: localize(TRANSLATION, locale()).cantrips, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10 }}
            selectedValues={levelFilter()}
            onSelect={(value) => changeFilter(levelFilter(), setLevelFilter, value)}
          />
          <Input
            labelText={localize(TRANSLATION, locale()).search}
            placeholder={localize(TRANSLATION, locale()).searchByTitle}
            value={titleFilter()}
            onInput={setTitleFilter}
          />
        </div>
      </Show>
      <div class="flex flex-col gap-2">
        <For each={filteredSpells()}>
          {(spell) =>
            <Pathfinder2Spell
              spell={spell}
              learnedSpellIds={learnedSpellIds()}
              onForgetSpell={forgetSpell}
              onLearnSpell={learnSpell}
            />
          }
        </For>
      </div>
    </>
  );
}
