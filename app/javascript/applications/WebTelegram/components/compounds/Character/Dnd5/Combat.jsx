import { createSignal, For, Show, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { createModal, StatsBlock } from '../../../molecules';
import { Input, Toggle, Checkbox, Select, Button } from '../../../atoms';

import { useAppLocale } from '../../../../context';
import { PlusSmall, Minus } from '../../../../assets';

import { modifier } from '../../../../../../helpers';

export const Dnd5Combat = (props) => {
  // changeable data
  const [damageConditions, setDamageConditions] = createSignal(props.initialConditions);
  const [damageHealValue, setDamageHealValue] = createSignal(0);
  const [onceSelectedFeaturesData, setOnceSelectedFeaturesData] = createSignal({});
  const [textFeaturesData, setTextFeaturesData] = createSignal(
    props.features.filter((item) => item.kind === 'text').reduce((acc, item) => { acc[item.slug] = props.selectedFeatures[item.slug]; return acc; }, {}) // eslint-disable-line solid/reactivity
  );

  const { Modal, openModal, closeModal } = createModal();
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
    const selectedOptions = props.selectedFeatures[feature.slug];

    let newData;
    if (selectedOptions) {
      if (selectedOptions.includes(option)) {
        newData = { ...props.selectedFeatures, [feature.slug]: selectedOptions.filter((item) => item !== option) }
      } else {
        newData = { ...props.selectedFeatures, [feature.slug]: selectedOptions.concat(option) }
      }
    } else {
      newData = { ...props.selectedFeatures, [feature.slug]: [option] }
    }

    await props.onReloadCharacter({ selected_features: newData });
  }

  const setSelectedFeatureOption = async (feature, value) => {
    const newData = { ...props.selectedFeatures, [feature.slug]: value }
    await props.onReloadCharacter({ selected_features: newData });
  }

  // submits
  const updateHealth = async () => {
    const result = await props.onRefreshCharacter({ health: props.healthData });

    if (result.errors === undefined) closeModal();
  }

  const updateTextFeature = async (slug) => {
    const newData = { ...props.selectedFeatures, [slug]: textFeaturesData()[slug] }
    await props.onRefreshCharacter({ selected_features: newData });
  }

  const confirmOnceSelectedFeaturesData = async (slug) => {
    const newData = { ...props.selectedFeatures, [slug]: onceSelectedFeaturesData()[slug] }
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

  const renderFeatureTitle = (feature) => {
    if (feature.limit === undefined) return feature.title;

    return (
      <div class="flex items-center">
        <p class="flex-1">{feature.title}</p>
        <div class="flex items-center">
          <Button default size="small" onClick={(event) => props.energyData[feature.slug] !== feature.limit ? props.onSpendEnergy(event, feature.slug, feature.limit) : event.stopPropagation()}>
            <Minus />
          </Button>
          <p class="w-12 mx-2 text-center">
            {feature.limit - (props.energyData[feature.slug] || 0)} / {feature.limit}
          </p>
          <Button default size="small" onClick={(event) => (props.energyData[feature.slug] || 0) > 0 ? props.onRestoreEnergy(event, feature.slug) : event.stopPropagation()}>
            <PlusSmall />
          </Button>
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
          <Button default textable classList="flex-1" onClick={() => props.onDealDamage(damageHealValue())}>
            {t('character.damage')}
          </Button>
          <Input
            numeric
            containerClassList="w-20 mx-4"
            value={damageHealValue()}
            onInput={(value) => setDamageHealValue(Number(value))}
          />
          <Button default textable classList="flex-1" onClick={() => props.onMakeHeal(damageHealValue())}>
            {t('character.heal')}
          </Button>
        </div>
        <div class="pt-0 p-4">
          <p class="mb-2">{t('character.deathSavingThrows')}</p>
          <div class="flex mb-2">
            <p class="font-cascadia-light w-20">{t('character.deathSuccess')}</p>
            <div class="flex">
              <For each={[...Array((props.deathSavingThrows.success || 0))]}>
                {() =>
                  <Checkbox
                    checked
                    classList="mr-1"
                    onToggle={() => props.onFreeDeath('success')}
                  />
                }
              </For>
              <For each={[...Array(3 - (props.deathSavingThrows.success || 0))]}>
                {() =>
                  <Checkbox
                    classList="mr-1"
                    onToggle={() => props.onGainDeath('success')}
                  />
                }
              </For>
            </div>
          </div>
          <div class="flex">
            <p class="font-cascadia-light w-20">{t('character.deathFailure')}</p>
            <div class="flex">
              <For each={[...Array((props.deathSavingThrows.failure || 0))]}>
                {() =>
                  <Checkbox
                    checked
                    classList="mr-1"
                    onToggle={() => props.onFreeDeath('failure')}
                  />
                }
              </For>
              <For each={[...Array(3 - (props.deathSavingThrows.failure || 0))]}>
                {() =>
                  <Checkbox
                    classList="mr-1"
                    onToggle={() => props.onGainDeath('failure')}
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
                        labelText={t(`dnd.selectedFeatures.${option}`)}
                        labelPosition="right"
                        labelClassList="text-sm ml-4"
                        checked={props.selectedFeatures[feature.slug]?.includes(option)}
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
                <Switch>
                  <Match when={feature.choose_once && !props.selectedFeatures[feature.slug]}>
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
                  <Match when={feature.choose_once && props.selectedFeatures[feature.slug]}>
                    <p>{t(`dnd.selectedFeatures.${props.selectedFeatures[feature.slug]}`)}</p>
                  </Match>
                  <Match when={!feature.choose_once}>
                    <Select
                      containerClassList="w-full mb-2"
                      items={feature.options.reduce((acc, option) => { acc[option] = t(`dnd.selectedFeatures.${option}`); return acc; }, {})}
                      selectedValue={props.selectedFeatures[feature.slug]}
                      onSelect={(option) => setSelectedFeatureOption(feature, option)}
                    />
                  </Match>
                </Switch>
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
                        labelText={t(`dnd.skills.${option}`)}
                        labelPosition="right"
                        labelClassList="text-sm ml-4"
                        checked={props.selectedFeatures[feature.slug]?.includes(option)}
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
                  value={props.healthData[health]}
                  onInput={(value) => props.onSetHealthData({ ...props.healthData, [health]: Number(value) })}
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
