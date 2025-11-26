import { createSignal, createEffect, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useAppState, useAppLocale } from '../../../context';
import { Button, Input, createModal, DaggerheartFeatForm, DaggerheartFeat } from '../../../components';
import { Edit, Trash } from '../../../assets';
import { fetchDaggerheartTransformations } from '../../../requests/fetchDaggerheartTransformations';
import { fetchDaggerheartTransformation } from '../../../requests/fetchDaggerheartTransformation';
import { createDaggerheartTransformation } from '../../../requests/createDaggerheartTransformation';
import { changeDaggerheartTransformation } from '../../../requests/changeDaggerheartTransformation';
import { removeDaggerheartTransformation } from '../../../requests/removeDaggerheartTransformation';
import { createFeat } from '../../../requests/createFeat';
import { removeFeat } from '../../../requests/removeFeat';

const TRANSLATION = {
  en: {
    add: 'Add transformation',
    newTransformationTitle: 'Transformation form',
    name: 'Transformation name',
    save: 'Save',
    addFeature: 'Add feature'
  },
  ru: {
    add: 'Добавить трансформацию',
    newTransformationTitle: 'Редактирование трансформации',
    name: 'Название трансформации',
    save: 'Сохранить',
    addFeature: 'Добавить способность'
  }
}

export const DaggerheartTransformations = () => {
  const [transformationForm, setTransformationForm] = createStore({ name: '' });
  const [featureTransformation, setFeatureTransformation] = createSignal(undefined);

  const [transformations, setTransformations] = createSignal(undefined);
  const [modalMode, setModalMode] = createSignal(undefined);

  const [appState] = useAppState();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    const fetchTransformations = async () => await fetchDaggerheartTransformations(appState.accessToken);

    Promise.all([fetchTransformations()]).then(
      ([transformationsData]) => {
        setTransformations(transformationsData.transformations);
      }
    );
  });

  const openCreateTransformationModal = () => {
    batch(() => {
      setTransformationForm({ id: null, name: '' });
      setModalMode('transformationForm');
      openModal();
    });
  }

  const openChangeTransformationModal = (transformation) => {
    batch(() => {
      setTransformationForm({ id: transformation.id, name: transformation.name });
      setModalMode('transformationForm');
      openModal();
    });
  }

  const openCreateFeatureModal = (transformation) => {
    batch(() => {
      setFeatureTransformation(transformation);
      setModalMode('featureForm');
      openModal();
    });
  }

  const saveTransformation = () => {
    transformationForm.id === null ? createTransformation() : updateTransformation();
  }

  const createTransformation = async () => {
    const result = await createDaggerheartTransformation(appState.accessToken, { brewery: transformationForm });

    if (result.errors_list === undefined) {
      batch(() => {
        setTransformations([result.transformation].concat(transformations()));
        setTransformationForm({ id: null, name: '' });
        closeModal();
      });
    }
  }

  const updateTransformation = async () => {
    const result = await changeDaggerheartTransformation(appState.accessToken, transformationForm.id, { brewery: transformationForm, only_head: true });

    if (result.errors_list === undefined) {
      const newTransformations = transformations().map((item) => {
        if (transformationForm.id !== item.id) return item;

        return { ...item, name: transformationForm.name };
      });

      batch(() => {
        setTransformations(newTransformations);
        setTransformationForm({ id: null, name: '' });
        closeModal();
      });
    }
  }

  const removeTransformation = async (transformation) => {
    const result = await removeDaggerheartTransformation(appState.accessToken, transformation.id);

    if (result.errors_list === undefined) {
      setTransformations(transformations().filter(({ id }) => id !== transformation.id ));
    }
  }

  const createTransformationFeature = async (payload) => {
    const result = await createFeat(appState.accessToken, 'daggerheart', payload);

    if (result.errors_list === undefined) {
      const transformation = await fetchDaggerheartTransformation(appState.accessToken, featureTransformation().id)

      if (transformation.errors_list === undefined) {
        const newTransformations = transformations().map((item) => {
          if (featureTransformation().id !== item.id) return item;

          return { ...item, ...transformation.transformation };
        });

        batch(() => {
          setTransformations(newTransformations);
          setFeatureTransformation(undefined);
          setModalMode(undefined);
          closeModal();
        });
      }
    }
  }

  const removeFeature = async (feature) => {
    const result = await removeFeat(appState.accessToken, 'daggerheart', feature.id);

    if (result.errors_list === undefined) {
      const transformation = await fetchDaggerheartTransformation(appState.accessToken, feature.origin_value)

      if (transformation.errors_list === undefined) {
        const newTransformations = transformations().map((item) => {
          if (feature.origin_value !== item.id) return item;

          return { ...item, ...transformation.transformation };
        });

        setTransformations(newTransformations);
      }
    }
  }

  return (
    <Show when={transformations() !== undefined} fallback={<></>}>
      <Button default classList="mb-4 px-2 py-1" onClick={openCreateTransformationModal}>{TRANSLATION[locale()].add}</Button>
      <div class="grid grid-cols-3 gap-4">
        <For each={transformations()}>
          {(transformation) =>
            <div class="blockable p-4 flex flex-col">
              <div class="flex-1">
                <p class="font-medium! mb-4 text-xl">{transformation.name}</p>
                <Button default small classList="mb-2 p-1" onClick={() => openCreateFeatureModal(transformation)}>
                  {TRANSLATION[locale()].addFeature}
                </Button>
                <For each={transformation.features}>
                  {(feature) =>
                    <DaggerheartFeat feature={feature} onRemoveFeature={removeFeature} />
                  }
                </For>
              </div>
              <div class="flex items-center justify-end gap-x-2 text-neutral-700">
                <Button default classList="px-2 py-1" onClick={() => openChangeTransformationModal(transformation)}>
                  <Edit width="20" height="20" />
                </Button>
                <Button default classList="px-2 py-1" onClick={() => removeTransformation(transformation)}>
                  <Trash width="20" height="20" />
                </Button>
              </div>
            </div>
          }
        </For>
      </div>
      <Modal>
        <Show when={modalMode() === 'transformationForm'}>
          <p class="mb-2 text-xl">{TRANSLATION[locale()].newTransformationTitle}</p>
          <Input
            containerClassList="form-field mb-4"
            labelText={TRANSLATION[locale()].name}
            value={transformationForm.name}
            onInput={(value) => setTransformationForm({ ...transformationForm, name: value })}
          />
          <Button default classList="px-2 py-1" onClick={saveTransformation}>
            {TRANSLATION[locale()].save}
          </Button>
        </Show>
        <Show when={modalMode() === 'featureForm'}>
          <DaggerheartFeatForm origin="transformation" originValue={featureTransformation().id} onSave={createTransformationFeature} onCancel={closeModal} />
        </Show>
      </Modal>
    </Show>
  );
}
