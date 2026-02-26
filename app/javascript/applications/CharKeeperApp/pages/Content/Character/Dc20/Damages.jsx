import { createSignal, createMemo, For, Show } from 'solid-js';

import { ErrorWrapper, GuideWrapper, Input, Select, Text } from '../../../../components';
import config from '../../../../data/dc20.json';
import { useAppLocale } from '../../../../context';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    title: 'Damage impact',
    immune: 'Immunity',
    vulner: 'Vulner',
    resist: 'Resist',
    nothing: 'Character does not have any resistances or vulnerabilities',
    damageCalculator: 'Damage calculator',
    damageValue: 'Income damage',
    damageType: 'Damage type',
    damageResult: 'Result'
  },
  ru: {
    title: 'Воздействие урона',
    immune: 'Иммунитет',
    vulner: 'Уязвим',
    resist: 'Сопр',
    nothing: 'У персонажа нет сопротивлений или уязвимостей',
    damageCalculator: 'Калькулятор урона',
    damageValue: 'Входящий урон',
    damageType: 'Тип урона',
    damageResult: 'Результат'
  }
}

export const Dc20Damages = (props) => {
  const character = () => props.character;

  const [damageValue, setDamageValue] = createSignal(0);
  const [damageType, setDamageType] = createSignal(null);

  const [locale] = useAppLocale();

  const availableDamageTypes = createMemo(() => {
    const current = Object.keys(character().damages);

    return Object.fromEntries(
      Object.entries(config.damages).filter(([key]) => current.includes(key)).map(([key, values]) => [key, values.name[locale()]])
    );
  });

  const damageResult = createMemo(() => {
    if (damageValue() <= 0) return 0;
    if (damageType() === null) return 0;

    const current = character().damages[damageType()];
    if (current.immune) return 0;
    if (current.abs > 0 && current.multi > 0) return damageValue() / 2;
    if (current.abs < 0 && current.multi < 0) return damageValue() * 2;

    let result = damageValue() + current.abs;
    if (current.multi > 0) {
      result = Math.round(result / 2);
      if (current.abs === 0 && result === damageValue()) result -= 1;
    } else if (current.multi < 0) result *= 2;

    return result;
  });

  const damageText = (values) => {
    if (values.abs > 0 && values.multi > 0) return `${localize(TRANSLATION, locale()).resist} (x/2)`;
    if (values.abs < 0 && values.multi < 0) return `${localize(TRANSLATION, locale()).vulner} (x2)`;

    const result = [];
    if (values.abs !== 0) {
      const text = values.abs > 0 ? localize(TRANSLATION, locale()).resist : localize(TRANSLATION, locale()).vulner;
      result.push(`${text} (${values.abs})`)
    }
    if (values.multi !== 0) {
      const text = values.multi > 0 ? localize(TRANSLATION, locale()).resist : localize(TRANSLATION, locale()).vulner;
      result.push(`${text} (${values.multi > 0 ? 'x/2' : 'x2'})`)
    }
    return result.join(' / ');
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20Damages' }}>
      <GuideWrapper character={character()}>
        <div class="blockable p-4">
          <p class="text-lg">{localize(TRANSLATION, locale()).title}</p>
          <Show
            when={Object.keys(character().damages).length > 0}
            fallback={<p class="mt-2">{localize(TRANSLATION, locale()).nothing}</p>}
          >
            <>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2">
                <For each={Object.entries(config.damages)}>
                  {([slug, values]) =>
                    <Show when={character().damages[slug]}>
                      <div class="flex items-center gap-x-4">
                        <span>{localize(values.name, locale())}</span>
                        <Show
                          when={character().damages[slug].immune}
                          fallback={<span>{damageText(character().damages[slug])}</span>}
                        >
                          <span>{localize(TRANSLATION, locale()).immune}</span>
                        </Show>
                      </div>
                    </Show>
                  }
                </For>
              </div>
              <p class="mt-4">{localize(TRANSLATION, locale()).damageCalculator}</p>
              <div class="mt-2 flex gap-2">
                <Input
                  numeric
                  containerClassList="w-4/10 md:w-40"
                  labelText={localize(TRANSLATION, locale()).damageValue}
                  value={damageValue()}
                  onInput={(value) => setDamageValue(parseInt(value))}
                />
                <Select
                  containerClassList="w-6/10 md:w-40"
                  labelText={localize(TRANSLATION, locale()).damageType}
                  items={availableDamageTypes()}
                  selectedValue={damageType()}
                  onSelect={setDamageType}
                />
                <Text
                  containerClassList="w-20 ml-4 hidden md:block"
                  textClassList="h-12 leading-12 text-center text-lg"
                  labelText={localize(TRANSLATION, locale()).damageResult}
                  text={damageResult()}
                />
              </div>
              <p class="mt-2 md:hidden text-sm">{localize(TRANSLATION, locale()).damageResult} - {damageResult()}</p>
            </>
          </Show>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
