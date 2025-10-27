import { createSignal, createMemo, Show } from 'solid-js';

import { Select, ErrorWrapper, GuideWrapper } from '../../../../components';
import config from '../../../../data/dnd2024.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

const TRANSLATION = {
  en: {
    noShape: 'Natural form',
    beastforms: 'Wild shapes',
    selectedBeastforms: 'Available beastforms',
    activeBeastform: 'Active beastform'
  },
  ru: {
    noShape: 'Естественная форма',
    beastforms: 'Дикие формы',
    selectedBeastforms: 'Доступные дикие формы',
    activeBeastform: 'Активная дикая форма'
  }
}

export const Dnd2024WildShapes = (props) => {
  const character = () => props.character;

  const [selectedBeastforms, setSelectedBeastforms] = createSignal(character().selected_beastforms);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const availableBeastforms = createMemo(() => {
    const result = Object.entries(config.beastforms).map(([key, values]) => [key, values.name[locale()]]);
    return Object.fromEntries(result);
  })

  const beastformsSelect = createMemo(() => {
    const result = Object.entries(config.beastforms).filter(([key,]) => selectedBeastforms().includes(key)).map(([key, values]) => [key, values.name[locale()]]);
    return Object.fromEntries([['null', TRANSLATION[locale()]['noShape']]].concat(result));
  });

  const updateMultiFeatureValue = (value) => {
    const currentValues = character().selected_beastforms;
    const newValue = currentValues.includes(value) ? currentValues.filter((item) => item !== value) : currentValues.concat([value]);

    updateCharacter({ selected_beastforms: newValue }, true);
    setSelectedBeastforms(newValue);
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
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd2024Beastforms' }}>
      <GuideWrapper character={character()}>
        <Show when={Object.keys(character().classes).includes('druid')}>
          <div class="blockable p-4">
            <h2 class="text-lg mb-2 dark:text-snow">{TRANSLATION[locale()]['beastforms']}</h2>
            <Select
              multi
              containerClassList="w-full"
              labelText={TRANSLATION[locale()]['selectedBeastforms']}
              items={availableBeastforms()}
              selectedValues={selectedBeastforms()}
              onSelect={(value) => updateMultiFeatureValue(value)}
            />
            <Select
              containerClassList="mt-2 w-full"
              labelText={TRANSLATION[locale()]['activeBeastform']}
              items={beastformsSelect()}
              selectedValue={character().beastform}
              onSelect={(value) => updateCharacter({ beastform: value === 'null' ? null : value })}
            />
          </div>
        </Show>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
