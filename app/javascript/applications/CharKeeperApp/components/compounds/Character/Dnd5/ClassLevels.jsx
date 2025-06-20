import { createSignal, For, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Select, Checkbox, Button } from '../../../atoms';

import { useAppLocale } from '../../../../context';
import { PlusSmall, Minus } from '../../../../assets';

export const Dnd5ClassLevels = (props) => {
  const character = () => props.character;

  const classes = () => character().provider === 'dnd5' ? dict().dnd5.classes : dict().dnd2024.classes;
  const subclasses = () => character().provider === 'dnd5' ? dict().dnd5.subclasses : dict().dnd2024.subclasses;

  // changeable data
  const [classesData, setClassesData] = createSignal(character().classes);
  const [subclassesData, setSubclassesData] = createSignal(character().subclasses);

  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  // actions
  /* eslint-disable solid/reactivity */
  const toggleClass = (className) => {
    if (classesData()[className]) {
      const classesResult = Object.keys(classesData())
        .filter(item => item !== className)
        .reduce((acc, item) => { acc[item] = classesData()[item]; return acc; }, {} );

      const subclassesResult = Object.keys(subclassesData())
        .filter(item => item !== className)
        .reduce((acc, item) => { acc[item] = subclassesData()[item]; return acc; }, {} );

      batch(() => {
        setClassesData(classesResult);
        setSubclassesData(subclassesResult);
      });
    } else {
      batch(() => {
        setClassesData({ ...classesData(), [className]: 1 });
        setSubclassesData({ ...subclassesData(), [className]: null });
      });
    }
  }
  /* eslint-enable solid/reactivity */

  const changeClassLevel = (className, direction) => {
    if (direction === 'down' && classesData()[className] === 1) return;

    const newValue = direction === 'up' ? (classesData()[className] + 1) : (classesData()[className] - 1);
    setClassesData({ ...classesData(), [className]: newValue });
  }

  // submits
  const updateClasses = async () => {
    await props.onReloadCharacter({ classes: classesData(), subclasses: subclassesData() });
  }

  return (
    <div class="white-box p-4 flex flex-col">
      <div class="mb-1">
        <p>{character().subclasses[character().main_class] ? `${classes()[character().main_class]} - ${subclasses()[character().main_class][character().subclasses[character().main_class]]}` : classes()[character().main_class]}</p>
        <div class="my-2 flex items-center">
          <div class="flex justify-between items-center mr-4 w-24">
            <Button default size="small" onClick={() => changeClassLevel(character().main_class, 'down')}>
              <Minus />
            </Button>
            <p>{classesData()[character().main_class]}</p>
            <Button default size="small" onClick={() => changeClassLevel(character().main_class, 'up')}>
              <PlusSmall />
            </Button>
          </div>
          <div class="flex-1">
            <Show
              when={subclasses()[character().main_class] !== undefined && !character().subclasses[character().main_class]}
              fallback={<></>}
            >
              <Select
                containerClassList="w-full"
                items={subclasses()[character().main_class]}
                selectedValue={subclassesData()[character().main_class]}
                onSelect={(value) => setSubclassesData({ ...subclassesData(), [character().main_class]: value })}
              />
            </Show>
          </div>
        </div>
      </div>
      <For each={Object.entries(classes()).filter((item) => item[0] !== character().main_class).sort((a,) => !Object.keys(classesData()).includes(a[0]))}>
        {([slug, className]) =>
          <div class="mb-1">
            <Checkbox
              labelText={character().subclasses[slug] ? `${className} - ${subclasses()[slug][character().subclasses[slug]]}` : className}
              labelPosition="right"
              labelClassList="ml-4"
              checked={classesData()[slug]}
              onToggle={() => toggleClass(slug)}
            />
            <Show when={classesData()[slug]}>
              <>
                <div class="my-2 flex items-center">
                  <div class="flex justify-between items-center mr-4 w-24">
                    <Button default size="small" onClick={() => changeClassLevel(slug, 'down')}>
                      <Minus />
                    </Button>
                    <p>{classesData()[slug]}</p>
                    <Button default size="small" onClick={() => changeClassLevel(slug, 'up')}>
                      <PlusSmall />
                    </Button>
                  </div>
                  <div class="flex-1">
                    <Show
                      when={subclasses()[slug] !== undefined && !character().subclasses[slug]}
                      fallback={<></>}
                    >
                      <Select
                        containerClassList="w-full"
                        items={subclasses()[slug]}
                        selectedValue={subclassesData()[slug]}
                        onSelect={(value) => setSubclassesData({ ...subclassesData(), [slug]: value })}
                      />
                    </Show>
                  </div>
                </div>
              </>
            </Show>
          </div>
        }
      </For>
      <Button default textable classList="mt-2" onClick={updateClasses}>{t('save')}</Button>
    </div>
  );
}
