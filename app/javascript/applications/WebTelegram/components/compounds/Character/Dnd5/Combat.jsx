import { createSignal, For, Show, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { createModal, StatsBlock } from '../../../molecules';
import { Input, Toggle, Checkbox, Select } from '../../../atoms';

import { useAppLocale } from '../../../../context';

import { modifier } from '../../../../../../helpers';

export const Dnd5Combat = (props) => {
  // changeable data
  const [damageConditions, setDamageConditions] = createSignal(props.initialConditions);
  const [selectedFeaturesData, setSelectedFeaturesData] = createSignal(props.initialSelectedFeatures);
  const [damageHealValue, setDamageHealValue] = createSignal(0);

  const { Modal, openModal, closeModal } = createModal();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  // actions
  const toggleDamageCondition = async (damageType, slug) => {
    const newValue = damageConditions();
    if (newValue[damageType].includes(slug)) {
      newValue[damageType] = newValue[damageType].filter((item) => item !== slug)
    } else {
      newValue[damageType] = newValue[damageType].concat(slug)
    }

    const result = await props.onRefreshCharacter(newValue);
    if (result.errors === undefined) setDamageConditions(newValue);
  }

  const toggleSelectedFeatureOption = async (feature, option) => {
    const selectedOptions = selectedFeaturesData()[feature.slug];

    let newData;
    if (selectedOptions) {
      if (selectedOptions.includes(option)) {
        newData = { ...selectedFeaturesData(), [feature.slug]: selectedOptions.filter((item) => item !== option) }
      } else {
        newData = { ...selectedFeaturesData(), [feature.slug]: selectedOptions.concat(option) }
      }
    } else {
      newData = { ...selectedFeaturesData(), [feature.slug]: [option] }
    }

    const result = await props.onRefreshCharacter({ selected_features: newData });
    if (result.errors === undefined) setSelectedFeaturesData(newData);
  }

  const setSelectedFeatureOption = async (feature, value) => {
    const newData = { ...selectedFeaturesData(), [feature.slug]: value }
    const result = await props.onRefreshCharacter({ selected_features: newData });
    if (result.errors === undefined) setSelectedFeaturesData(newData);
  }

  const setTextFeatureOption = (feature, value) => {
    setSelectedFeaturesData({ ...selectedFeaturesData(), [feature.slug]: value });
  }

  // submits
  const updateHealth = async () => {
    const result = await props.onRefreshCharacter({ health: props.healthData });

    if (result.errors === undefined) closeModal();
  }

  const updateTextFeature = async () => {
    await props.onRefreshCharacter({ selected_features: selectedFeaturesData() });
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

  const renderFeatureTitle = (feature) => {
    if (feature.limit === undefined) return feature.title;

    return (
      <div class="flex items-center">
        <p class="flex-1">{feature.title}</p>
        <div class="flex items-center">
          <button
            class="py-1 px-2 border border-gray-200 rounded flex justify-center items-center"
            onClick={(event) => props.energyData[feature.slug] !== feature.limit ? props.onSpendEnergy(event, feature.slug, feature.limit) : event.stopPropagation()}
          >-</button>
          <p class="w-12 text-center">{feature.limit - (props.energyData[feature.slug] || 0)} / {feature.limit}</p>
          <button
            class="py-1 px-2 border border-gray-200 rounded flex justify-center items-center"
            onClick={(event) => (props.energyData[feature.slug] || 0) > 0 ? props.onRestoreEnergy(event, feature.slug) : event.stopPropagation()}
          >+</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <StatsBlock
        items={[
          { title: t('terms.armorClass'), value: props.combat.armor_class },
          { title: t('terms.initiative'), value: modifier(props.combat.initiative) },
          { title: t('terms.speed'), value: props.combat.speed }
        ]}
      />
      <StatsBlock
        items={[
          { title: t('terms.health.current'), value: props.healthData.current },
          { title: t('terms.health.max'), value: props.healthData.max },
          { title: t('terms.health.temp'), value: props.healthData.temp }
        ]}
        onClick={openModal}
      >
        <div class="flex items-center pt-0 p-4">
          <button class="btn-primary flex-1" onClick={() => props.onDealDamage(damageHealValue())}>{t('character.damage')}</button>
          <Input
            numeric
            classList="w-20 mx-4"
            value={damageHealValue()}
            onInput={(value) => setDamageHealValue(Number(value))}
          />
          <button class="btn-primary flex-1" onClick={() => props.onMakeHeal(damageHealValue())}>{t('character.heal')}</button>
        </div>
        <div class="flex justify-end items-center pt-0 p-4">
          <button class="btn-primary btn-small text-sm mr-4" onClick={() => props.onRestCharacter({ type: 'short_rest' })}>{t('character.shortRest')}</button>
          <button class="btn-primary btn-small text-sm" onClick={() => props.onRestCharacter({ type: 'long_rest' })}>{t('character.longRest')}</button>
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
                  <td>{damage}</td>
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
      {renderAttacksBox(`${t('terms.attackAction')} - ${props.combat.attacks_per_action}`, props.attacks.filter((item) => item.action_type === 'action'))}
      {renderAttacksBox(`${t('terms.attackBonusAction')} - 1`, props.attacks.filter((item) => item.action_type === 'bonus action'))}
      <For each={props.features}>
        {(feature) =>
          <Toggle title={renderFeatureTitle(feature)}>
            <Switch>
              <Match when={feature.kind === 'static'}>
                <p
                  class="text-sm"
                  innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
                />
              </Match>
              <Match when={feature.kind === 'dynamic_list'}>
                <p
                  class="text-sm mb-2"
                  innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
                />
                <For each={feature.options}>
                  {(option) =>
                    <div class="mb-2">
                      <Checkbox
                        labelText={t(`selectedFeatures.${option}`)}
                        labelPosition="right"
                        labelClassList="text-sm ml-4"
                        checked={selectedFeaturesData()[feature.slug]?.includes(option)}
                        onToggle={() => toggleSelectedFeatureOption(feature, option)}
                      />
                    </div>
                  }
                </For>
              </Match>
              <Match when={feature.kind === 'static_list'}>
                <p
                  class="text-sm mb-2"
                  innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
                />
                <Select
                  classList="w-full mb-2"
                  items={feature.options.reduce((acc, option) => { acc[option] = t(`selectedFeatures.${option}`); return acc; }, {})}
                  selectedValue={selectedFeaturesData()[feature.slug]}
                  onSelect={(option) => setSelectedFeatureOption(feature, option)}
                />
              </Match>
              <Match when={feature.kind === 'choose_from' && feature.options_type === 'selected_skills'}>
                <p
                  class="text-sm mb-2"
                  innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
                />
                <For each={props.skills.filter((item) => item.selected).map((item) => item.name)}>
                  {(option) =>
                    <div class="mb-2">
                      <Checkbox
                        labelText={t(`skills.${option}`)}
                        labelPosition="right"
                        labelClassList="text-sm ml-4"
                        checked={selectedFeaturesData()[feature.slug]?.includes(option)}
                        onToggle={() => toggleSelectedFeatureOption(feature, option)}
                      />
                    </div>
                  }
                </For>
              </Match>
              <Match when={feature.kind === 'text'}>
                <p
                  class="text-sm mb-2"
                  innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
                />
                <textarea
                  rows="5"
                  class="w-full border border-gray-200 rounded p-1 text-sm"
                  onInput={(e) => setTextFeatureOption(feature, e.target.value)}
                  value={selectedFeaturesData()[feature.slug] || ''}
                />
                <div class="flex justify-end">
                  <button class="btn-primary mt-2" onClick={() => updateTextFeature(feature)}>
                    {t('save')}
                  </button>
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
                  classList="w-20 ml-8"
                  value={props.healthData[health]}
                  onInput={(value) => props.onSetHealthData({ ...props.healthData, [health]: Number(value) })}
                />
              </div>
            }
          </For>
          <button class="btn-primary" onClick={updateHealth}>{t('save')}</button>
        </div>
      </Modal>
    </>
  );
}
