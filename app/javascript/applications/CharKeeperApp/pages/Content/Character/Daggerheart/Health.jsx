import { For, Show } from 'solid-js';

import { Checkbox, ErrorWrapper, GuideWrapper, ResourceWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    armorSlots: 'Armor Slots',
    minor: 'Minor damage',
    major: 'Major damage',
    severe: 'Severe damage',
    minorDamage: 'Mark 1 H',
    majorDamage: 'Mark 2 H',
    severeDamage: 'Mark 3 H',
    health: 'Health',
    stress: 'Stress',
    hope: 'Hope'
  },
  ru: {
    armorSlots: 'Слоты Доспеха',
    minor: 'Малый урон',
    major: 'Ощутимый урон',
    severe: 'Тяжёлый урон',
    minorDamage: '1 рана',
    majorDamage: '2 раны',
    severeDamage: '3 раны',
    health: 'Раны',
    stress: 'Стресс',
    hope: 'Надежда'
  },
  es: {
    armorSlots: 'Ranuras de armadur',
    minor: 'Daño menor',
    major: 'Daño mayor',
    severe: 'Daño severo',
    minorDamage: 'Marca 1 P',
    majorDamage: 'Marca 2 P',
    severeDamage: 'Marca 3 P',
    health: 'Salud',
    stress: 'Estrés',
    hope: 'Esperanza'
  }
}

export const DaggerheartHealth = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

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
      <div class="mt-2">
        <p class="dh-attribute-title">{title}</p>
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
        <ResourceWrapper character={character()} onReplaceCharacter={props.onReplaceCharacter}>
          <div class="flex gap-4 mb-4">
            <div class="damage-caption">
              <p>{localize(TRANSLATION, locale()).minor}</p>
              <p>1-{character().damage_thresholds.major - 1}</p>
              <p>{localize(TRANSLATION, locale()).minorDamage}</p>
            </div>
            <div class="damage-caption">
              <p>{localize(TRANSLATION, locale()).major}</p>
              <p>{character().damage_thresholds.major}-{character().damage_thresholds.severe - 1}</p>
              <p>{localize(TRANSLATION, locale()).majorDamage}</p>
            </div>
            <div class="damage-caption">
              <p>{localize(TRANSLATION, locale()).severe}</p>
              <p>{character().damage_thresholds.severe}+</p>
              <p>{localize(TRANSLATION, locale()).severeDamage}</p>
            </div>
          </div>
          {renderAttribute(localize(TRANSLATION, locale()).armorSlots, character().armor_slots, 'spent_armor_slots')}
          {renderAttribute(localize(TRANSLATION, locale()).health, character().health_max, 'health_marked')}
          {renderAttribute(localize(TRANSLATION, locale()).stress, character().stress_max, 'stress_marked')}
          {renderAttribute(localize(TRANSLATION, locale()).hope, character().hope_max, 'hope_marked', character().scarred_hope)}
        </ResourceWrapper>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
