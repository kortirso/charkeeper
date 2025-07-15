import { createSignal, createEffect, For, Show, batch, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { ErrorWrapper, Select, Checkbox, Button } from '../../../../components';
import dnd2024Config from '../../../../data/dnd2024.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall, Minus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { translate } from '../../../../helpers';

export const Dnd5ClassLevels = (props) => {
  const character = () => props.character;

  // changeable data
  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [classesData, setClassesData] = createSignal(character().classes);
  const [subclassesData, setSubclassesData] = createSignal(character().subclasses);

  const [appState] = useAppState();
  const [{ renderNotice, renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setClassesData(character().classes);
      setSubclassesData(character().subclasses);
      setLastActiveCharacterId(character().id);
    });
  });

  const classes = () => character().provider === 'dnd5' ? dict().dnd5.classes : translate(dnd2024Config.classes, locale());
  const subclasses = () => character().provider === 'dnd5' ? dict().dnd5.subclasses : {};

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
    const result = await updateCharacterRequest(
      appState.accessToken,
      character().provider,
      character().id,
      { character: { classes: classesData(), subclasses: subclassesData() } }
    );

    if (result.errors === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        renderNotice(t('alerts.characterIsUpdated'));
      });
    } else renderAlerts(result.errors);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd5ClassLevels' }}>
      <div class="blockable p-4 flex flex-col">
        <div class="mb-1">
          <Show
            when={character().provider === 'dnd5'}
            fallback={
              <p class="dark:text-snow">{character().subclasses[character().main_class] ? `${classes()[character().main_class]} - ${translate(dnd2024Config.classes[character().main_class].subclasses, locale())[character().subclasses[character().main_class]]}` : classes()[character().main_class]}</p>
            }
          >
            <p class="dark:text-snow">{character().subclasses[character().main_class] ? `${classes()[character().main_class]} - ${subclasses()[character().main_class][character().subclasses[character().main_class]]}` : classes()[character().main_class]}</p>
          </Show>
          <div class="my-2 flex items-center">
            <div class="flex justify-between items-center mr-4 w-24">
              <Button default size="small" onClick={() => changeClassLevel(character().main_class, 'down')}>
                <Minus />
              </Button>
              <p class="dark:text-snow">{classesData()[character().main_class]}</p>
              <Button default size="small" onClick={() => changeClassLevel(character().main_class, 'up')}>
                <PlusSmall />
              </Button>
            </div>
            <div class="flex-1">
              <Switch>
                <Match when={character().provider === 'dnd5'}>
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
                </Match>
                <Match when={character().provider === 'dnd2024'}>
                  <Show
                    when={Object.keys(dnd2024Config.classes[character().main_class].subclasses).length > 0 && !character().subclasses[character().main_class]}
                    fallback={<></>}
                  >
                    <Select
                      containerClassList="w-full"
                      items={translate(dnd2024Config.classes[character().main_class].subclasses, locale())}
                      selectedValue={subclassesData()[character().main_class]}
                      onSelect={(value) => setSubclassesData({ ...subclassesData(), [character().main_class]: value })}
                    />
                  </Show>
                </Match>
              </Switch>
            </div>
          </div>
        </div>
        <For each={Object.entries(classes()).filter((item) => item[0] !== character().main_class).sort((a,) => !Object.keys(classesData()).includes(a[0]))}>
          {([slug, className]) =>
            <div class="mb-1">
              <Switch>
                <Match when={character().provider === 'dnd5'}>
                  <Checkbox
                    labelText={character().subclasses[slug] ? `${className} - ${subclasses()[slug][character().subclasses[slug]]}` : className}
                    labelPosition="right"
                    labelClassList="ml-4"
                    checked={classesData()[slug]}
                    onToggle={() => toggleClass(slug)}
                  />
                </Match>
                <Match when={character().provider === 'dnd2024'}>
                  <Checkbox
                    labelText={character().subclasses[slug] ? `${className} - ${translate(dnd2024Config.classes[slug].subclasses, locale())[character().subclasses[slug]]}` : className}
                    labelPosition="right"
                    labelClassList="ml-4"
                    checked={classesData()[slug]}
                    onToggle={() => toggleClass(slug)}
                  />
                </Match>
              </Switch>
              <Show when={classesData()[slug]}>
                <>
                  <div class="my-2 flex items-center">
                    <div class="flex justify-between items-center mr-4 w-24">
                      <Button default size="small" onClick={() => changeClassLevel(slug, 'down')}>
                        <Minus />
                      </Button>
                      <p class="dark:text-snow">{classesData()[slug]}</p>
                      <Button default size="small" onClick={() => changeClassLevel(slug, 'up')}>
                        <PlusSmall />
                      </Button>
                    </div>
                    <div class="flex-1">
                      <Switch>
                        <Match when={character().provider === 'dnd5'}>
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
                        </Match>
                        <Match when={character().provider === 'dnd2024'}>
                          <Show
                            when={Object.keys(dnd2024Config.classes[slug].subclasses).length > 0 && !character().subclasses[slug]}
                            fallback={<></>}
                          >
                            <Select
                              containerClassList="w-full"
                              items={translate(dnd2024Config.classes[slug].subclasses, locale())}
                              selectedValue={subclassesData()[slug]}
                              onSelect={(value) => setSubclassesData({ ...subclassesData(), [slug]: value })}
                            />
                          </Show>
                        </Match>
                      </Switch>
                    </div>
                  </div>
                </>
              </Show>
            </div>
          }
        </For>
        <Button default textable classList="mt-2" onClick={updateClasses}>{t('save')}</Button>
      </div>
    </ErrorWrapper>
  );
}
