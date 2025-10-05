import { createSignal, createMemo, Show } from 'solid-js';

import { Select, ErrorWrapper } from '../../../../components';
import config from '../../../../data/daggerheart.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

const TRANSLATION = {
  en: {
    noStance: 'No stance',
    stances: 'Stances',
    selectedStances: 'Available stances',
    activeStance: 'Active stance'
  },
  ru: {
    noStance: 'Без стойки',
    stances: 'Боевые стойки',
    selectedStances: 'Доступные стойки',
    activeStance: 'Активная стойка'
  }
}

export const DaggerheartStances = (props) => {
  const character = () => props.character;

  const [selectedStances, setSelectedStances] = createSignal(character().selected_stances);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const availableStances = createMemo(() => {
    const result = Object.entries(config.stances).filter(([, values]) => values.tier <= character().tier).map(([key, values]) => [key, values.name[locale()]])
    return Object.fromEntries(result);
  })

  const stancesSelect = createMemo(() => {
    const result = Object.entries(config.stances).filter(([key,]) => selectedStances().includes(key)).map(([key, values]) => [key, values.name[locale()]]);
    return Object.fromEntries([['null', TRANSLATION[locale()]['noStance']]].concat(result));
  });

  const updateMultiFeatureValue = (value) => {
    const currentValues = character().selected_stances;
    const newValue = currentValues.includes(value) ? currentValues.filter((item) => item !== value) : currentValues.concat([value]);

    updateCharacter({ selected_stances: newValue }, true);
    setSelectedStances(newValue);
  }

  const updateCharacter = async (payload, onlyHead=false) => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload, only_head: onlyHead }
    );

    if (!onlyHead) {
      if (result.errors_list === undefined) {
        props.onReplaceCharacter(result.character);
      } else renderAlerts(result.errors_list);
    }
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartStances' }}>
      <Show when={character().can_have_stances}>
        <div class="blockable p-4">
          <h2 class="text-lg mb-2 dark:text-snow">{TRANSLATION[locale()]['stances']}</h2>
          <Select
            multi
            containerClassList="w-full"
            labelText={TRANSLATION[locale()]['selectedStances']}
            items={availableStances()}
            selectedValues={selectedStances()}
            onSelect={(value) => updateMultiFeatureValue(value)}
          />
          <Select
            containerClassList="mt-2 w-full"
            labelText={TRANSLATION[locale()]['activeStance']}
            items={stancesSelect()}
            selectedValue={character().stance}
            onSelect={(value) => updateCharacter({ stance: value === 'null' ? null : value })}
          />
          <Show when={character().stance}>
            <p class="mt-2 dark:text-snow">{config.stances[character().stance].feature[locale()]}</p>
          </Show>
        </div>
      </Show>
    </ErrorWrapper>
  );
}
