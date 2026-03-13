import { For } from 'solid-js';

import { Checkbox, Button } from '../../../../../components';
import { useAppLocale } from '../../../../../context';
import { localize } from '../../../../../helpers';

const TRANSLATION = {
  en: {
    title: 'Vitals',
    physical: 'PHYSICAL STRESS',
    mental: 'MENTAL STRESS',
    clear: 'Clear'
  },
  ru: {
    title: 'Здоровье',
    physical: 'ФИЗИЧЕСКИЙ СТРЕСС',
    mental: 'МЕНТАЛЬНЫЙ СТРЕСС',
    clear: 'Очистить'
  },
  es: {
    title: 'Partes vitales',
    physical: 'ESTRÉS FÍSICO',
    mental: 'ESTRÉS MENTAL',
    clear: 'Eliminar'
  }
}

export const FateCoreVitals = (props) => {
  const [locale] = useAppLocale();

  const markStress = (slug, index) => {
    const powed = 2 ** index;
    const currentValue = props.selectedStress[slug];
    let payload;

    if (currentValue) {
      const exist = (currentValue & powed) !== 0;
      if (exist) payload = { ...props.selectedStress, [slug]: currentValue - powed };
      else payload = { ...props.selectedStress, [slug]: currentValue + powed };
    } else {
      payload = { ...props.selectedStress, [slug]: powed };
    }

    props.updateCharacter({ selected_stress: payload });
  }

  const clearStress = () => props.updateCharacter({ selected_stress: {} });

  const renderAttribute = (title, maxValue, slug) => (
    <div class="mt-4">
      <p class="text-sm/4 mb-2">{title}</p>
      <div class="flex">
        <For each={Array.from([...Array(maxValue).keys()], (x) => x)}>
          {(index) =>
            <div class="relative">
              <Checkbox
                filled
                big
                checked={props.selectedStress[slug] ? ((props.selectedStress[slug] & (2 ** index)) !== 0) : false}
                classList="mr-2"
                onToggle={() => markStress(slug, index)}
              />
              <p class="absolute z-10 -bottom-1 right-2 dark:text-dusty font-medium!">{index + 1}</p>
            </div>
          }
        </For>
      </div>
    </div>
  );

  return (
    <div class="blockable p-4">
      <h2 class="text-lg">{localize(TRANSLATION, locale()).title}</h2>
      {renderAttribute(localize(TRANSLATION, locale()).physical, props.maxStress.physical, 'physical')}
      {renderAttribute(localize(TRANSLATION, locale()).mental, props.maxStress.mental, 'mental')}
      <div class="flex justify-start">
        <Button default classList="mt-4 px-2" onClick={clearStress}>{localize(TRANSLATION, locale()).clear}</Button>
      </div>
    </div>
  );
}
