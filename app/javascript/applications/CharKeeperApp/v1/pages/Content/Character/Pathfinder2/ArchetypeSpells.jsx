import { createSignal, createMemo, For, Show } from 'solid-js';

import { Pathfinder2Spells } from '../../../../pages';
import config from '../../../../data/pathfinder2.json';
import { useAppLocale } from '../../../../context';
import { localize } from '../../../../helpers';

export const Pathfinder2ArchetypeSpells = (props) => {
  const character = () => props.character;

  const [activeTab, setActiveTab] = createSignal(null);

  const [locale] = useAppLocale();

  const archetypeKeys = createMemo(() => Object.keys(character().archetype_spells));

  return (
    <>
      <Show when={archetypeKeys().length > 0}>
        <div class="flex gap-2 flex-wrap mb-2">
          <p class="archetype-key" classList={{ 'active': activeTab() === null }} onClick={() => setActiveTab(null)}>
            {localize(config.classes[character().main_class].name, locale())}
          </p>
          <For each={archetypeKeys()}>
            {(key) =>
              <p class="archetype-key" classList={{ 'active': activeTab() === key }} onClick={() => setActiveTab(key)}>
                {localize(config.classes[key].name, locale())}
              </p>
            }
          </For>
        </div>
      </Show>
      <Pathfinder2Spells
        character={character()}
        spellsInfo={activeTab() === null ? character().spells_info : character().archetype_spells[activeTab()]}
        spentFocusSlots={character().spent_spell_slots?.focus || 0}
        spentSpellSlots={
          activeTab() === null ? character().spent_spell_slots : (character().spent_archetype_spell_slots[activeTab()] || {})
        }
        preparedBy={activeTab()}
        openD20Test={props.openD20Test}
        onReplaceCharacter={props.onReplaceCharacter}
      />
    </>
  );
}
