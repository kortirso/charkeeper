import { createSignal, createMemo, For, Show } from 'solid-js';

import { Pathfinder2Spell } from '../../../../pages';
import { StatsBlock, Button, Checkbox, Select, Input } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { localize, performResponse, translate } from '../../../../helpers';
import config from '../../../../data/pathfinder2.json';
import { createCharacterSpellRequest } from '../../../../requests/createCharacterSpellRequest';
import { updateCharacterSpellRequest } from '../../../../requests/updateCharacterSpellRequest';
import { removeCharacterSpellRequest } from '../../../../requests/removeCharacterSpellRequest';

const TRANSLATION = {
  en: {
    cantripsAmount: 'Cantrips amount',
    spellsAmount: 'Spells amount',
    spellIsLearned: 'Spell is learned',
    spellIsForget: 'Spell is forget',
    back: 'Back to using spells',
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
    spellIsForget: 'Заклинание забыто',
    back: 'К применению заклинаний',
    filters: 'Показать фильтры',
    tradition: 'Традиция',
    levels: 'Уровни',
    cantrips: 'Фокусы',
    search: 'Поиск',
    searchByTitle: 'Поиск по названию'
  },
  es: {
    cantripsAmount: 'Cantidad de trucos',
    spellsAmount: 'Cantidad de hechizos',
    spellIsLearned: 'Hechizo aprendido',
    spellIsForget: 'Hechizo olvidado',
    back: 'Volver a usar hechizos',
    filters: 'Mostrar filtros',
    tradition: 'Tradición',
    levels: 'Niveles',
    cantrips: 'Trucos',
    search: 'Buscar',
    searchByTitle: 'Buscar por título'
  }
}

export const Pathfinder2SpellBook = (props) => {
  const spells = () => props.spells;
  const character = () => props.character;

  const [showFilters, setShowFilters] = createSignal(false);
  const [traditionFilter, setTraditionFilter] = createSignal(
    props.spellsInfo?.spell_list ? [props.spellsInfo?.spell_list] : (character().spell_list ? [character().spell_list] : [])
  );
  const [levelFilter, setLevelFilter] = createSignal(props.spellsInfo ? Array.from([...Array(props.spellsInfo.max_spell_level + 1).keys()], (x) => x.toString()) : ['0']);
  const [titleFilter, setTitleFilter] = createSignal('');

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();

  const changeFilter = (currentValues, callback, value) => {
    callback(
      currentValues.includes(value) ? currentValues.filter((item) => item !== value) : currentValues.concat([value])
    );
  }

  const hasSharedElement = (initialList, filterSet) => initialList.some(item => filterSet.has(item));

  const filteredSpells = createMemo(() => {
    if (!spells()) return [];

    const traditionFilterSet = traditionFilter().length > 0 && props.kind !== 'focus' ? (new Set(traditionFilter())) : null;
    const levelFilterSet = levelFilter().length > 0 && props.kind !== 'focus' ? levelFilter().map((item) => parseInt(item)) : null;
    const searchPattern = titleFilter().length > 2 && props.kind !== 'focus' ? titleFilter().toLowerCase() : null;
    return spells().filter((item) => {
      if (traditionFilterSet && !hasSharedElement(item.origin_value, traditionFilterSet)) return false;
      if (levelFilterSet && !levelFilterSet.includes(item.info.level)) return false;
      if (searchPattern && !(item.title.toLowerCase().includes(searchPattern) || item.original_title?.toLowerCase()?.includes(searchPattern))) return false;

      return true;
    });
  });

  const learnedDefaultSpells = createMemo(() => {
    if (props.characterSpells === undefined) return 0;

    return props.characterSpells.filter((item) => item.kind === 'default' && item.spell.info.level !== 0).length;
  });

  const learnedDefaultCantrips = createMemo(() => {
    if (props.characterSpells === undefined) return 0;

    return props.characterSpells.filter((item) => item.kind === 'default' && item.spell.info.level === 0).length;
  });

  const learnedSpellIds = createMemo(() => {
    if (props.characterSpells === undefined) return {};

    return props.characterSpells.reduce((acc, item) => {
      acc[item.spell.id] = { value: item.value, characterSpellId: item.id, kind: item.kind };
      return acc;
    }, {});
  });

  // изучить заклинание
  const learnSpell = async (e, spell) => {
    e.stopPropagation();

    const payload = { level: spell.info.level, kind: props.kind, prepared_by: props.preparedBy };

    const result = await createCharacterSpellRequest(appState.accessToken, character().provider, character().id, { spell_id: spell.id, spell: payload });
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onAddCharacterSpell(result.spell);
        renderNotice(localize(TRANSLATION, locale()).spellIsLearned);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  // забыть заклинание
  const forgetSpell = async (e, spell) => {
    e.stopPropagation();

    const characterSpellId = learnedSpellIds()[spell.id].characterSpellId;
    const result = await removeCharacterSpellRequest(appState.accessToken, character().provider, character().id, characterSpellId);
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onRemoveCharacterSpell(characterSpellId);
        renderNotice(localize(TRANSLATION, locale()).spellIsForget);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  // изучить спонтанное заклинание на определенный уровень
  const learnSpellLevel = async (e, spell, level) => {
    e.stopPropagation();

    const payload = { spell_id: spell.id, spell: { level: level, kind: props.kind, prepared_by: props.preparedBy } };

    const result = await createCharacterSpellRequest(appState.accessToken, character().provider, character().id, payload);
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onAddCharacterSpell(result.spell);
        renderNotice(localize(TRANSLATION, locale()).spellIsLearned);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  // изучить спонтанное заклинание на дополнительный уровень
  const upgradeSpellLevel = async (e, spell, level) => {
    e.stopPropagation();

    const payload = { spell: { level: level, selected_count: 1 } };
    const characterSpellId = learnedSpellIds()[spell.id].characterSpellId;

    const result = await updateCharacterSpellRequest(appState.accessToken, character().provider, character().id, characterSpellId, payload);
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onUpdateCharacterSpell(characterSpellId, result);
        renderNotice(localize(TRANSLATION, locale()).spellIsLearned);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  // забыть спонтанное заклинание
  const forgetSpellLevel = async (e, spell, level) => {
    e.stopPropagation();

    const payload = { spell: { level: level, selected_count: 0 } };
    const characterSpellId = learnedSpellIds()[spell.id].characterSpellId;

    const result = await updateCharacterSpellRequest(appState.accessToken, character().provider, character().id, characterSpellId, payload);
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onUpdateCharacterSpell(characterSpellId, result);
        renderNotice(localize(TRANSLATION, locale()).spellIsForget);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <>
      <Show when={props.kind === 'default' && props.spellsInfo.learn}>
        <StatsBlock
          items={[
            { title: localize(TRANSLATION, locale()).cantripsAmount, value: `${learnedDefaultCantrips()}/${props.spellsInfo.cantrips_amount}` },
            { title: localize(TRANSLATION, locale()).spellsAmount, value: `${learnedDefaultSpells()}/${props.spellsInfo.spells_amount}` }
          ]}
        />
      </Show>
      <Button default textable classList="mb-2" onClick={props.onBack}>{localize(TRANSLATION, locale()).back}</Button>
      <Show when={props.kind !== 'focus'}>
        <Checkbox
          labelText={localize(TRANSLATION, locale()).filters}
          labelPosition="right"
          labelClassList="ml-2"
          classList="mb-2"
          checked={showFilters()}
          onToggle={() => setShowFilters(!showFilters())}
        />
      </Show>
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
            <Pathfinder2Spell spell={spell}>
              <Show
                when={props.spellsInfo?.prepare || spell.info.level === 0 || props.kind === 'innate' || props.kind === 'focus'}
                fallback={
                  <div class="flex flex-col gap-2">
                    {/* изучение спонтанного заклинания */}
                    <For each={Object.keys(props.spellsInfo.spells_slots)}>
                      {(level) =>
                        <div class="flex gap-2">
                          <span>{level} - </span>
                          <Show
                            when={learnedSpellIds()[spell.id]}
                            fallback={<Checkbox checked={false} onToggle={(e) => learnSpellLevel(e, spell, level)} />}
                          >
                            <Checkbox
                              checked={learnedSpellIds()[spell.id].value[level]?.selected_count !== 0}
                              onToggle={(e) => learnedSpellIds()[spell.id].value[level]?.selected_count !== 0 ? forgetSpellLevel(e, spell, level) : upgradeSpellLevel(e, spell, level)}
                            />
                          </Show>
                        </div>
                      }
                    </For>
                  </div>
                }
              >
                {/* изучение подготавливаемого заклинания или Заговора */}
                <Checkbox
                  checked={learnedSpellIds()[spell.id]}
                  onToggle={(e) => learnedSpellIds()[spell.id] ? forgetSpell(e, spell) : learnSpell(e, spell)}
                />
              </Show>
            </Pathfinder2Spell>
          }
        </For>
      </div>
    </>
  );
}
