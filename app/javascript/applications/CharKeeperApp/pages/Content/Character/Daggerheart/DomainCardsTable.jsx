import { createMemo, For, Show, Switch, Match } from 'solid-js';

import { Button } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { Close, Arrow } from '../../../../assets';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    spell: 'Spell',
    ability: 'Ability',
    grimoire: 'Grimoire',
    level: 'Level'
  },
  ru: {
    spell: 'Заклинание',
    ability: 'Способность',
    grimoire: 'Гримуар',
    level: 'Уровень'
  }
}

export const DomainCardsTable = (props) => {
  const spells = () => props.spells;

  const [locale] = useAppLocale();

  const cardsByDomains = createMemo(() => {
    if (props.countCards === undefined) return undefined;

    const domains = spells().reduce((acc, item) => {
      acc[item.origin_value] ? acc[item.origin_value] += 1 : acc[item.origin_value] = 1
      return acc;
    }, {});
    return Object.entries(domains).sort((a, b) => b[1] - a[1]);
  });

  return (
    <div class="blockable p-4 mb-2 dark:text-snow">
      <div class="flex justify-between">
        <div>
          <h2 class="text-lg">{props.title}</h2>
          <Show when={props.subtitle}>
            <p class="text-sm">{props.subtitle}</p>
          </Show>
        </div>
        <Show when={cardsByDomains() !== undefined}>
          <div>
            <For each={cardsByDomains()}>
              {(item) =>
                <p class="text-sm">{props.domains[item[0]].name[locale()]} - {item[1]}</p>
              }
            </For>
          </div>
        </Show>
      </div>
      <Show when={spells().length > 0}>
        <div class="mt-4">
          <For each={spells()}>
            {(spell) =>
              <div class="even:bg-stone-100 dark:even:bg-dark-dusty p-1">
                <div class="cursor-pointer mb-2" onClick={() => props.onChangeSpell(spell)}>
                  <p class="font-normal! text-lg">{spell.title}</p>
                  <Show when={spell.info.type}>
                    <p class="text-sm">
                      {props.domains[spell.origin_value].name[locale()]} ({spell.level} {localize(TRANSLATION, locale()).level}), {localize(TRANSLATION, locale())[spell.info.type]}
                    </p>
                  </Show>
                </div>
                <p
                  class="feat-markdown text-xs mb-1"
                  innerHTML={spell.description} // eslint-disable-line solid/no-innerhtml
                />
                <Show when={spell.notes}>
                  <p class="text-sm mb-1">{spell.notes}</p>
                </Show>
                <div class="flex flex-row items-center justify-end gap-y-4 gap-x-2">
                  <Switch>
                    <Match when={spell.ready_to_use}>
                      <Button default size="small" onClick={() => props.onUpdateCharacterSpell(spell, { character_spell: { ready_to_use: false } })}>
                        <Arrow bottom width={16} height={16} />
                      </Button>
                    </Match>
                    <Match when={!spell.ready_to_use}>
                      <Button default size="small" classList="px-1" onClick={() => props.onUpdateCharacterSpell(spell, { character_spell: { ready_to_use: true } })}>
                        <div class="flex items-center">
                          <Show when={spell.info.recall !== undefined}>
                            <p class="px-1 text-center font-normal! text-lg">
                              {spell.info.recall}
                            </p>
                          </Show>
                          <Arrow top width={16} height={16} />
                        </div>
                      </Button>
                    </Match>
                  </Switch>
                  <Button default size="small" classList="py-0.5" onClick={() => props.onRemoveCharacterSpell(spell)}>
                    <Close />
                  </Button>
                </div>
              </div>
            }
          </For>
        </div>
      </Show>
    </div>
  );
}
