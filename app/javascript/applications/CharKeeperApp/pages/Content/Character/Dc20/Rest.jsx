import { createSignal, batch, Show } from 'solid-js';

import { Button, ErrorWrapper, GuideWrapper, Select } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { createCharacterRestRequest } from '../../../../requests/createCharacterRestRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    values: {
      combat: 'After Combat',
      quick: 'Quick',
      short: 'Short',
      half_long: 'Half Long',
      complete_long: 'Complete Long',
      full: 'Full'
    },
    valueLabel: 'Select type of rest',
    pointsLabel: 'Spend Rest Poinst',
    description: 'This happens during Exploration but are specific moments when PCs stop to rest and recover their resources.',
    complete: 'Rest is completed',
    rest: 'Make rest'
  },
  ru: {
    values: {
      combat: 'После сражения',
      quick: 'Быстрый',
      short: 'Короткий',
      half_long: 'Частично длинный',
      complete_long: 'Длинный',
      full: 'Полный'
    },
    valueLabel: 'Выберите тип отдыха',
    pointsLabel: 'Потратить очки отдыха',
    description: 'Это происходит во время исследования, но это определенные моменты, когда персонажи останавливаются, чтобы отдохнуть и восстановить свои ресурсы.',
    complete: 'Отдых завершён',
    rest: 'Провести отдых'
  }
}

export const Dc20Rest = (props) => {
  const character = () => props.character;

  const [value, setValue] = createSignal(null);
  const [spendRestPoints, setSpendRestPoints] = createSignal(0);

  const [appState] = useAppState();
  const [{ renderNotice, renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const restCharacter = async () => {
    const result = await createCharacterRestRequest(
      appState.accessToken,
      character().provider,
      character().id,
      { character: { value: value(), options: { spend_rest_points: parseInt(spendRestPoints()), max_health: character().health.max } } }
    );
    if (result.errors_list === undefined) {
      batch(() => {
        props.onReloadCharacter();
        setValue(null);
        setSpendRestPoints(0);
        renderNotice(localize(TRANSLATION, locale()).complete);
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20Rest' }}>
      <GuideWrapper character={character()}>
        <div class="blockable p-4">
          <p class="mb-4">{localize(TRANSLATION, locale()).description}</p>
          <Select
            containerClassList="w-full mb-4"
            labelText={localize(TRANSLATION, locale()).valueLabel}
            items={localize(TRANSLATION, locale()).values}
            selectedValue={value()}
            onSelect={setValue}
          />
          <Show when={['quick', 'short'].includes(value())}>
            <Select
              containerClassList="w-full mb-4"
              labelText={localize(TRANSLATION, locale()).pointsLabel}
              items={Array.from([...Array(character().rest_points.current).keys()], (x) => x + 1).reduce((acc, item) => { acc[item] = item; return acc; }, {})}
              selectedValue={spendRestPoints()}
              onSelect={setSpendRestPoints}
            />
          </Show>
          <Button default textable onClick={restCharacter}>{localize(TRANSLATION, locale()).rest}</Button>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
