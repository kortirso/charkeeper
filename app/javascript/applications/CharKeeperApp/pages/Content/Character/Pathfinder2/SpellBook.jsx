import { createMemo, For } from 'solid-js';

import { Pathfinder2Spell } from '../../../../pages';
import { StatsBlock, Button } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { localize, performResponse } from '../../../../helpers';
import { createCharacterSpellRequest } from '../../../../requests/createCharacterSpellRequest';
import { removeCharacterSpellRequest } from '../../../../requests/removeCharacterSpellRequest';

const TRANSLATION = {
  en: {
    cantripsAmount: 'Cantrips amount',
    spellsAmount: 'Spells amount',
    spellIsLearned: 'Spell is learned',
    back: 'Back to preparing spells'
  },
  ru: {
    cantripsAmount: 'Лимит фокусов',
    spellsAmount: 'Лимит заклинаний',
    spellIsLearned: 'Заклинание выучено',
    back: 'К подготовке заклинаний'
  }
}

export const Pathfinder2SpellBook = (props) => {
  const spells = () => props.spells;
  const character = () => props.character;

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();

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
      <div class="flex flex-col gap-2">
        <For each={spells()}>
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
