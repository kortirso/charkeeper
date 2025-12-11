import { createSignal, batch, For } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { ErrorWrapper, Button, Levelbox, Checkbox, GuideWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { createCharacterRestRequest } from '../../../../requests/createCharacterRestRequest';

const TRANSLATION = {
  en: {
    short: 'Short rest',
    long: 'Long rest',
    shortDesc: "At the end of a short rest, a character may spend one or more Hit Dice. Each die spent allows the character to roll the corresponding die, add the character's Constitution modifier to it, and regain the resulting number of hit points.",
    longDesc: 'At the end of a long rest, the character regains all expended hit points, plus half of the maximum Hit Dice and all expended spell slots.',
    makeRolls: 'Make auto rolls'
  },
  ru: {
    short: 'Короткий отдых',
    long: 'Длинный отдых',
    shortDesc: 'В конце короткого отдыха персонаж может потратить одну или несколько Костей Хитов. Каждая потраченная кость позволяет совершить бросок соответствующей кости, добавить к ней модификатор Телосложения и восстановить получившееся количество хитов.',
    longDesc: 'В конце продолжительного отдыха персонаж восстанавливает все потраченные хиты, а также половину от максимума Костей Хитов и все потраченные ячейки заклинаний.',
    makeRolls: 'Автоматические броски'
  }
}

export const Dnd5Rest = (props) => {
  const character = () => props.character;

  const [makeRolls, setMakeRolls] = createSignal(false);
  const [restOptions, setRestOptions] = createStore({ d6: 0, d8: 0, d10: 0, d12: 0 });

  const [appState] = useAppState();
  const [{ renderNotice, renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

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
      batch(() => {
        props.onReloadCharacter();
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
          <p class="mb-4 dark:text-snow">{TRANSLATION[locale()].shortDesc}</p>
          <For each={Object.entries(character().hit_dice).filter(([, value]) => value > 0)}>
            {([dice, maxValue]) =>
              <Levelbox
                number
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
            labelText={TRANSLATION[locale()].makeRolls}
            labelPosition="right"
            labelClassList="ml-2"
            checked={makeRolls()}
            onToggle={() => setMakeRolls(!makeRolls())}
          />
          <p class="mb-4 dark:text-snow">{TRANSLATION[locale()].longDesc}</p>
          <div class="flex justify-center items-center">
            <Button default textable classList="flex-1 mr-2" onClick={() => restCharacter({ value: 'short_rest' })}>
              <span>{TRANSLATION[locale()].short}</span>
            </Button>
            <Button default textable classList="flex-1 ml-2" onClick={() => restCharacter({ value: 'long_rest' })}>
              <span>{TRANSLATION[locale()].long}</span>
            </Button>
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
