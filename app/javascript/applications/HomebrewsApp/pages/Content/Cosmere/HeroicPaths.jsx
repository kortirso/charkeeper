import { createSignal, createEffect, Show, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useAppState, useAppLocale } from '../../../context';
import { Button, Input, TextArea } from '../../../components';
import { fetchSpecialitiesRequest } from '../../../requests/specialities/fetchSpecialitiesRequest';

const TRANSLATION = {
  en: {
    add: 'Add Heroic Path'
  },
  ru: {
    add: 'Добавить класс'
  },
  es: {
    add: 'Agregar clase'
  }
}

export const CosmereHeroicPaths = () => {
  const [names, setNames] = createStore({ en: '', ru: '', es: '' });
  const [descriptions, setDescriptions] = createStore({ en: '', ru: '', es: '' });

  const [specialities, setSpecialities] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  createEffect(() => {
    const fetchSpecialities = async () => await fetchSpecialitiesRequest(appState.accessToken, 'cosmere');

    Promise.all([fetchSpecialities()]).then(
      ([specialitiesData]) => {
        batch(() => {
          setSpecialities(specialitiesData.specialities);
        });
      }
    );
  });

  const openForm = () => {
    batch(() => {
      setEditMode(true);
    });
  }

  return (
    <Show when={specialities() !== undefined} fallback={<></>}>
      <Button default classList="mb-4 px-2 py-1" onClick={openForm}>{TRANSLATION[locale()].add}</Button>
      <Show
        when={editMode()}
        fallback={
          <></>
        }
      >
        <>
          <p class="mb-2 text-xl">{TRANSLATION[locale()].newSpecialityTitle}</p>
          <Input
            containerClassList="form-field mb-2"
            labelText={TRANSLATION[locale()].names}
            value={names[locale()]}
            onInput={(value) => setNames({ ...names, [locale()]: value })}
          />
          <TextArea
            rows="3"
            labelText={TRANSLATION[locale()].descriptions}
            value={descriptions[locale()]}
            onChange={(value) => setDescriptions({ ...descriptions, [locale()]: value })}
          />
          <Button default classList="px-2 py-1">
            {TRANSLATION[locale()].save}
          </Button>
        </>
      </Show>
    </Show>
  );
}
