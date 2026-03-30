import { For, Show } from 'solid-js';

import { SpellRange } from './Spells/Range';
import { SpellDuration } from './Spells/Duration';
import { SpellDefense } from './Spells/Defense';
import { Button, Toggle, Dice } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { localize, modifier } from '../../../../helpers';
import { PlusSmall, Minus } from '../../../../assets';
import config from '../../../../data/pathfinder2.json';

const TRANSLATION = {
  en: {
    level: 'level',
    traditions: 'Traditions',
    innate: ' (Innate)',
    check: 'Spell attack',
    saveDC: 'Save DC',
    limit: 'Limit'
  },
  ru: {
    level: 'уровень',
    traditions: 'Традиции',
    innate: ' (Врождённое)',
    check: 'Атака заклинанием',
    saveDC: 'Спасброски',
    limit: 'Лимит'
  }
}

export const Pathfinder2Spell = (props) => {
  const spell = () => props.spell;

  const [locale] = useAppLocale();

  const forgetSpell = (e) => {
    e.stopPropagation();

    props.onForgetSpell(spell().id);
  }

  const learnSpell = (e) => {
    e.stopPropagation();

    props.onLearnSpell(spell().id);
  }

  const disableSpell = (e, counter) => {
    e.stopPropagation();

    props.onDisableSpell(props.characterSpellId, counter);
  }

  const enableSpell = (e, counter, spellLevel) => {
    e.stopPropagation();

    props.onEnableSpell(props.characterSpellId, counter, spellLevel);
  }

  const onInnateDiceRoll = (e) => {
    e.stopPropagation();

    props.onOpenDiceRoll('/check attack spell', props.spellAttack, localize(TRANSLATION, locale()).check)
  }

  const renderEnhancementTitle = (enhancement) => {
    const result = [];
    if (enhancement.name) result.push(localize(enhancement.name, locale()));
    if (enhancement.time) result.push(enhancement.time.toUpperCase());
    if (enhancement.concentrate) result.push('C');

    return <span class="font-medium!">{result.join(' ')}</span>;
  }

  return (
    <Toggle
      containerClassList="mb-0!"
      classList={{ 'opacity-50': props.learnedSpellIds?.includes(spell().id) }}
      title={
        <>
          <div class="flex items-center justify-between">
            <p>
              {spell().title}
              <Show when={props.innate}>{localize(TRANSLATION, locale()).innate}</Show>
            </p>
            <Show when={props.innate}>
              <Dice
                width="36"
                height="36"
                text={modifier(props.spellAttack)}
                onClick={onInnateDiceRoll}
              />
            </Show>
            <Show
              when={props.noLevel}
              fallback={
                <div class="flex gap-2">
                  <p>{spell().info.level} {localize(TRANSLATION, locale()).level}</p>
                  <Show when={props.learnedSpellIds}>
                    <Show
                      when={!props.learnedSpellIds.includes(spell().id)}
                      fallback={<Button default size="small" onClick={forgetSpell}><Minus /></Button>}
                    >
                      <Button default size="small" onClick={learnSpell}><PlusSmall /></Button>
                    </Show>
                  </Show>
                </div>
              }
            >
              <Show
                when={props.prepareMode}
                fallback={
                  <Show when={spell().info.level > 0 && props.children}>
                    {props.children}
                  </Show>
                }
              >
                <Show
                  when={spell().info.level > 0}
                  fallback={
                    <Show
                      when={props.readyToUse}
                      fallback={
                        <Button default size="small" onClick={(e) => enableSpell(e, 1, spell().info.level)}><PlusSmall /></Button>
                      }
                    >
                      <Button default size="small" onClick={(e) => disableSpell(e, 0)}><Minus /></Button>
                    </Show>
                  }
                >
                  <div class="flex items-center gap-x-2">
                    <Button default size="small" onClick={(e) => props.selectedCount === 0 ? null : disableSpell(e, props.selectedCount - 1)}><Minus /></Button>
                    <p>{props.selectedCount}</p>
                    <Button default size="small" onClick={(e) => enableSpell(e, props.selectedCount + 1, spell().info.level)}><PlusSmall /></Button>
                  </div>
                </Show>
              </Show>
            </Show>
          </div>
          <Show when={props.innate}>
            <div class="flex gap-x-4 mt-1 dark:text-snow text-sm">
              <p><span class="font-medium!">{localize(TRANSLATION, locale()).saveDC}:</span> {props.spellDc}</p>
              <p><span class="font-medium!">{localize(TRANSLATION, locale()).limit}:</span> {props.limit}</p>
            </div>
          </Show>
          <div class="flex gap-2 flex-wrap mt-1">
            <For each={spell().origin_values}>
              {(originValue) =>
                <span class="tag text-sm!">{originValue}</span>
              }
            </For>
          </div>
          <p class="mt-1 text-sm">
            <span class="font-medium!">{localize(TRANSLATION, locale()).traditions}:</span> {spell().origin_value.map((item) => config.spellLists[item].name[locale()]).join(', ')}
          </p>
          <SpellRange value={spell().info.range} />
          <SpellDuration value={spell().info.duration} />
          <SpellDefense value={spell().info.defense} />
        </>
      }
    >
      <p
        class="feat-markdown"
        innerHTML={spell().description} // eslint-disable-line solid/no-innerhtml
      />
      <Show when={spell().info.enhancements && spell().info.enhancements.length > 0}>
        <div class="mt-2">
          <For each={spell().info.enhancements}>
            {(enhancement) =>
              <p class="feat-markdown text-sm mt-1">
                {renderEnhancementTitle(enhancement)}: {localize(enhancement.description, locale())}
              </p>
            }
          </For>
        </div>
      </Show>
    </Toggle>
  );
}
