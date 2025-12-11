import { createSignal, batch, For } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { Button, ErrorWrapper, Levelbox, Checkbox, GuideWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { createCharacterRestRequest } from '../../../../requests/createCharacterRestRequest';
import { replace } from '../../../../helpers';

const TRANSLATION = {
  en: {
    short: 'Short rest',
    long: 'Long rest',
    session: 'Session rest',
    description: "At rest player can move domain cards between its loadout and vault for free, then choose twice from the list of downtime moves.",
    makeRolls: 'Make auto rolls',
    clear_health: 'Clear 1d4+{{tier}} or all Hit Points for yourself',
    clear_stress: 'Clear 1d4+{{tier}} or all Stress',
    clear_armor_slots: 'Clear 1d4+{{tier}} or all Armor Slots from your armor',
    gain_hope: 'Gain a Hope',
    gain_double_hope: 'Gain 2 Hope'
  },
  ru: {
    short: 'Короткий отдых',
    long: 'Длинный отдых',
    session: 'Между сессиями',
    description: 'Во время отдыха игрок может свободно перемещать карты домена между инвентарём и хранилищем, затем дважды выбрать из списка ходов отдыха.',
    makeRolls: 'Автоматические броски',
    clear_health: 'Очистить 1d4+{{tier}} или все ХП для себя',
    clear_stress: 'Очистить 1d4+{{tier}} или все стресса',
    clear_armor_slots: 'Очистить 1d4+{{tier}} или все слотов доспеха для себя',
    gain_hope: 'Получить Надежду',
    gain_double_hope: 'Получить 2 Надежды'
  }
}

export const DaggerheartRest = (props) => {
  const character = () => props.character;

  const [makeRolls, setMakeRolls] = createSignal(false);
  const [restOptions, setRestOptions] = createStore({
    clear_health: 0,
    clear_stress: 0,
    clear_armor_slots: 0,
    gain_hope: 0,
    gain_double_hope: 0
  });

  const [appState] = useAppState();
  const [{ renderNotice, renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const updateOption = (value) => {
    const newValue = restOptions[value] === 2 ? 0 : (restOptions[value] + 1);
    setRestOptions({ ...restOptions, [value]: newValue });
  }

  const restCharacter = async (payload) => {
    const result = await createCharacterRestRequest(
      appState.accessToken,
      character().provider,
      character().id,
      { ...payload, options: restOptions, make_rolls: makeRolls() }
    );
    if (result.errors_list === undefined) {
      batch(() => {
        props.onReloadCharacter();
        setRestOptions({ clear_health: 0, clear_stress: 0, clear_armor_slots: 0, gain_hope: 0, gain_double_hope: 0 });
        setMakeRolls(false);
        renderNotice(t('alerts.restIsFinished'));
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartRest' }}>
      <GuideWrapper character={character()}>
        <div class="blockable p-4">
          <p class="mb-4 dark:text-snow">{TRANSLATION[locale()].description}</p>
          <For each={['clear_health', 'clear_stress', 'clear_armor_slots', 'gain_hope', 'gain_double_hope']}>
            {(item) =>
              <Levelbox
                number
                classList="mb-1"
                labelText={replace(TRANSLATION[locale()][item], { tier: character().tier })}
                labelPosition="right"
                labelClassList="ml-2"
                value={restOptions[item]}
                onToggle={() => updateOption(item)}
              />
            }
          </For>
          <Checkbox
            classList="mb-4"
            labelText={TRANSLATION[locale()].makeRolls}
            labelPosition="right"
            labelClassList="ml-2"
            checked={makeRolls()}
            onToggle={() => setMakeRolls(!makeRolls())}
          />
          <div class="grid grid-cols-1 lg:grid-cols-3 lg:gap-4">
            <Button default textable classList="mb-2 lg:mb-0" onClick={() => restCharacter({ value: 'short' })}>
              {TRANSLATION[locale()].short}
            </Button>
            <Button default textable classList="mb-2 lg:mb-0" onClick={() => restCharacter({ value: 'long' })}>
              {TRANSLATION[locale()].long}
            </Button>
            <Button default textable onClick={() => restCharacter({ value: 'session' })}>
              {TRANSLATION[locale()].session}
            </Button>
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
