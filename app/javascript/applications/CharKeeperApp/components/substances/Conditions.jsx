import { createSignal, createEffect, createMemo, Show, batch, For } from 'solid-js';

import { Select, ErrorWrapper, GuideWrapper } from '../../components';
import daggerheartConfig from '../../data/daggerheart.json';
import dndConfig from '../../data/dnd2024.json';
import pathfinder2Config from '../../data/pathfinder2.json';
import dc20Config from '../../data/dc20.json';
import { useAppState, useAppLocale } from '../../context';
import { updateCharacterRequest } from '../../requests/updateCharacterRequest';
import { translate } from '../../helpers';

const TRANSLATION = {
  en: {
    conditions: 'Conditions',
    selectedStances: 'Active conditions',
  },
  ru: {
    conditions: 'Состояния',
    selectedStances: 'Активные состояния',
  }
}

export const Conditions = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [selectedConditions, setSelectedConditions] = createSignal([]);

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setSelectedConditions(character().conditions);
      setLastActiveCharacterId(character().id);
    });
  });

  const providerConfig = createMemo(() => {
    if (character().provider === 'daggerheart') return daggerheartConfig;
    if (character().provider === 'dnd5' || character().provider === 'dnd2024') return dndConfig;
    if (character().provider === 'pathfinder2') return pathfinder2Config;
    if (character().provider === 'dc20') return dc20Config;
  });

  const updateMultiFeatureValue = async (value) => {
    const newValue = selectedConditions().includes(value) ? selectedConditions().filter((item) => item !== value) : selectedConditions().concat([value]);

    await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { conditions: newValue }, only_head: true }
    )
    setSelectedConditions(newValue);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Conditions' }}>
      <GuideWrapper character={character()}>
        <div class="blockable p-4">
          <h2 class="text-lg mb-2 dark:text-snow">{TRANSLATION[locale()]['conditions']}</h2>
          <Select
            multi
            containerClassList="w-full"
            labelText={TRANSLATION[locale()]['selectedConditions']}
            items={translate(providerConfig().conditions, locale())}
            selectedValues={selectedConditions()}
            onSelect={(value) => updateMultiFeatureValue(value)}
          />
          <Show when={selectedConditions().length > 0}>
            <For each={selectedConditions()}>
              {(condition) =>
                <p class="mt-2 dark:text-snow text-sm">{providerConfig().conditions[condition].description[locale()]}</p>
              }
            </For>
          </Show>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
