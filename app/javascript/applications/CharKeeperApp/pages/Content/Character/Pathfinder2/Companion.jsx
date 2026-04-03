import { createSignal, createEffect, Show, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { ErrorWrapper, Input, Button, EditWrapper, GuideWrapper, AvatarInput, TextArea } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Avatar } from '../../../../assets';
import { fetchCompanionRequest } from '../../../../requests/fetchCompanionRequest';
import { createCompanionRequest } from '../../../../requests/createCompanionRequest';
import { updateCompanionRequest } from '../../../../requests/updateCompanionRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    name: "Companion's name",
    create: 'Create',
    caption: 'Caption'
  },
  ru: {
    name: 'Имя любимца',
    create: 'Добавить',
    caption: 'Описание'
  },
  es: {
    name: 'Nombre del compañero',
    create: 'Create',
    caption: 'Caption'
  }
}

export const Pathfinder2Companion = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);

  const [companion, setCompanion] = createSignal(undefined);
  const [selectedFile, setSelectedFile] = createSignal(null);
  const [form, setForm] = createStore({ name: '', caption: '' });

  const [editMode, setEditMode] = createSignal(false);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (!character().can_have_pet && !character().can_have_familiar) return;
    if (lastActiveCharacterId() === character().id) return;

    const fetchCompanion = async () => await fetchCompanionRequest(appState.accessToken, character().provider, character().id);

    Promise.all([fetchCompanion()]).then(
      ([companionData]) => {
        if (companionData.errors) {
          setCompanion(null);
        } else {
          batch(() => {
            setForm({ name: companionData.pet.name, caption: companionData.pet.caption, kind: companionData.pet.data.kind });
            setCompanion(companionData.pet);
          });
        }
      }
    );

    setLastActiveCharacterId(character().id);
  });

  const createCompanion = async () => {
    const result = await createCompanionRequest(
      appState.accessToken, character().provider, character().id, { ...form, kind: character().can_have_familiar ? 'familiar' : 'pet' }
    );

    if (result.errors_list === undefined) {
      setCompanion(result.pet);
    } else renderAlerts(result.errors_list);
  }

  const cancelNameEditing = () => setEditMode(false);

  const changeCompanion = () => {
    const formData = new FormData();
    if (companion().name !== form.name) formData.append('name', form.name);
    if (companion().caption !== form.caption) formData.append('caption', form.caption);
    if (selectedFile()) formData.append('file', selectedFile());

    updateCompanion(formData, setEditMode, true);
  }

  const updateCompanion = async (payload, callback = null, asFormData = false) => {
    const resultPayload = asFormData ? payload : { pet: payload };
    const result = await updateCompanionRequest(
      appState.accessToken, character().provider, character().id, resultPayload, asFormData
    );

    if (result.errors_list === undefined) {
      batch(() => {
        setCompanion(result.pet);
        if (callback) callback(false);
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Pathfinder2Companion' }}>
      <GuideWrapper character={character()}>
        <Show
          when={companion()}
          fallback={
            <>
              <Input
                containerClassList="mb-4"
                labelText={localize(TRANSLATION, locale()).name}
                value={form.name}
                onInput={(value) => setForm({ ...form, name: value })}
              />
              <Button default onClick={createCompanion}>{localize(TRANSLATION, locale()).create}</Button>
            </>
          }
        >
          <div class="">
            <EditWrapper
              editMode={editMode()}
              onSetEditMode={setEditMode}
              onCancelEditing={cancelNameEditing}
              onSaveChanges={changeCompanion}
            >
              <div class="py-4 px-2 md:px-4 blockable">
                <Show
                  when={editMode()}
                  fallback={
                    <>
                      <div class="flex">
                        <div class="avatar-block">
                          <Show when={companion().avatar} fallback={<Avatar width={64} height={64} />}>
                            <img src={companion().avatar} class="avatar" />
                          </Show>
                        </div>
                        <div class="flex-1">
                          <p class="text-xl">{companion().name}</p>
                          <p class="mt-2">{companion().caption}</p>
                        </div>
                      </div>
                    </>
                  }
                >
                  <Input
                    containerClassList="mb-2"
                    labelText={localize(TRANSLATION, locale()).name}
                    value={form.name}
                    onInput={(value) => setForm({ ...form, name: value })}
                  />
                  <TextArea
                    rows="4"
                    containerClassList="mb-2"
                    labelText={localize(TRANSLATION, locale()).caption}
                    value={form.caption}
                    onChange={(value) => setForm({ ...form, caption: value })}
                  />
                  <AvatarInput onSelectedFile={setSelectedFile} />
                </Show>
              </div>
            </EditWrapper>
          </div>
        </Show>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
