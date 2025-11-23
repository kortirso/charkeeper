import { createSignal, batch, For } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { ErrorWrapper, Button, Levelbox, Checkbox, GuideWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { fetchCharacterRequest } from '../../../../requests/fetchCharacterRequest';
import { createCharacterRestRequest } from '../../../../requests/createCharacterRestRequest';

export const Dnd5Rest = (props) => {
  const character = () => props.character;

  const [makeRolls, setMakeRolls] = createSignal(false);
  const [restOptions, setRestOptions] = createStore({ d6: 0, d8: 0, d10: 0, d12: 0 });

  const [appState] = useAppState();
  const [{ renderNotice, renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const updateOption = (dice, maxValue) => {
    const canSpendAmount = character().spent_hit_dice[dice] ? (maxValue - character().spent_hit_dice[dice]) : maxValue;

    const newValue = restOptions[`d${dice}`] === canSpendAmount ? 0 : (restOptions[`d${dice}`] + 1);
    setRestOptions({ ...restOptions, [`d${dice}`]: newValue });
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
        { only: 'health,spent_spell_slots,spent_hit_dice,features' }
      );

      batch(() => {
        props.onReplaceCharacter(characterData.character);
        setRestOptions({ d6: 0, d8: 0, d10: 0, d12: 0 });
        setMakeRolls(false);
        renderNotice(t('alerts.restIsFinished'));
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd5Rest' }}>
      <GuideWrapper character={character()}>
        <div class="blockable p-4">
          <p class="mb-4 dark:text-snow">{t('dndV2.rest.shortRestDescription')}</p>
          <For each={Object.entries(character().hit_dice).filter(([, value]) => value > 0)}>
            {([dice, maxValue]) =>
              <Levelbox
                classList="mb-1"
                labelText={`d${dice}`}
                labelPosition="right"
                labelClassList="ml-2"
                value={restOptions[`d${dice}`]}
                onToggle={() => updateOption(dice, maxValue)}
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
          <p class="mb-4 dark:text-snow">{t('dndV2.rest.longRestDescription')}</p>
          <div class="flex justify-center items-center">
            <Button default textable classList="flex-1 mr-2" onClick={() => restCharacter({ value: 'short_rest' })}>
              <span>{t('rest.shortRest')}</span>
            </Button>
            <Button default textable classList="flex-1 ml-2" onClick={() => restCharacter({ value: 'long_rest' })}>
              <span>{t('rest.longRest')}</span>
            </Button>
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
