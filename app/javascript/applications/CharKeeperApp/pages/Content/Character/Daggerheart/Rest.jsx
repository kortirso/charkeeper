import { createSignal, batch, For } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { Button, ErrorWrapper, Levelbox, Checkbox, GuideWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { fetchCharacterRequest } from '../../../../requests/fetchCharacterRequest';
import { createCharacterRestRequest } from '../../../../requests/createCharacterRestRequest';
import { replace } from '../../../../helpers';

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
  const [, dict] = useAppLocale();

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
      const characterData = await fetchCharacterRequest(
        appState.accessToken,
        character().id,
        { only: 'features,health_marked,stress_marked,spent_armor_slots,hope_marked' }
      );

      batch(() => {
        props.onReplaceCharacter(characterData.character);
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
          <p class="mb-4 dark:text-snow">{t('daggerheart.rest.restDescription')}</p>
          <For each={['clear_health', 'clear_stress', 'clear_armor_slots', 'gain_hope', 'gain_double_hope']}>
            {(item) =>
              <Levelbox
                number
                classList="mb-1"
                labelText={replace(t(`daggerheart.rest.${item}`), { tier: character().tier })}
                labelPosition="right"
                labelClassList="ml-2"
                value={restOptions[item]}
                onToggle={() => updateOption(item)}
              />
            }
          </For>
          <Checkbox
            classList="mb-4"
            labelText={t('daggerheart.rest.makeRolls')}
            labelPosition="right"
            labelClassList="ml-2"
            checked={makeRolls()}
            onToggle={() => setMakeRolls(!makeRolls())}
          />
          <div class="grid grid-cols-1 lg:grid-cols-3 lg:gap-4">
            <Button default textable classList="mb-2 lg:mb-0" onClick={() => restCharacter({ value: 'short' })}>
              {t('rest.shortRest')}
            </Button>
            <Button default textable classList="mb-2 lg:mb-0" onClick={() => restCharacter({ value: 'long' })}>
              {t('rest.longRest')}
            </Button>
            <Button default textable onClick={() => restCharacter({ value: 'session' })}>
              {t('rest.sessionRest')}
            </Button>
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
