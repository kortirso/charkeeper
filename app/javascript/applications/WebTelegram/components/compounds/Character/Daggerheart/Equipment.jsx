import { For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Checkbox } from '../../../atoms';

import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

export const DaggerheartEquipment = (props) => {
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
      appState.accessToken, 'daggerheart', character().id, { character: { [attribute]: payload }, only_head: true }
    );

    if (result.errors === undefined) props.onReplaceCharacter({ [attribute]: payload });
    else renderAlerts(result.errors);
  }

  return (
    <>
      <div class="white-box mb-2 p-4">
        <div class="mb-2">
          <p class="text-sm/4 font-cascadia-light uppercase mb-1">{t('daggerheart.gold.coins')}</p>
          <div class="flex">
            <For each={Array.from([...Array(10).keys()], (x) => x + 1)}>
              {(index) =>
                <Checkbox
                  filled
                  checked={character().gold.coins >= index}
                  classList="mr-1"
                  onToggle={() => updateAttribute('gold', 'coins', index)}
                />
              }
            </For>
          </div>
        </div>
        <div class="mb-2">
          <p class="text-sm/4 font-cascadia-light uppercase mb-1">{t('daggerheart.gold.handfuls')}</p>
          <div class="flex">
            <For each={Array.from([...Array(10).keys()], (x) => x + 1)}>
              {(index) =>
                <Checkbox
                  filled
                  checked={character().gold.handfuls >= index}
                  classList="mr-1"
                  onToggle={() => updateAttribute('gold', 'handfuls', index)}
                />
              }
            </For>
          </div>
        </div>
        <div class="mb-2">
          <p class="text-sm/4 font-cascadia-light uppercase mb-1">{t('daggerheart.gold.bags')}</p>
          <div class="flex">
            <For each={Array.from([...Array(10).keys()], (x) => x + 1)}>
              {(index) =>
                <Checkbox
                  filled
                  checked={character().gold.bags >= index}
                  classList="mr-1"
                  onToggle={() => updateAttribute('gold', 'bags', index)}
                />
              }
            </For>
          </div>
        </div>
        <div class="mb-4">
          <p class="text-sm/4 font-cascadia-light uppercase mb-1">{t('daggerheart.gold.chests')}</p>
          <div class="flex">
            <For each={Array.from([...Array(10).keys()], (x) => x + 1)}>
              {(index) =>
                <Checkbox
                  filled
                  checked={character().gold.chests >= index}
                  classList="mr-1"
                  onToggle={() => updateAttribute('gold', 'chests', index)}
                />
              }
            </For>
          </div>
        </div>
        <p class="text-right">
          {t('daggerheart.gold.total')} - {character().gold.chests * 1000 + character().gold.bags * 100 + character().gold.handfuls * 10 + character().gold.coins}
        </p>
      </div>
    </>
  );
}
