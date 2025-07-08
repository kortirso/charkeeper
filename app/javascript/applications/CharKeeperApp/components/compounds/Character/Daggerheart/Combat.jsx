import { createSignal, For, Switch, Match, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Checkbox, Toggle, Button } from '../../../atoms';
import { ErrorWrapper } from '../../../molecules';

import { FeatureTitle } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { updateCharacterFeatRequest } from '../../../../requests/updateCharacterFeatRequest';

import { modifier } from '../../../../helpers';

export const DaggerheartCombat = (props) => {
  const character = () => props.character;

  const [textFeaturesData, setTextFeaturesData] = createSignal(
    character().features.filter((item) => item.kind === 'text').reduce((acc, item) => { acc[item.slug] = character().selected_features[item.slug]; return acc; }, {})
  );

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const updateAttribute = async (attribute, value) => {
    const currentValue = character()[attribute];
    const newValue = currentValue === value ? (value - 1) : value;

    const result = await updateCharacterRequest(
      appState.accessToken, 'daggerheart', character().id, { character: { [attribute]: newValue }, only_head: true }
    );

    if (result.errors === undefined) props.onReplaceCharacter({ [attribute]: newValue });
    else renderAlerts(result.errors);
  }

  const spendEnergy = async (event, feature) => {
    event.stopPropagation();

    const result = await updateCharacterFeatRequest(
      appState.accessToken,
      character().provider,
      character().id,
      feature.id,
      { character_feat: { used_count: feature.used_count + 1 }, only_head: true }
    );

    const newFeatures = character().features.slice().map((element) => {
      if (element.id !== feature.id) return element;
      return { ...element, used_count: feature.used_count + 1 }
    });

    if (result.errors === undefined) props.onReplaceCharacter({ features: newFeatures });
    else renderAlerts(result.errors);
  }

  const restoreEnergy = async (event, feature) => {
    event.stopPropagation();

    const result = await updateCharacterFeatRequest(
      appState.accessToken,
      character().provider,
      character().id,
      feature.id,
      { character_feat: { used_count: feature.used_count - 1 }, only_head: true }
    );

    const newFeatures = character().features.slice().map((element) => {
      if (element.id !== feature.id) return element;
      return { ...element, used_count: feature.used_count - 1 }
    });

    if (result.errors === undefined) props.onReplaceCharacter({ features: newFeatures });
    else renderAlerts(result.errors);
  }

  const updateTextFeature = async (slug) => {
    const payload = { ...character().selected_features, [slug]: textFeaturesData()[slug] }

    const result = await updateCharacterRequest(
      appState.accessToken, 'daggerheart', character().id, { character: { selected_features: payload }, only: 'selected_features' }
    );

    if (result.errors === undefined) props.onReplaceCharacter({ selected_features: payload });
    else renderAlerts(result.errors);
  }

  const renderAttacksBox = (title, values) => {
    if (values.length === 0) return <></>;

    return (
      <div class="p-4 white-box mb-2">
        <h2 class="text-lg mb-2">{title}</h2>
        <table class="w-full table first-column-full-width">
          <thead>
            <tr>
              <td />
              <td class="text-center">{t('attacks.bonus')}</td>
              <td class="text-center">{t('attacks.damage')}</td>
              <td class="text-center">{t('attacks.distance')}</td>
            </tr>
          </thead>
          <tbody>
            <For each={values}>
              {(attack) =>
                <tr>
                  <td class="py-1">
                    <p class="font-cascadia-light">{attack.name}</p>
                    <Show when={attack.features.length > 0}>
                      <p class="text-xs font-cascadia-light">
                        {attack.features.join(', ')}
                      </p>
                    </Show>
                    <Show when={attack.notes}>
                      <p class="text-xs font-cascadia-light">{attack.notes}</p>
                    </Show>
                  </td>
                  <td class="py-1 text-center">{modifier(attack.attack_bonus)}</td>
                  <td class="py-1 text-center">
                    <p>{attack.damage}{attack.damage_bonus > 0 ? modifier(attack.damage_bonus) : ''}</p>
                    <p class="text-xs">{attack.damage_type}</p>
                  </td>
                  <td class="py-1 text-center">
                    <p>{attack.range}</p>
                  </td>
                </tr>
              }
            </For>
          </tbody>
        </table>
      </div>
    );
  }

  const renderAttribute = (title, maxValue, slug) => (
    <Show when={maxValue !== 0} fallback={<></>}>
      <div class="px-4 mb-2">
        <p class="text-sm/4 font-cascadia-light uppercase mb-1">{title}</p>
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
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartCombat' }}>
      <div class="white-box mb-2">
        <div class="p-4 flex">
          <div class="flex-1 flex flex-col items-center">
            <p class="uppercase text-xs mb-1">{t('daggerheart.combat.evasion')}</p>
            <p class="text-2xl mb-1">{character().evasion}</p>
          </div>
          <div class="flex-1 flex flex-col items-center">
            <p class="uppercase text-xs mb-1">{t('daggerheart.combat.armorScore')}</p>
            <p class="text-2xl mb-1">{character().armor_score}</p>
          </div>
          <div class="flex-1 flex flex-col items-center">
            <p class="uppercase text-xs mb-1">{t('daggerheart.combat.proficiency')}</p>
            <p class="text-2xl mb-1">{character().proficiency}</p>
          </div>
        </div>
      </div>
      <div class="white-box mb-2 pb-2">
        <div class="p-4 flex mb-2">
          <div class="flex-1 flex flex-col items-center">
            <p class="uppercase text-xs mb-1">{t('daggerheart.combat.minor')}</p>
            <p class="text-2xl mb-1">{character().damage_thresholds.minor}</p>
            <p class="font-cascadia-light text-xs mb-1">{t('daggerheart.combat.minorDamage')}</p>
          </div>
          <div class="flex-1 flex flex-col items-center">
            <p class="uppercase text-xs mb-1">{t('daggerheart.combat.major')}</p>
            <p class="text-2xl mb-1">{character().damage_thresholds.major}</p>
            <p class="font-cascadia-light text-xs mb-1">{t('daggerheart.combat.majorDamage')}</p>
          </div>
          <div class="flex-1 flex flex-col items-center">
            <p class="uppercase text-xs mb-1">{t('daggerheart.combat.severe')}</p>
            <p class="text-2xl mb-1">{character().damage_thresholds.severe}</p>
            <p class="font-cascadia-light text-xs mb-1">{t('daggerheart.combat.severeDamage')}</p>
          </div>
        </div>
        {renderAttribute(t('daggerheart.combat.armorSlots'), character().armor_slots, 'spent_armor_slots')}
        {renderAttribute(t('daggerheart.combat.health'), character().health_max, 'health_marked')}
        {renderAttribute(t('daggerheart.combat.stress'), character().stress_max, 'stress_marked')}
        {renderAttribute(t('daggerheart.combat.hope'), character().hope_max, 'hope_marked')}
      </div>
      {renderAttacksBox(t('character.equipment'), character().attacks.filter((item) => item.ready_to_use))}
      {renderAttacksBox(t('character.backpack'), character().attacks.filter((item) => !item.ready_to_use))}
      <For each={character().features}>
        {(feature) =>
          <Toggle title={<FeatureTitle feature={feature} onSpendEnergy={spendEnergy} onRestoreEnergy={restoreEnergy} />}>
            <Switch>
              <Match when={feature.kind === 'static'}>
                <p
                  class="text-sm font-cascadia-light"
                  innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
                />
              </Match>
              <Match when={feature.kind === 'text'}>
                <p
                  class="text-sm font-cascadia-light mb-2"
                  innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
                />
                <textarea
                  rows="5"
                  class="w-full border border-gray-200 rounded p-1 text-sm"
                  onInput={(e) => setTextFeaturesData({ ...textFeaturesData(), [feature.slug]: e.target.value })}
                  value={textFeaturesData()[feature.slug] || ''}
                />
                <div class="flex justify-end mt-2">
                  <Button default textable size="small" onClick={() => updateTextFeature(feature.slug)}>{t('save')}</Button>
                </div>
              </Match>
            </Switch>
          </Toggle>
        }
      </For>
    </ErrorWrapper>
  );
}
