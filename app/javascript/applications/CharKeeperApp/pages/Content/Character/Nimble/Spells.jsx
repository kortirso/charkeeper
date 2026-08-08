import { createSignal, createEffect, createMemo, For, Show, batch } from 'solid-js';

import config from '../../../../data/nimble.json';
import { ErrorWrapper, GuideWrapper, Toggle, Dice, Button, Checkbox, StatsBlock } from '../../../../components';
import { useAppState, useAppLocale } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { fetchSpellsRequest } from '../../../../requests/fetchSpellsRequest';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    level: 'Level',
    time: 'Time',
    target: 'Target',
    targets: {
      self: 'Self',
      single: 'Single',
      aoe: 'AoE'
    },
    selectSpells: 'Battle',
    selectUtilitySpells: 'Utility',
    back: 'Back',
    limit: 'Limit',
    saveDc: 'Save DC',
    mana: 'Mana points'
  },
  ru: {
    level: 'Уровень',
    time: 'Время',
    target: 'Цели',
    targets: {
      self: 'На себя',
      single: 'Одиночная',
      aoe: 'Область'
    },
    selectSpells: 'Боевые',
    selectUtilitySpells: 'Вспомогательные',
    back: 'Назад',
    limit: 'Макс',
    saveDc: 'УС спаса',
    mana: 'Очки маны'
  }
}

export const NimbleSpells = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [spells, setSpells] = createSignal(undefined);
  const [selectingMode, setSelectingMode] = createSignal(null);

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    const fetchSpells = async () => await fetchSpellsRequest(appState.accessToken, character().provider);

    Promise.all([fetchSpells()]).then(
      ([spellsData]) => {
        batch(() => {
          setSpells(spellsData.spells.sort((a, b) => a.info.level > b.info.level));
        });
      }
    );

    setLastActiveCharacterId(character().id);
  });

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const renderingLists = createMemo(() => {
    if (!character().schools) return [];

    const schools = Object.entries(config.schools);
    if (selectingMode() === 'utility') return schools;
    if (selectingMode() === 'default') return schools.filter(([slug,]) => !character().schools.includes(slug));

    return schools.filter(([slug,]) => character().schools.includes(slug) || character().learned_spells[slug] && character().learned_spells[slug].length > 0);
  });

  const renderingSpells = createMemo(() => {
    if (!spells()) return [];
    if (selectingMode() === 'utility') return spells().filter((item) => item.origin === 'utility_spell');
    if (selectingMode() === 'default') return spells().filter((item) => item.info.level <= character().spell_level && item.origin === 'spell');

    return character().spells;
  });

  const learnSpell = (school, slug) => {
    const current = character().learned_spells[school] || [];
    current.push(slug);
    updateCharacter({ learned_spells: { ...character().learned_spells, [school]: current } });
  }

  const forgetSpell = (school, slug) => {
    const current = character().learned_spells[school];
    updateCharacter({ learned_spells: { ...character().learned_spells, [school]: current.filter((item) => item !== slug) } });
  }

  const changeMana = (coef) => updateCharacter({ mana_spent: character().mana_spent + coef });

  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload, only_head: true });

    if (result.errors_list === undefined) props.onReplaceCharacter(payload);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'NimbleSpells' }}>
      <GuideWrapper character={character()}>
        <StatsBlock
          items={[
            { title: i18n().saveDc, value: character().save_dc },
            {
              title: i18n().mana,
              value:
                <div class="flex items-center gap-4">
                  <Button default size="small" disabled={character().mana_max === character().mana_spent} onClick={() => changeMana(1)}><Minus /></Button>
                  {character().mana_max - character().mana_spent} / {character().mana_max}
                  <Button default size="small" disabled={character().mana_spent === 0} onClick={() => changeMana(-1)}><Plus /></Button>
                </div>
            }
          ]}
        />
        <Show
          when={selectingMode() === null}
          fallback={
            <Button default textable classList="flex-1 mb-2" onClick={() => setSelectingMode(null)}>
              <span>{i18n().back}</span>
            </Button>
          }
        >
          <div class="flex gap-2 mb-2">
            <Button default textable classList="flex-1" onClick={() => setSelectingMode('default')}>
              <span>{i18n().selectSpells}</span>
            </Button>
            <Button default textable classList="flex-1" onClick={() => setSelectingMode('utility')}>
              <span>{i18n().selectUtilitySpells}</span>
            </Button>
          </div>
        </Show>
        <For each={renderingLists()}>
          {([slug, values]) =>
            <Toggle
              title={
                <span>{localize(values.name, locale())}
                  <Show when={selectingMode() === 'utility'}> ({i18n().limit} {character().utility_spells_limit[slug] || 0})</Show>
                </span>
              }
              isOpenByParent={selectingMode() || undefined}
            >
              <div>
                <For each={renderingSpells().filter((spell) => spell.origin_value === slug)}>
                  {(spell) =>
                    <div class="dc20-spell p-2! flex flex-col gap-1" classList={{ 'opacity-50': selectingMode() && character().learned_spells[slug]?.includes(spell.slug) }}>
                      <div class="dc20-spell-title">
                        <p class="font-normal! text-lg">{spell.title}</p>
                        <p>{i18n().level} {spell.info.level}</p>
                      </div>
                      <Show when={spell.info.time}>
                        <p class="text-sm!"><span style={{ 'font-weight': 500 }}>{i18n().time}</span>: {spell.info.time.split(',').join('')}</p>
                      </Show>
                      <Show when={spell.info.target}>
                        <p class="text-sm!"><span style={{ 'font-weight': 500 }}>{i18n().target}</span>: {i18n().targets[spell.info.target]}</p>
                      </Show>
                      <p
                        class="feat-markdown text-sm!"
                        innerHTML={spell.description} // eslint-disable-line solid/no-innerhtml
                      />
                      <Show
                        when={selectingMode()}
                        fallback={
                          <Show when={spell.damage}>
                            <div class="flex justify-end">
                              <Dice
                                width="36"
                                height="36"
                                text={`${spell.damage}${spell.damage_bonus && spell.damage_bonus > 0 ? '+' : ''}${!spell.damage_bonus || spell.damage_bonus === 0 ? '' : spell.damage_bonus}`}
                                onClick={() => props.openNimbleAttack('/nimbleAttack', spell.title, spell.damage, spell.damage_bonus, null, true)}
                              />
                            </div>
                          </Show>
                        }
                      >
                        <div class="dc20-spell-action">
                          <Checkbox
                            checked={character().learned_spells[slug]?.includes(spell.slug)}
                            onToggle={() => character().learned_spells[slug]?.includes(spell.slug) ? forgetSpell(slug, spell.slug) : learnSpell(slug, spell.slug)}
                          />
                        </div>
                      </Show>
                    </div>
                  }
                </For>
              </div>
            </Toggle>
          }
        </For>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
