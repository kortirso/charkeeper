import { For, Show } from 'solid-js';

import { SpellRange } from './Spells/Range';
import { SpellDuration } from './Spells/Duration';
import { SpellDefense } from './Spells/Defense';
import { Toggle, Dice, IconButton } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { localize, modifier } from '../../../../helpers';
import { Star } from '../../../../assets';

const TRANSLATION = {
  en: {
    level: 'level',
    innate: ' (Innate)',
    additional: ' (Additional)',
    check: 'Spell attack',
    saveDC: 'Save DC',
    limit: 'Limit',
    cantrip: 'Cantrip',
    heightened: 'Heightened',
    sustained: 'Sustained'
  },
  ru: {
    level: 'уровень',
    innate: ' (Врождённое)',
    additional: ' (Дополнительное)',
    check: 'Атака заклинанием',
    saveDC: 'Спасброски',
    limit: 'Лимит',
    cantrip: 'Фокус',
    heightened: 'Повышенное',
    sustained: 'Поддерживаемое'
  },
  es: {
    level: 'nivel',
    innate: ' (Ínnato)',
    additional: ' (Adicional)',
    check: 'Ataque de hechizo',
    saveDC: 'DC de salvación',
    limit: 'Límite',
    cantrip: 'Truco',
    heightened: 'Aumentado',
    sustained: 'Sostenido'
  }
}

export const Pathfinder2Spell = (props) => {
  const spell = () => props.spell;

  const [locale] = useAppLocale();

  const onInnateDiceRoll = (e) => {
    e.stopPropagation();

    props.openD20Test('/check attack spell', localize(TRANSLATION, locale()).check, props.spellAttack)
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
      classList={{ 'opacity-75': props.learnedSpellIds && props.learnedSpellIds[spell().id] }}
      title={
        <div class="flex">
          <div class="flex-1">
            <div class="flex justify-between">
              <p class="flex gap-x-4">
                <Show when={props.signature}>
                  <IconButton onClick={(e) => props.onSignature(e, !props.value.signature)}>
                    <Show when={props.value.signature} fallback={<Star width="20" height="20" />}>
                      <Star filled width="20" height="20" />
                    </Show>
                  </IconButton>
                </Show>
                <span>{spell().title}</span>
                <Show when={Object.keys(spell().price).length > 0}><span>
                  {Object.entries(spell().price).map(([key, value]) => `${value}${key.toUpperCase()}`).join(' ')}
                </span></Show>
                <Show when={!props.noLevel && spell().info.level > 0}>
                  <p>{spell().info.level} {localize(TRANSLATION, locale()).level}</p>
                </Show>
                <Show when={props.kind === "innate"}><span>{localize(TRANSLATION, locale()).innate}</span></Show>
                <Show when={props.kind === "additional"}><span>{localize(TRANSLATION, locale()).additional}</span></Show>
              </p>
              <Show when={props.kind === "innate"}>
                <Dice
                  width="36"
                  height="36"
                  text={modifier(props.spellAttack)}
                  onClick={onInnateDiceRoll}
                />
              </Show>
              <Show when={!props.prepareMode && props.children}>{props.children}</Show>
            </div>
            <Show when={!props.prepareMode}>
              <Show when={spell().info.level > 0 && props.level > spell().info.level}>
                <p class="font-medium! text-sm mt-1">
                  {localize(TRANSLATION, locale()).heightened} +{props.level - spell().info.level}
                </p>
              </Show>
              <Show when={spell().info.level === 0 && props.cantripLevel > 1}>
                <p class="font-medium! text-sm mt-1">
                  {localize(TRANSLATION, locale()).heightened} +{props.cantripLevel - 1}
                </p>
              </Show>
              <Show when={props.kind === "innate"}>
                <div class="flex gap-x-4 mt-1 text-sm">
                  <p><span class="font-medium!">{localize(TRANSLATION, locale()).saveDC}:</span> {props.spellDc}</p>
                  <Show when={props.limit}>
                    <p><span class="font-medium!">{localize(TRANSLATION, locale()).limit}:</span> {props.limit}</p>
                  </Show>
                </div>
              </Show>
              <div class="flex gap-2 flex-wrap mt-1">
                <For each={spell().origin_values}>
                  {(originValue) =>
                    <span class="tag text-sm!">{originValue}</span>
                  }
                </For>
              </div>
            </Show>
          </div>
          <Show when={props.prepareMode && props.children}>{props.children}</Show>
        </div>
      }
    >
      <SpellRange value={spell().info.range} />
      <SpellDuration value={spell().info.duration} />
      <SpellDefense value={spell().info.defense} />
      <Show when={spell().info.sustained}>
        <p class="text-sm mt-1 font-medium!">{localize(TRANSLATION, locale()).sustained}</p>
      </Show>
      <p
        class="feat-markdown mt-1"
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
