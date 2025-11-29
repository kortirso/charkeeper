import { For, Show, Switch, Match } from 'solid-js';

import { Button } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { Close, Arrow } from '../../../../assets';

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

  return (
    <div class="blockable p-4 mb-2 dark:text-snow">
      <h2 class="text-lg">{props.title}</h2>
      <Show when={props.subtitle}>
        <p class="text-sm">{props.subtitle}</p>
      </Show>
      <Show when={spells().length > 0}>
        <div>
          <For each={spells()}>
            {(spell) =>
              <div class="even:bg-stone-100 dark:even:bg-dark-dusty p-1">
                <div class="flex items-center justify-between cursor-pointer mb-2" onClick={() => props.onChangeSpell(spell)}>
                  <p class="font-normal!">{spell.title}</p>
                  <Show when={spell.info.type}>
                    {TRANSLATION[locale()][spell.info.type]} ({spell.level} {TRANSLATION[locale()].level})
                  </Show>
                </div>
                <p
                  class="feat-markdown text-xs mb-1"
                  innerHTML={spell.description} // eslint-disable-line solid/no-innerhtml
                />
                <Show when={spell.notes}>
                  <p class="text-sm mb-1">{spell.notes}</p>
                </Show>
                <div class="flex flex-col flex-col-reverse md:flex-row items-center justify-end gap-y-4 gap-x-2">
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
