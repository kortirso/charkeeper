import { For, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Checkbox, ErrorWrapper } from '../../../../components';
import config from '../../../../data/pathfinder2.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

import { modifier } from '../../../../helpers';

export const Pathfinder2SavingThrows = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const updateAttribute = async (attribute, value) => {
    const newValue = character()[attribute] === value ? (value - 1) : value;

    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { [attribute]: newValue }, only_head: true }
    );

    if (result.errors === undefined) props.onReplaceCharacter({ [attribute]: newValue });
    else renderAlerts(result.errors);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Pathfinder2SavingThrows' }}>
      <div class="blockable p-4 flex">
        <For each={Object.entries(config.savingThrows)}>
          {([slug, savingName]) =>
            <div class="flex-1 flex flex-col items-center">
              <p class="uppercase text-sm elg:text-[10px] mb-1 dark:text-snow">
                {savingName.name[locale()]}
              </p>
              <p class="font-cascadia text-2xl dark:text-snow">
                {modifier(character().saving_throws_value[slug])}
              </p>
            </div>
          }
        </For>
      </div>
    </ErrorWrapper>
  );
}
