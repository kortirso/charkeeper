import { createMemo, For } from 'solid-js';

import { ErrorWrapper, GuideWrapper } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    ranks: 'Ranks',
    die: 'Die',
    size: 'Effect',
    range: 'Range',
    title: 'Powers scaling',
    ft: 'ft'
  },
  ru: {
    ranks: 'Уровень',
    die: 'Куб',
    size: 'Эффект',
    range: 'Дальность',
    title: 'Размеры силы',
    ft: 'фт'
  }
}
const DICES = { 1: 'd4', 2: 'd6', 3: 'd8', 4: 'd10', 5: 'd12' }
const SIZES = { 1: '2.5', 2: '5', 3: '10', 4: '15', 5: '20' }

export const CosmerePowers = (props) => {
  const character = () => props.character;

  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const renderDice = (value) => {
    if (value === 0) return '1';
    if (value > 5) return 'd20';

    return DICES[value];
  }

  const renderSize = (value) => {
    if (value === 0) return '-';
    if (value > 5) return '-';

    return SIZES[value];
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'CosmerePowers' }}>
      <GuideWrapper character={character()}>
        <div class="character-info-block">
          <p class="character-info-title">{i18n().title}</p>
          <div class="grid grid-cols-5 gap-2 mb-2">
            <p />
            <p class="text-center text-sm">{i18n().ranks}</p>
            <p class="text-center text-sm">{i18n().die}</p>
            <p class="text-center text-sm">{i18n().size}</p>
            <p class="text-center text-sm">{i18n().range}</p>
          </div>
          <For each={character().powers}>
            {(power) =>
              <div class="grid grid-cols-5 gap-2">
                <p>{power.name}</p>
                <p class="text-center">{power.level}</p>
                <p class="text-center">{renderDice(power.level)}</p>
                <p class="text-center">{renderSize(power.level)} {i18n().ft}</p>
                <p class="text-center">{10 * (2 ** power.level)} {i18n().ft}</p>
              </div>
            }
          </For>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
