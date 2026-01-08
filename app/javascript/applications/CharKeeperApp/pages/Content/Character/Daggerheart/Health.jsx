import { For, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Checkbox, ErrorWrapper, GuideWrapper } from '../../../../components';
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

    if (result.errors_list === undefined) props.onReplaceCharacter({ [attribute]: newValue });
    else renderAlerts(result.errors_list);
  }

  const renderAttribute = (title, maxValue, slug, disabled=0) => (
    <Show when={maxValue !== 0} fallback={<></>}>
      <div class="px-4 mb-2">
        <p class="text-sm/4 uppercase mb-1 dark:text-snow">{title}</p>
        <div class="flex">
          <For each={Array.from([...Array(maxValue).keys()], (x) => x + 1)}>
            {(index) =>
              <Checkbox filled checked={character()[slug] >= index} classList="mr-1" onToggle={() => updateAttribute(slug, index)} />
            }
          </For>
          <Show when={disabled > 0}>
            <For each={Array.from([...Array(disabled).keys()])}>
              {() =>
                <Checkbox disabled checked={false} classList="mr-1" />
              }
            </For>
          </Show>
        </div>
      </div>
    </Show>
  );

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartHealth' }}>
      <GuideWrapper character={character()}>
        <div class="blockable pb-2">
          <div class="p-4 flex mb-2">
            <div class="damage-caption">
              <p>{t('daggerheart.health.minor')}</p>
              <p>{t('daggerheart.health.minorDamage')}</p>
            </div>
            <div class="damage-threshold">
              <p>{character().damage_thresholds.major}</p>
            </div>
            <div class="damage-caption">
              <p>{t('daggerheart.health.major')}</p>
              <p>{t('daggerheart.health.majorDamage')}</p>
            </div>
            <div class="damage-threshold">
              <p>{character().damage_thresholds.severe}</p>
            </div>
            <div class="damage-caption">
              <p>{t('daggerheart.health.severe')}</p>
              <p>{t('daggerheart.health.severeDamage')}</p>
            </div>
          </div>
          {renderAttribute(t('daggerheart.health.armorSlots'), character().armor_slots, 'spent_armor_slots')}
          {renderAttribute(t('daggerheart.health.health'), character().health_max, 'health_marked')}
          {renderAttribute(t('daggerheart.health.stress'), character().stress_max, 'stress_marked')}
          {renderAttribute(t('daggerheart.health.hope'), character().hope_max, 'hope_marked', character().scarred_hope)}
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
