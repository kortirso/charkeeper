import { createSignal, createEffect, Show, For, batch } from 'solid-js';

import { ErrorWrapper, EditWrapper, Input, Text } from '../../../../components';
import { useAppState, useAppAlert, useAppLocale } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

const TRANSLATION = {
  en: {
    title: 'Consequences',
    mild: 'Mild',
    moderate: 'Moderate',
    severe: 'Severe'
  },
  ru: {
    title: 'Последствия',
    mild: 'Лёгкое',
    moderate: 'Среднее',
    severe: 'Серьёзное'
  },
  es: {
    title: 'Consecuencias',
    mild: 'Leve',
    moderate: 'Moderadas',
    severe: 'Graves'
  }
}

export const FateConsequences = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [cons, setCons] = createSignal({});

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setCons(character().consequences);
      setLastActiveCharacterId(character().id);
    });
  });

  const cancelEditing = () => {
    batch(() => {
      setCons(character().consequences);
      setEditMode(false);
    });
  }

  const updateCharacter = async () => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { consequences: cons() }, only_head: true }
    );

    if (result.errors_list === undefined) setEditMode(false);
    else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'FateConsequences' }}>
      <EditWrapper
        editMode={editMode()}
        onSetEditMode={setEditMode}
        onCancelEditing={cancelEditing}
        onSaveChanges={updateCharacter}
      >
        <div class="blockable p-4">
          <h2 class="text-lg">{TRANSLATION[locale()].title}</h2>
          <Show
            when={editMode()}
            fallback={
              <For each={['mild', 'moderate', 'severe']}>
                {(slug) =>
                  <Text
                    containerClassList="mt-4"
                    labelText={TRANSLATION[locale()][slug]}
                    labelClassList=""
                    text={cons()[slug] || '-'}
                  />
                }
              </For>
            }
          >
            <For each={['mild', 'moderate', 'severe']}>
              {(slug) =>
                <Input
                  containerClassList="mt-4"
                  labelText={TRANSLATION[locale()][slug]}
                  labelClassList=""
                  value={cons()[slug] || ''}
                  onInput={(value) => setCons({ ...cons(), [slug]: value })}
                />
              }
            </For>
          </Show>
        </div>
      </EditWrapper>
    </ErrorWrapper>
  );
}
