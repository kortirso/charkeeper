import { For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Checkbox, ErrorWrapper, GuideWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

export const DaggerheartGold = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const updateAttribute = async (attribute, key, value) => {
    const currentValue = character()[attribute][key];
    const newValue = currentValue === value ? (value - 1) : value;

    const payload = { ...character()[attribute], [key]: newValue };

    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { [attribute]: payload }, only_head: true }
    );

    if (result.errors_list === undefined) props.onReplaceCharacter({ [attribute]: payload });
    else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartGold' }}>
      <GuideWrapper character={character()}>
        <div class="blockable mb-2 p-4">
          <For each={['coins', 'handfuls', 'bags', 'chests']}>
            {(item) =>
              <div class="mb-2">
                <p class="text-sm/4 uppercase mb-1 dark:text-snow">{t(`daggerheart.gold.${item}`)}</p>
                <div class="flex">
                  <For each={Array.from([...Array(10).keys()], (x) => x + 1)}>
                    {(index) =>
                      <Checkbox
                        filled
                        checked={character().gold[item] >= index}
                        classList="mr-1"
                        onToggle={() => updateAttribute('gold', item, index)}
                      />
                    }
                  </For>
                </div>
              </div>
            }
          </For>
          <p class="text-right dark:text-snow">
            {t('daggerheart.gold.total')} - {character().gold.chests * 1000 + character().gold.bags * 100 + character().gold.handfuls * 10 + character().gold.coins}
          </p>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
