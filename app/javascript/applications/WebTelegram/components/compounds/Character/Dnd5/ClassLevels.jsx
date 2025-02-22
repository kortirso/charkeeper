import { createSignal, For, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Select, Checkbox, Button, IconButton } from '../../../atoms';

import { useAppLocale } from '../../../../context';
import { Plus, Minus } from '../../../../assets';

export const Dnd5ClassLevels = (props) => {
  const classes = () => props.provider === 'dnd5' ? dict().dnd5.classes : dict().dnd2024.classes;
  const subclasses = () => props.provider === 'dnd5' ? dict().dnd5.subclasses : dict().dnd2024.subclasses;

  // changeable data
  const [classesData, setClassesData] = createSignal(props.initialClasses);
  const [subclassesData, setSubclassesData] = createSignal(props.initialSubclasses);

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
        <p>{props.initialSubclasses[props.mainClass] ? `${classes()[props.mainClass]} - ${subclasses()[props.mainClass][props.initialSubclasses[props.mainClass]]}` : classes()[props.mainClass]}</p>
        <div class="my-2 flex items-center">
          <div class="flex justify-between items-center mr-4 w-24">
            <IconButton onClick={() => changeClassLevel(props.mainClass, 'down')}>
              <Minus />
            </IconButton>
            <p>{classesData()[props.mainClass]}</p>
            <IconButton onClick={() => changeClassLevel(props.mainClass, 'up')}>
              <Plus />
            </IconButton>
          </div>
          <div class="flex-1">
            <Show
              when={subclasses()[props.mainClass] !== undefined && !props.initialSubclasses[props.mainClass]}
              fallback={<></>}
            >
              <Select
                classList="w-full"
                items={subclasses()[props.mainClass]}
                selectedValue={subclassesData()[props.mainClass]}
                onSelect={(value) => setSubclassesData({ ...subclassesData(), [props.mainClass]: value })}
              />
            </Show>
          </div>
        </div>
      </div>
      <For each={Object.entries(classes()).filter((item) => item[0] !== props.mainClass).sort((a,) => !Object.keys(classesData()).includes(a[0]))}>
        {([slug, className]) =>
          <div class="mb-1">
            <Checkbox
              labelText={props.initialSubclasses[slug] ? `${className} - ${subclasses()[slug][props.initialSubclasses[slug]]}` : className}
              labelPosition="right"
              labelClassList="ml-4"
              checked={classesData()[slug]}
              onToggle={() => toggleClass(slug)}
            />
            <Show when={classesData()[slug]}>
              <>
                <div class="my-2 flex items-center">
                  <div class="flex justify-between items-center mr-4 w-24">
                    <IconButton onClick={() => changeClassLevel(slug, 'down')}>
                      <Minus />
                    </IconButton>
                    <p>{classesData()[slug]}</p>
                    <IconButton onClick={() => changeClassLevel(slug, 'up')}>
                      <Plus />
                    </IconButton>
                  </div>
                  <div class="flex-1">
                    <Show
                      when={subclasses()[slug] !== undefined && !props.initialSubclasses[slug]}
                      fallback={<></>}
                    >
                      <Select
                        classList="w-full"
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
      <Button primary classList="mt-2" text={t('save')} onClick={updateClasses} />
    </div>
  );
}
