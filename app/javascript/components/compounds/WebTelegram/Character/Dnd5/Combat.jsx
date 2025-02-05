import { createSignal, For, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { createModal, StatsBlock } from '../../../../molecules';
import { Input, Toggle, Checkbox } from '../../../../atoms';

import { useAppLocale } from '../../../../../context';
import { modifier } from '../../../../../helpers';

export const Dnd5Combat = (props) => {
  // changeable data
  const [healthData, setHealthData] = createSignal(props.initialHealth);
  const [energyData, setEnergyData] = createSignal(props.initialEnergy);
  const [damageConditions, setDamageConditions] = createSignal(props.initialConditions);
  const [damageHealValue, setDamageHealValue] = createSignal(0);

  const { Modal, openModal, closeModal } = createModal();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  // actions
  const spendEnergy = async (event, slug, limit) => {
    event.stopPropagation();

    let newValue;
    if (energyData()[slug] && energyData()[slug] < limit) {
      newValue = { ...energyData(), [slug]: energyData()[slug] + 1 };
    } else {
      newValue = { ...energyData(), [slug]: 1 };
    }

    const result = await props.onRefreshCharacter({ energy: newValue });
    if (result.errors === undefined) setEnergyData(newValue);
  }

  const restoreEnergy = async (event, slug) => {
    event.stopPropagation();

    let newValue;
    if (energyData()[slug] && energyData()[slug] > 0) {
      newValue = { ...energyData(), [slug]: energyData()[slug] - 1 };
    } else {
      newValue = { ...energyData(), [slug]: 0 };
    }

    const result = await props.onRefreshCharacter({ energy: newValue });
    if (result.errors === undefined) setEnergyData(newValue);
  }

  const makeHeal = async () => {
    const missingHealth = healthData().max - healthData().current;

    let newValue;
    if (damageHealValue() >= missingHealth) newValue = { ...healthData(), current: healthData().max }
    else newValue = { ...healthData(), current: healthData().current + damageHealValue() }

    const result = await props.onRefreshCharacter({ health: newValue });
    if (result.errors === undefined) {
      batch(() => {
        setDamageHealValue(0);
        setHealthData(newValue);
      })
    }
  }

  const dealDamage = async () => {
    const damageToTempHealth = damageHealValue() >= healthData().temp ? healthData().temp : damageHealValue();
    const damageToHealth = damageHealValue() - damageToTempHealth;

    let newValue = { ...healthData(), current: healthData().current - damageToHealth, temp: healthData().temp - damageToTempHealth }
    const result = await props.onRefreshCharacter({ health: newValue });
    if (result.errors === undefined) {
      batch(() => {
        setDamageHealValue(0);
        setHealthData(newValue);
      })
    }
  }

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

  // submits
  const updateHealth = async () => {
    const result = await props.onRefreshCharacter({ health: healthData() });

    if (result.errors === undefined) closeModal();
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

  const renderClassFeatureTitle = (classFeature) => {
    if (classFeature.limit === undefined) return classFeature.title;

    return (
      <div class="flex items-center">
        <p class="flex-1">{classFeature.title}</p>
        <div class="flex items-center">
          <button
            class="py-1 px-2 border border-gray-200 rounded flex justify-center items-center"
            onClick={(event) => energyData()[classFeature.slug] !== classFeature.limit ? spendEnergy(event, classFeature.slug, classFeature.limit) : event.stopPropagation()}
          >-</button>
          <p class="w-12 text-center">{classFeature.limit - (energyData()[classFeature.slug] || 0)} / {classFeature.limit}</p>
          <button
            class="py-1 px-2 border border-gray-200 rounded flex justify-center items-center"
            onClick={(event) => (energyData()[classFeature.slug] || 0) > 0 ? restoreEnergy(event, classFeature.slug) : event.stopPropagation()}
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
          { title: t('terms.health.current'), value: healthData().current },
          { title: t('terms.health.max'), value: healthData().max },
          { title: t('terms.health.temp'), value: healthData().temp }
        ]}
        onClick={openModal}
      >
        <div class="flex items-center pt-2 p-4">
          <button class="btn-primary flex-1" onClick={dealDamage}>{t('character.damage')}</button>
          <Input
            numeric
            classList="w-20 mx-4"
            value={damageHealValue()}
            onInput={(value) => setDamageHealValue(Number(value))}
          />
          <button class="btn-primary flex-1" onClick={makeHeal}>{t('character.heal')}</button>
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
      <For each={props.classFeatures}>
        {(classFeature) =>
          <Toggle title={renderClassFeatureTitle(classFeature)}>
            <p
              class="text-sm"
              innerHTML={classFeature.description} // eslint-disable-line solid/no-innerhtml
            />
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
                  value={healthData()[health]}
                  onInput={(value) => setHealthData({ ...healthData(), [health]: Number(value) })}
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
