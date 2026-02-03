import { createSignal, createEffect, For, Show, batch } from 'solid-js';

import { Button, TextArea, ErrorWrapper, Toggle, GuideWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Plus, Close, Check } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    title: 'Scars',
    label: 'New scar description',
    placeholder: 'Max hope will automatically decrease by 1 for each scar.'
  },
  ru: {
    title: 'Шрамы',
    label: 'Описание нового шрама',
    placeholder: 'Значение надежды автоматически уменьшится на 1 за каждый шрам.'
  }
}

export const DaggerheartScars = (props) => {
  const character = () => props.character;

  const [lastActiveObjectId, setLastActiveObjectId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [name, setName] = createSignal('');
  const [scarsData, setScarsData] = createSignal(character().scars);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveObjectId() === character().id) return;

    batch(() => {
      setScarsData(character().scars);
      setLastActiveObjectId(character().id);
    });
  });

  const cancelEditing = () => {
    batch(() => {
      setName('');
      setEditMode(false);
    });
  }

  const addScar = () => {
    const payload = scarsData().concat({ id: Math.floor(Math.random() * 1000), name: name() });
    setScarsData(payload);
    saveScar({ scars: payload });
  }

  const removeScar = (scarId) => {
    const payload = scarsData().filter((item) => item.id !== scarId);
    setScarsData(payload);
    saveScar({ scars: payload });
  }

  const saveScar = async (payload) => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload, only_head: true }
    );

    if (result.errors_list === undefined) {
      batch(() => {
        props.onReloadCharacter();
        cancelEditing();
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartScars' }}>
      <GuideWrapper character={character()}>
        <Toggle
          disabled
          isOpen
          title={
            <div class="flex justify-between items-center">
              <h2 class="flex-1 text-lg dark:text-snow">{localize(TRANSLATION, locale()).title}</h2>
              <Show when={!editMode()}>
                <Button default size="small" onClick={() => setEditMode(true)}>
                  <Plus />
                </Button>
              </Show>
            </div>
          }
        >
          <Show when={editMode()}>
            <div class="flex items-center gap-2">
              <TextArea
                rows="3"
                labelText={localize(TRANSLATION, locale()).label}
                placeholder={localize(TRANSLATION, locale()).placeholder}
                containerClassList="flex-1"
                value={name()}
                onChange={(value) => setName(value)}
              />
              <Show when={name().length > 0}>
                <Button outlined onClick={cancelEditing}><Close width="30" height="30" /></Button>
                <Button default onClick={addScar}><Check width="20" height="20" /></Button>
              </Show>
            </div>
          </Show>
          <div class="experiences">
            <For each={character().scars}>
              {(scar) =>
                <div class="experience mt-2">
                  <p class="flex-1">{scar.name}</p>
                  <Button default size="small" classList="ml-4 opacity-75" onClick={() => removeScar(scar.id)}>
                    <Close />
                  </Button>
                </div>
              }
            </For>
          </div>
        </Toggle>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
