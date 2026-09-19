import { createSignal, createEffect, For, Show, batch } from 'solid-js';

import { ErrorWrapper, EditWrapper, Checkbox, Button, Select } from '../../../../components';
import { useAppState, useAppAlert, useAppLocale } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    title: 'Vitals',
    physical: 'PHYSICAL STRESS',
    mental: 'MENTAL STRESS',
    clear: 'Clear',
    mode: 'Vitals mode',
    modes: {
      core: 'Core',
      condensed: 'Condensed'
    }
  },
  ru: {
    title: 'Здоровье',
    physical: 'ФИЗИЧЕСКИЙ СТРЕСС',
    mental: 'МЕНТАЛЬНЫЙ СТРЕСС',
    clear: 'Очистить',
    mode: 'Режим здоровья',
    modes: {
      core: 'Базовый',
      condensed: 'Упрощённый'
    }
  },
  es: {
    title: 'Partes vitales',
    physical: 'ESTRÉS FÍSICO',
    mental: 'ESTRÉS MENTAL',
    clear: 'Eliminar',
    mode: 'Vitals mode',
    modes: {
      core: 'Core',
      condensed: 'Condensed'
    }
  }
}

export const FateVitals = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setLastActiveCharacterId(character().id);
    });
  });

  const markStress = (slug, index) => {
    const powed = 2 ** index;
    const currentValue = character().selected_stress[slug];
    let payload;

    if (currentValue) {
      const exist = (currentValue & powed) !== 0;
      if (exist) payload = { ...character().selected_stress, [slug]: currentValue - powed };
      else payload = { ...character().selected_stress, [slug]: currentValue + powed };
    } else {
      payload = { ...character().selected_stress, [slug]: powed };
    }

    updateCharacter({ selected_stress: payload });
  }

  const clearStress = () => updateCharacter({ selected_stress: {} });

  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload, only_head: true }
    );

    if (result.errors_list === undefined) {
      setEditMode(false)
      props.onReloadCharacter();
    } else renderAlerts(result.errors_list);
  }

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
                checked={character().selected_stress[slug] ? ((character().selected_stress[slug] & (2 ** index)) !== 0) : false}
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
    <ErrorWrapper payload={{ character_id: character().id, key: 'FateVitals' }}>
      <EditWrapper
        position="right"
        editMode={editMode()}
        onSetEditMode={setEditMode}
        onCancelEditing={() => setEditMode(false)}
        onSaveChanges={() => setEditMode(false)}
      >
        <div class="blockable p-4">
          <Show
            when={editMode()}
            fallback={
              <>
                <h2 class="text-lg">{localize(TRANSLATION, locale()).title}</h2>
                {renderAttribute(localize(TRANSLATION, locale()).physical, character().max_stress.physical, 'physical')}
                {renderAttribute(localize(TRANSLATION, locale()).mental, character().max_stress.mental, 'mental')}
                <div class="flex justify-start">
                  <Button default classList="mt-4 px-2" onClick={clearStress}><span>{localize(TRANSLATION, locale()).clear}</span></Button>
                </div>
              </>
            }
          >
            <Select
              labelText={localize(TRANSLATION, locale()).mode}
              items={localize(TRANSLATION, locale()).modes}
              selectedValue={character().stress_system}
              onSelect={(value) => updateCharacter({ stress_system: value })}
            />
          </Show>
        </div>
      </EditWrapper>
    </ErrorWrapper>
  );
}
