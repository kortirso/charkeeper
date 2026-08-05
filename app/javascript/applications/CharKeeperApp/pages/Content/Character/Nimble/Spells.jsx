import { createSignal, createEffect, createMemo, For, Show } from 'solid-js';

import config from '../../../../data/nimble.json';
import { ErrorWrapper, GuideWrapper, Toggle, Dice } from '../../../../components';
import { useAppLocale } from '../../../../context';
// import { fetchSpellsRequest } from '../../../../requests/fetchSpellsRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    level: 'Level',
    time: 'Time',
    target: 'Target',
    targets: {
      self: 'Self',
      single: 'Single'
    }
  },
  ru: {
    level: 'Уровень',
    time: 'Время',
    target: 'Цели',
    targets: {
      self: 'На себя',
      single: 'Одиночная'
    }
  }
}

export const NimbleSpells = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  // const [spells, setSpells] = createSignal(undefined);

  // const [appState] = useAppState();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    // const fetchSpells = async () => await fetchSpellsRequest(appState.accessToken, character().provider);

    // Promise.all([fetchSpells()]).then(
    //   ([spellsData]) => {
    //     batch(() => {
    //       setSpells(spellsData.spells.sort((a, b) => a.info.level > b.info.level));
    //     });
    //   }
    // );

    setLastActiveCharacterId(character().id);
  });

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const renderingLists = createMemo(() => {
    if (!character().schools) return [];

    return Object.entries(config.schools).filter(([slug,]) => character().schools.includes(slug));
  });

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'NimbleSpells' }}>
      <GuideWrapper character={character()}>
        <Show
          when={false}
          fallback={
            <>
              <For each={renderingLists()}>
                {([slug, values]) =>
                  <Toggle title={localize(values.name, locale())}>
                    <div>
                      <For each={character().spells.filter((spell) => spell.origin_value === slug)}>
                        {(spell) =>
                          <div class="dc20-spell p-2! flex flex-col gap-1">
                            <div class="dc20-spell-title">
                              <div class="flex gap-4">
                                <Show when={spell.damage}>
                                  <Dice
                                    width="28"
                                    height="28"
                                    text={`${spell.damage}${spell.damage_bonus && spell.damage_bonus > 0 ? '+' : ''}${!spell.damage_bonus || spell.damage_bonus === 0 ? '' : spell.damage_bonus}`}
                                    onClick={() => props.openNimbleAttack('/nimbleAttack', spell.title, spell.damage, spell.damage_bonus, null, true)}
                                  />
                                </Show>
                                <p class="font-normal! text-lg">{spell.title}</p>
                              </div>
                              <p>{i18n().level} {spell.info.level}</p>
                            </div>
                            <Show when={spell.info.time}>
                              <p class="text-sm!"><span class="font-normal!">{i18n().time}</span>: {spell.info.time.split(',').join('')}</p>
                            </Show>
                            <Show when={spell.info.target}>
                              <p class="text-sm!"><span class="font-normal!">{i18n().target}</span>: {i18n().targets[spell.info.target]}</p>
                            </Show>
                            <p
                              class="feat-markdown text-sm!"
                              innerHTML={spell.description} // eslint-disable-line solid/no-innerhtml
                            />
                          </div>
                        }
                      </For>
                    </div>
                  </Toggle>
                }
              </For>
            </>
          }
        >
          <></>
        </Show>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
