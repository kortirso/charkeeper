import { createSignal, createEffect, Show, batch } from 'solid-js';

import { Pathfinder2SpellBook } from '../../../../pages';
import { StatsBlock, ErrorWrapper, Button, GuideWrapper, Dice } from '../../../../components';
import { useAppState, useAppLocale } from '../../../../context';
import { fetchSpellsRequest } from '../../../../requests/fetchSpellsRequest';
import { modifier, localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    spellAttack: 'Spell attack',
    saveDC: 'Save DC',
    back: 'Back',
    check: 'Spell attack',
    gotoSpellBook: 'Spellbook management'
  },
  ru: {
    spellAttack: 'Бонус атаки',
    saveDC: 'Спасброски',
    back: 'Назад',
    check: 'Атака заклинанием',
    gotoSpellBook: 'Spellbook management'
  }
}

export const Pathfinder2Spells = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);

  const [spells, setSpells] = createSignal(undefined);

  const [spellsSelectingMode, setSpellsSelectingMode] = createSignal(false);

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    const fetchSpells = async () => await fetchSpellsRequest(
      appState.accessToken,
      character().provider,
      { max_level: character().spells_info.max_spell_level }
    );

    Promise.all([fetchSpells()]).then(
      ([spellsData]) => {
        setSpells(spellsData.spells);
      }
    );

    batch(() => {
      setLastActiveCharacterId(character().id);
      setSpellsSelectingMode(false);
    });
  });

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Pathfinder2Spells' }}>
      <GuideWrapper character={character()}>
        <Show when={spells()}>
          <Show
            when={!spellsSelectingMode()}
            fallback={<Pathfinder2SpellBook character={character()} spells={spells()} />}
          >
            <StatsBlock
              items={[
                {
                  title: localize(TRANSLATION, locale()).spellAttack,
                  value:
                    <Dice
                      width="36"
                      height="36"
                      text={modifier(character().spell_attack)}
                      onClick={() => props.openDiceRoll('/check attack spell', character().spell_attack, localize(TRANSLATION, locale()).check)}
                    />
                },
                { title: localize(TRANSLATION, locale()).saveDC, value: character().spell_dc }
              ]}
            />
            <Button default textable classList="mb-2" onClick={() => setSpellsSelectingMode(true)}>
              {localize(TRANSLATION, locale()).gotoSpellBook}
            </Button>
          </Show>
        </Show>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
