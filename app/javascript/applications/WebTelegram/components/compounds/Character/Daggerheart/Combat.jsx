import { For, Switch, Match, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Checkbox, Toggle, Button } from '../../../atoms';

import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall, Minus, Campfire, LongCampfire } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

export const DaggerheartCombat = (props) => {
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

  const spendEnergy = async (event, slug, limit) => {
    event.stopPropagation();

    let payload;
    const currentValue = character().energy[slug];

    if (currentValue === limit) return;
    if (currentValue) {
      payload = { ...character().energy, [slug]: currentValue + 1 };
    } else {
      payload = { ...character().energy, [slug]: 1 };
    }

    const result = await updateCharacterRequest(
      appState.accessToken, 'daggerheart', character().id, { character: { energy: payload }, only_head: true }
    );

    if (result.errors === undefined) props.onReplaceCharacter({ energy: payload });
    else renderAlerts(result.errors);
  }

  const restoreEnergy = async (event, slug) => {
    event.stopPropagation();

    let payload;
    const currentValue = character().energy[slug];

    if (currentValue === 0) return;
    if (currentValue) {
      payload = { ...character().energy, [slug]: currentValue - 1 };
    } else {
      payload = { ...character().energy, [slug]: 0 };
    }

    const result = await updateCharacterRequest(
      appState.accessToken, 'daggerheart', character().id, { character: { energy: payload }, only_head: true }
    );

    if (result.errors === undefined) props.onReplaceCharacter({ energy: payload });
    else renderAlerts(result.errors);
  }

  const renderFeatureTitle = (feature) => {
    if (feature.limit === undefined) return feature.title;

    return (
      <div class="flex items-center">
        <p class="flex-1">{feature.title}</p>
        <div class="flex items-center">
          <Button default size="small" onClick={(event) => character().energy[feature.slug] !== feature.limit ? spendEnergy(event, feature.slug, feature.limit) : event.stopPropagation()}>
            <Minus />
          </Button>
          <p class="flex items-center justify-center mx-2">
            <span class="w-6 text-center">{feature.limit - (character().energy[feature.slug] || 0)}</span>
            <Show
              when={feature.limit_refresh === 'short_rest'}
              fallback={<span title={t('character.longRest')}><LongCampfire /></span>}
            >
              <span title={t('character.shortRest')}><Campfire /></span>
            </Show>
          </p>
          <Button default size="small" onClick={(event) => (character().energy[feature.slug] || 0) > 0 ? restoreEnergy(event, feature.slug) : event.stopPropagation()}>
            <PlusSmall />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
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
            <p class="uppercase text-xs mb-1">{t('daggerheart.combat.armorSlots')}</p>
            <p class="text-2xl mb-1">{character().spent_armor_slots} / {character().armor_slots}</p>
          </div>
        </div>
      </div>
      <div class="white-box mb-2">
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
        <div class="px-4 mb-2">
          <p class="text-sm/4 font-cascadia-light uppercase mb-1">{t('daggerheart.combat.health')}</p>
          <div class="flex">
            <For each={Array.from([...Array(character().health.max).keys()], (x) => x + 1)}>
              {(index) =>
                <Checkbox
                  filled
                  checked={character().health.marked >= index}
                  classList="mr-1"
                  onToggle={() => updateAttribute('health', 'marked', index)}
                />
              }
            </For>
            <For each={Array.from([...Array(12 - character().health.max).keys()], (x) => x + character().health.max + 1)}>
              {(index) =>
                <Checkbox
                  outlined
                  classList="mr-1"
                  onToggle={() => updateAttribute('health', 'max', index)}
                />
              }
            </For>
          </div>
        </div>
        <div class="px-4 mb-2">
          <p class="text-sm/4 font-cascadia-light uppercase mb-1">{t('daggerheart.combat.stress')}</p>
          <div class="flex">
            <For each={Array.from([...Array(character().stress.max).keys()], (x) => x + 1)}>
              {(index) =>
                <Checkbox
                  filled
                  checked={character().stress.marked >= index}
                  classList="mr-1"
                  onToggle={() => updateAttribute('stress', 'marked', index)}
                />
              }
            </For>
            <For each={Array.from([...Array(12 - character().stress.max).keys()], (x) => x + character().stress.max + 1)}>
              {(index) =>
                <Checkbox
                  outlined
                  classList="mr-1"
                  onToggle={() => updateAttribute('stress', 'max', index)}
                />
              }
            </For>
          </div>
        </div>
        <div class="px-4 mb-4">
          <p class="text-sm/4 font-cascadia-light uppercase mb-1">{t('daggerheart.combat.hope')}</p>
          <div class="flex">
            <For each={Array.from([...Array(character().hope.max).keys()], (x) => x + 1)}>
              {(index) =>
                <Checkbox
                  filled
                  checked={character().hope.marked >= index}
                  classList="mr-1"
                  onToggle={() => updateAttribute('hope', 'marked', index)}
                />
              }
            </For>
          </div>
        </div>
      </div>

      <For each={character().features}>
        {(feature) =>
          <Toggle title={renderFeatureTitle(feature)}>
            <Switch>
              <Match when={feature.kind === 'static'}>
                <p
                  class="text-sm font-cascadia-light"
                  innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
                />
              </Match>
            </Switch>
          </Toggle>
        }
      </For>
    </>
  );
}
