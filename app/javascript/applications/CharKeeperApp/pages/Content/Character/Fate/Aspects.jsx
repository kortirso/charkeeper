import { createSignal, createEffect, For, Show, batch } from 'solid-js';

import { ErrorWrapper, EditWrapper, Text, Input, TextArea } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

const TRANSLATION = {
  en: {
    title: 'Aspects',
    highConcept: 'High concept',
    trouble: 'Trouble',
    aspect: 'Aspect',
    description: 'Description'
  },
  ru: {
    title: 'Аспекты',
    highConcept: 'Концепция',
    trouble: 'Проблема',
    aspect: 'Аспект',
    description: 'Описание аспекта'
  },
  es: {
    title: 'Aspectos',
    highConcept: 'Concepto',
    trouble: 'Problema',
    aspect: 'Aspecto',
    description: 'Descripción del aspecto'
  }
}

export const FateAspects = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [aspects, setAspects] = createSignal({});
  const [phaseTrio, setPhaseTrio] = createSignal({});

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setAspects(character().aspects);
      setPhaseTrio(character().phase_trio);
      setLastActiveCharacterId(character().id);
    });
  });

  const cancelEditing = () => {
    batch(() => {
      setAspects(character().aspects);
      setPhaseTrio(character().phase_trio);
      setEditMode(false);
    });
  }

  const updateCharacter = async () => {
    const result = await updateCharacterRequest(
      appState.accessToken,
      character().provider,
      character().id,
      { character: { aspects: aspects(), phase_trio: phaseTrio() }, only_head: true }
    );

    if (result.errors_list === undefined) setEditMode(false);
    else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'FateAspects' }}>
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
              <>
                <Text
                  containerClassList="mt-4"
                  labelClassList="uppercase text-xs!"
                  labelText={TRANSLATION[locale()].highConcept}
                  text={aspects().concept && aspects().concept.length > 0 ? aspects().concept : '-'}
                  textClassList="text-xl"
                />
                <Text
                  containerClassList="mt-4"
                  labelClassList="uppercase text-xs!"
                  labelText={TRANSLATION[locale()].trouble}
                  text={aspects().trouble && aspects().trouble.length > 0 ? aspects().trouble : '-'}
                  textClassList="text-xl"
                />
                <For each={['a', 'b', 'c']}>
                  {(item) =>
                    <Show when={aspects()[item] && aspects()[item].length > 0}>
                      <Text
                        containerClassList="mt-4"
                        text={aspects()[item]}
                        textClassList="text-xl"
                      />
                      <Text
                        containerClassList="mt-1"
                        text={phaseTrio()[item]}
                        textClassList="text-sm"
                      />
                    </Show>
                  }
                </For>
              </>
            }
          >
            <Input
              containerClassList="mt-4"
              labelText={TRANSLATION[locale()].highConcept}
              labelClassList="uppercase text-xs!"
              value={aspects().concept}
              onInput={(value) => setAspects({ ...aspects(), concept: value })}
            />
            <Input
              containerClassList="mt-2"
              labelText={TRANSLATION[locale()].trouble}
              labelClassList="uppercase text-xs!"
              value={aspects().trouble}
              onInput={(value) => setAspects({ ...aspects(), trouble: value })}
            />
            <For each={['a', 'b', 'c']}>
              {(item) =>
                <>
                  <Input
                    containerClassList="mt-2"
                    labelText={TRANSLATION[locale()].aspect}
                    labelClassList="uppercase text-xs!"
                    value={aspects()[item]}
                    onInput={(value) => setAspects({ ...aspects(), [item]: value })}
                  />
                  <TextArea
                    rows="4"
                    containerClassList="mt-1"
                    labelText={TRANSLATION[locale()].description}
                    labelClassList="uppercase text-xs!"
                    value={phaseTrio()[item]}
                    onChange={(value) => setPhaseTrio({ ...phaseTrio(), [item]: value })}
                  />
                </>
              }
            </For>
          </Show>
        </div>
      </EditWrapper>
    </ErrorWrapper>
  );
}
