import { For, Show } from 'solid-js';

import { Button, Toggle } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { localize } from '../../../../helpers';
import { PlusSmall, Minus } from '../../../../assets';
import config from '../../../../data/pathfinder2.json';

const TRANSLATION = {
  en: {
    level: 'level',
    traditions: 'Traditions'
  },
  ru: {
    level: 'уровень',
    traditions: 'Традиции'
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

  return (
    <Toggle
      containerClassList="mb-0!"
      classList={{ 'opacity-50': props.learnedSpellIds?.includes(spell().id) }}
      title={
        <>
          <div class="flex items-center justify-between">
            <p>{spell().title}</p>
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
                  <Show when={spell().info.level > 0}>
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
          <div class="flex gap-2 flex-wrap mt-1">
            <For each={spell().origin_values}>
              {(originValue) =>
                <span class="tag text-sm!">{originValue}</span>
              }
            </For>
          </div>
          <p class="mt-1 text-sm">{localize(TRANSLATION, locale()).traditions}: {spell().origin_value.map((item) => config.spellLists[item].name[locale()]).join(', ')}</p>
        </>
      }
    >
      <p
        class="feat-markdown"
        innerHTML={spell().description} // eslint-disable-line solid/no-innerhtml
      />
    </Toggle>
  );
}
