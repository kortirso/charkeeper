import { For, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Checkbox, ErrorWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

export const DaggerheartHealth = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const updateAttribute = async (attribute, value) => {
    const newValue = character()[attribute] === value ? (value - 1) : value;

    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { [attribute]: newValue }, only_head: true }
    );

    if (result.errors === undefined) props.onReplaceCharacter({ [attribute]: newValue });
    else renderAlerts(result.errors);
  }

  const renderAttribute = (title, maxValue, slug) => (
    <Show when={maxValue !== 0} fallback={<></>}>
      <div class="px-4 mb-2">
        <p class="text-sm/4 uppercase mb-1 dark:text-snow">{title}</p>
        <div class="flex">
          <For each={Array.from([...Array(maxValue).keys()], (x) => x + 1)}>
            {(index) =>
              <Checkbox
                filled
                checked={character()[slug] >= index}
                classList="mr-1"
                onToggle={() => updateAttribute(slug, index)}
              />
            }
          </For>
        </div>
      </div>
    </Show>
  );

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartHealth' }}>
      <div class="blockable pb-2">
        <div class="p-4 flex mb-2">
          <div class="flex-1 flex flex-col items-center">
            <p class="uppercase text-sm elg:text-[10px] mb-1 dark:text-snow">{t('daggerheart.health.minor')}</p>
            <p class="font-cascadia text-2xl mb-1 dark:text-snow">{character().damage_thresholds.minor}</p>
            <p class="text-xs mb-1 dark:text-snow">{t('daggerheart.health.minorDamage')}</p>
          </div>
          <div class="flex-1 flex flex-col items-center">
            <p class="uppercase text-sm elg:text-[10px] mb-1 dark:text-snow">{t('daggerheart.health.major')}</p>
            <p class="font-cascadia text-2xl mb-1 dark:text-snow">{character().damage_thresholds.major}</p>
            <p class="text-xs mb-1 dark:text-snow">{t('daggerheart.health.majorDamage')}</p>
          </div>
          <div class="flex-1 flex flex-col items-center">
            <p class="uppercase text-sm elg:text-[10px] mb-1 dark:text-snow">{t('daggerheart.health.severe')}</p>
            <p class="font-cascadia text-2xl mb-1 dark:text-snow">{character().damage_thresholds.severe}</p>
            <p class="text-xs mb-1 dark:text-snow">{t('daggerheart.health.severeDamage')}</p>
          </div>
        </div>
        {renderAttribute(t('daggerheart.health.armorSlots'), character().armor_slots, 'spent_armor_slots')}
        {renderAttribute(t('daggerheart.health.health'), character().health_max, 'health_marked')}
        {renderAttribute(t('daggerheart.health.stress'), character().stress_max, 'stress_marked')}
        {renderAttribute(t('daggerheart.health.hope'), character().hope_max, 'hope_marked')}
      </div>
    </ErrorWrapper>
  );
}
