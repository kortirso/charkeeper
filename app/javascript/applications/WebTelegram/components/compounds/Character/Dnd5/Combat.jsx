import { createSignal, For, Show, Switch, Match, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { createModal, StatsBlock } from '../../../molecules';
import { Input, Toggle, Checkbox, Select, Button } from '../../../atoms';

import { FeatureTitle } from '../../../../components';
import { useAppState, useAppLocale } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { createCharacterHealthRequest } from '../../../../requests/createCharacterHealthRequest';

import { modifier } from '../../../../../../helpers';

export const Dnd5Combat = (props) => {
  const character = () => props.character;

  // changeable data
  const [damageConditions, setDamageConditions] = createSignal(character().conditions);
  const [damageHealValue, setDamageHealValue] = createSignal(0);
  const [healthData, setHealthData] = createSignal(character().health);

  const [onceSelectedFeaturesData, setOnceSelectedFeaturesData] = createSignal({});
  const [textFeaturesData, setTextFeaturesData] = createSignal(
    character().features.filter((item) => item.kind === 'text').reduce((acc, item) => { acc[item.slug] = character().selected_features[item.slug]; return acc; }, {})
  );

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  // actions
  const toggleDamageCondition = async (damageType, slug) => {
    const newValue = { ...damageConditions() };
    if (newValue[damageType].includes(slug)) {
      newValue[damageType] = newValue[damageType].filter((item) => item !== slug)
    } else {
      newValue[damageType] = newValue[damageType].concat(slug)
    }

    const result = await props.onRefreshCharacter(newValue);
    if (result.errors === undefined) setDamageConditions(newValue);
  }

  const toggleSelectedFeatureOption = async (feature, option) => {
    const selectedOptions = character().selected_features[feature.slug];

    let newData;
    if (selectedOptions) {
      if (selectedOptions.includes(option)) {
        newData = { ...character().selected_features, [feature.slug]: selectedOptions.filter((item) => item !== option) }
      } else {
        newData = { ...character().selected_features, [feature.slug]: selectedOptions.concat(option) }
      }
    } else {
      newData = { ...character().selected_features, [feature.slug]: [option] }
    }

    await props.onReloadCharacter({ selected_features: newData });
  }

  const setSelectedFeatureOption = async (feature, value) => {
    const newData = { ...character().selected_features, [feature.slug]: value }
    await props.onReloadCharacter({ selected_features: newData });
  }

  // submits
  const gainDeath = async (type) => {
    let newValue;
    if (character().death_saving_throws[type]) {
      newValue = { ...character().death_saving_throws, [type]: character().death_saving_throws[type] + 1 };
    } else {
      newValue = { ...character().death_saving_throws, [type]: 1 };
    }

    const payload = { death_saving_throws: newValue };
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload, only_head: true }
    );

    if (result.errors === undefined) props.onReplaceCharacter(payload);
  }

  const freeDeath = async (type) => {
    const newValue = { ...character().death_saving_throws, [type]: character().death_saving_throws[type] - 1 };
    const payload = { death_saving_throws: newValue };
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload, only_head: true }
    );

    if (result.errors === undefined) props.onReplaceCharacter(payload);
  }

  const changeHealth = async (coefficient) => {
    const result = await createCharacterHealthRequest(
      appState.accessToken,
      'dnd5',
      character().id,
      { value: damageHealValue() * coefficient, only: 'health,death_saving_throws' }
    );

    if (result.errors === undefined) {
      props.onReplaceCharacter({
        health: result.character.health,
        death_saving_throws: result.character.death_saving_throws
      });
    }
  }

  const updateHealth = async () => {
    const payload = { health: healthData() };

    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload, only_head: true }
    );

    if (result.errors === undefined) {
      batch(() => {
        props.onReplaceCharacter(payload);
        closeModal();
      });
    }
  }

  const updateTextFeature = async (slug) => {
    const newData = { ...character().selected_features, [slug]: textFeaturesData()[slug] }
    await props.onRefreshCharacter({ selected_features: newData });
  }

  const confirmOnceSelectedFeaturesData = async (slug) => {
    const newData = { ...character().selected_features, [slug]: onceSelectedFeaturesData()[slug] }
    await props.onReloadCharacter({ selected_features: newData });
  }

  // rendering
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
                    <p>{attack.name}</p>
                    <Show when={attack.tooltips.length > 0}>
                      <p class="text-xs">
                        {attack.tooltips.map((item) => t(`attack.tooltips.${item}`)).join(', ')}
                      </p>
                    </Show>
                    <Show when={attack.notes}>
                      <p class="text-xs">{attack.notes}</p>
                    </Show>
                  </td>
                  <td class="py-1 text-center">{modifier(attack.attack_bonus)}</td>
                  <td class="py-1 text-center">
                    <p>{attack.damage}{attack.damage_bonus > 0 ? modifier(attack.damage_bonus) : ''}</p>
                    <p class="text-xs">{t(`weaponDamageType.${attack.damage_type}`)}</p>
                  </td>
                  <td class="py-1 text-center">
                    <Show when={attack.melee_distance}><p>{attack.melee_distance}</p></Show>
                    <Show when={attack.range_distance}><p>{attack.range_distance}</p></Show>
                  </td>
                </tr>
              }
            </For>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <StatsBlock
        items={[
          { title: t('terms.armorClass'), value: character().armor_class },
          { title: t('terms.initiative'), value: modifier(character().initiative) },
          { title: t('terms.speed'), value: character().speed }
        ]}
      />
      <StatsBlock
        items={[
          { title: t('terms.health.current'), value: character().health.current },
          { title: t('terms.health.max'), value: character().health.max },
          { title: t('terms.health.temp'), value: character().health.temp }
        ]}
        onClick={openModal}
      >
        <div class="flex items-center pt-0 p-4">
          <Button default textable classList="flex-1" onClick={() => changeHealth(-1)}>
            {t('character.damage')}
          </Button>
          <Input
            numeric
            containerClassList="w-20 mx-4"
            value={damageHealValue()}
            onInput={(value) => setDamageHealValue(Number(value))}
          />
          <Button default textable classList="flex-1" onClick={() => changeHealth(1)}>
            {t('character.heal')}
          </Button>
        </div>
        <div class="pt-0 p-4">
          <p class="mb-2">{t('character.deathSavingThrows')}</p>
          <div class="flex mb-2">
            <p class="font-cascadia-light w-20">{t('character.deathSuccess')}</p>
            <div class="flex">
              <For each={[...Array((character().death_saving_throws.success || 0))]}>
                {() =>
                  <Checkbox
                    checked
                    classList="mr-1"
                    onToggle={() => freeDeath('success')}
                  />
                }
              </For>
              <For each={[...Array(3 - (character().death_saving_throws.success || 0))]}>
                {() =>
                  <Checkbox
                    classList="mr-1"
                    onToggle={() => gainDeath('success')}
                  />
                }
              </For>
            </div>
          </div>
          <div class="flex">
            <p class="font-cascadia-light w-20">{t('character.deathFailure')}</p>
            <div class="flex">
              <For each={[...Array((character().death_saving_throws.failure || 0))]}>
                {() =>
                  <Checkbox
                    checked
                    classList="mr-1"
                    onToggle={() => freeDeath('failure')}
                  />
                }
              </For>
              <For each={[...Array(3 - (character().death_saving_throws.failure || 0))]}>
                {() =>
                  <Checkbox
                    classList="mr-1"
                    onToggle={() => gainDeath('failure')}
                  />
                }
              </For>
            </div>
          </div>
        </div>
      </StatsBlock>
      <Toggle title={t('character.damageConditions')}>
        <table class="table w-full first-column-full-width">
          <thead>
            <tr>
              <td />
              <td class="text-sm uppercase px-1">{t('character.vulnerability')}</td>
              <td class="text-sm uppercase px-1">{t('character.resistance')}</td>
              <td class="text-sm uppercase px-1">{t('character.immunity')}</td>
            </tr>
          </thead>
          <tbody>
            <For each={Object.entries(dict().damage)}>
              {([slug, damage]) =>
                <tr>
                  <td class="font-cascadia-light">{damage}</td>
                  <td>
                    <Checkbox
                      checked={damageConditions().vulnerability.includes(slug)}
                      onToggle={() => toggleDamageCondition('vulnerability', slug)}
                    />
                  </td>
                  <td>
                    <Checkbox
                      checked={damageConditions().resistance.includes(slug)}
                      onToggle={() => toggleDamageCondition('resistance', slug)}
                    />
                  </td>
                  <td>
                    <Checkbox
                      checked={damageConditions().immunity.includes(slug)}
                      onToggle={() => toggleDamageCondition('immunity', slug)}
                    />
                  </td>
                </tr>
              }
            </For>
          </tbody>
        </table>
      </Toggle>
      {renderAttacksBox(`${t('terms.attackAction')} - ${character().attacks_per_action}`, character().attacks.filter((item) => item.action_type === 'action'))}
      {renderAttacksBox(`${t('terms.attackBonusAction')} - 1`, character().attacks.filter((item) => item.action_type === 'bonus action'))}
      <For each={character().features}>
        {(feature) =>
          <Toggle title={<FeatureTitle feature={feature} character={character()} onSpendEnergy={props.onSpendEnergy} onRestoreEnergy={props.onRestoreEnergy} />}>
            <Switch>
              <Match when={feature.kind === 'static'}>
                <p
                  class="text-sm font-cascadia-light"
                  innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
                />
              </Match>
              <Match when={feature.kind === 'dynamic_list'}>
                <p
                  class="text-sm font-cascadia-light mb-2"
                  innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
                />
                <For each={feature.options}>
                  {(option) =>
                    <div class="mb-2">
                      <Checkbox
                        labelText={t(`dnd.selectedFeatures.${option}`)}
                        labelPosition="right"
                        labelClassList="text-sm ml-4"
                        checked={character().selected_features[feature.slug]?.includes(option)}
                        onToggle={() => toggleSelectedFeatureOption(feature, option)}
                      />
                    </div>
                  }
                </For>
              </Match>
              <Match when={feature.kind === 'static_list'}>
                <p
                  class="text-sm font-cascadia-light mb-2"
                  innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
                />
                <Switch>
                  <Match when={feature.choose_once && !character().selected_features[feature.slug]}>
                    <Select
                      containerClassList="w-full mb-2"
                      items={feature.options.reduce((acc, option) => { acc[option] = t(`dnd.${feature.options_type || 'selectedFeatures'}.${option}`); return acc; }, {})}
                      selectedValue={onceSelectedFeaturesData()[feature.slug]}
                      onSelect={(option) => setOnceSelectedFeaturesData({ ...onceSelectedFeaturesData(), [feature.slug]: option })}
                    />
                    <Button default size="small" onClick={() => confirmOnceSelectedFeaturesData(feature.slug)}>
                      {t('character.confirmChooseOnceFeature')}
                    </Button>
                  </Match>
                  <Match when={feature.choose_once && character().selected_features[feature.slug]}>
                    <p>{t(`dnd.selectedFeatures.${character().selected_features[feature.slug]}`)}</p>
                  </Match>
                  <Match when={!feature.choose_once}>
                    <Select
                      containerClassList="w-full mb-2"
                      items={feature.options.reduce((acc, option) => { acc[option] = t(`dnd.selectedFeatures.${option}`); return acc; }, {})}
                      selectedValue={character().selected_features[feature.slug]}
                      onSelect={(option) => setSelectedFeatureOption(feature, option)}
                    />
                  </Match>
                </Switch>
              </Match>
              <Match when={feature.kind === 'choose_from' && feature.options_type === 'selected_skills'}>
                <p
                  class="text-sm font-cascadia-light mb-2"
                  innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
                />
                <For each={character().skills.filter((item) => item.selected).map((item) => item.name)}>
                  {(option) =>
                    <div class="mb-2">
                      <Checkbox
                        labelText={t(`dnd.skills.${option}`)}
                        labelPosition="right"
                        labelClassList="text-sm ml-4"
                        checked={character().selected_features[feature.slug]?.includes(option)}
                        onToggle={() => toggleSelectedFeatureOption(feature, option)}
                      />
                    </div>
                  }
                </For>
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
      <Modal>
        <div class="white-box p-4 flex flex-col">
          <For each={['max', 'temp']}>
            {(health) =>
              <div class="mb-4 flex items-center">
                <p class="flex-1 text-sm text-left">{t(`terms.health.${health}`)}</p>
                <Input
                  numeric
                  containerClassList="w-20 ml-8"
                  value={healthData()[health]}
                  onInput={(value) => setHealthData({ ...healthData(), [health]: Number(value) })}
                />
              </div>
            }
          </For>
          <Button default textable onClick={updateHealth}>{t('save')}</Button>
        </div>
      </Modal>
    </>
  );
}
