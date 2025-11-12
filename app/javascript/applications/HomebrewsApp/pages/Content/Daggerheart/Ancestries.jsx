import { createSignal, createEffect, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useAppState, useAppLocale } from '../../../context';
import { Button, Input, createModal, DaggerheartFeat } from '../../../components';
import { Edit, Trash } from '../../../assets';
import { fetchDaggerheartAncestries } from '../../../requests/fetchDaggerheartAncestries';
import { fetchDaggerheartAncestry } from '../../../requests/fetchDaggerheartAncestry';
import { createDaggerheartAncestry } from '../../../requests/createDaggerheartAncestry';
import { changeDaggerheartAncestry } from '../../../requests/changeDaggerheartAncestry';
import { removeDaggerheartAncestry } from '../../../requests/removeDaggerheartAncestry';
import { createFeat } from '../../../requests/createFeat';
import { removeFeat } from '../../../requests/removeFeat';

const TRANSLATION = {
  en: {
    add: 'Add ancestry',
    newAncestryTitle: 'Ancestry form',
    name: 'Ancestry name',
    save: 'Save',
    addFeature: 'Add feature'
  },
  ru: {
    add: 'Добавить расу',
    newAncestryTitle: 'Редактирование расы',
    name: 'Название расы',
    save: 'Сохранить',
    addFeature: 'Добавить способность'
  }
}

export const DaggerheartAncestries = () => {
  const [ancestryForm, setAncestryForm] = createStore({ name: '' });
  const [featureAncestry, setFeatureAncestry] = createSignal(undefined);

  const [ancestries, setAncestries] = createSignal(undefined);
  const [modalMode, setModalMode] = createSignal(undefined);

  const [appState] = useAppState();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    const fetchAncestries = async () => await fetchDaggerheartAncestries(appState.accessToken);

    Promise.all([fetchAncestries()]).then(
      ([ancestriesData]) => {
        setAncestries(ancestriesData.ancestries);
      }
    );
  });

  const openCreateAncestryModal = () => {
    batch(() => {
      setAncestryForm({ id: null, name: '' });
      setModalMode('ancestryForm');
      openModal();
    });
  }

  const openChangeAncestryModal = (ancestry) => {
    batch(() => {
      setAncestryForm({ id: ancestry.id, name: ancestry.name });
      setModalMode('ancestryForm');
      openModal();
    });
  }

  const openCreateFeatureModal = (ancestry) => {
    batch(() => {
      setFeatureAncestry(ancestry);
      setModalMode('featureForm');
      openModal();
    });
  }

  const saveAncestry = () => {
    ancestryForm.id === null ? createAncestry() : updateAncestry();
  }

  const createAncestry = async () => {
    const result = await createDaggerheartAncestry(appState.accessToken, { brewery: ancestryForm });

    if (result.errors_list === undefined) {
      batch(() => {
        setAncestries([result.ancestry].concat(ancestries()));
        setAncestryForm({ id: null, name: '' });
        closeModal();
      });
    }
  }

  const updateAncestry = async () => {
    const result = await changeDaggerheartAncestry(appState.accessToken, ancestryForm.id, { brewery: ancestryForm, only_head: true });

    if (result.errors_list === undefined) {
      const newAncestries = ancestries().map((item) => {
        if (ancestryForm.id !== item.id) return item;

        return { ...item, name: ancestryForm.name };
      });

      batch(() => {
        setAncestries(newAncestries);
        setAncestryForm({ id: null, name: '' });
        closeModal();
      });
    }
  }

  const removeAncestry = async (ancestry) => {
    const result = await removeDaggerheartAncestry(appState.accessToken, ancestry.id);

    if (result.errors_list === undefined) {
      setAncestries(ancestries().filter(({ id }) => id !== ancestry.id ));
    }
  }

  const createAncestryFeature = async (payload) => {
    const result = await createFeat(appState.accessToken, 'daggerheart', payload);

    if (result.errors_list === undefined) {
      const ancestry = await fetchDaggerheartAncestry(appState.accessToken, featureAncestry().id)

      if (ancestry.errors_list === undefined) {
        const newAncestries = ancestries().map((item) => {
          if (featureAncestry().id !== item.id) return item;

          return { ...item, ...ancestry.ancestry };
        });

        batch(() => {
          setAncestries(newAncestries);
          setFeatureAncestry(undefined);
          setModalMode(undefined);
          closeModal();
        });
      }
    }
  }

  const removeFeature = async (feature) => {
    const result = await removeFeat(appState.accessToken, 'daggerheart', feature.id);

    if (result.errors_list === undefined) {
      const ancestry = await fetchDaggerheartAncestry(appState.accessToken, feature.origin_value)

      if (ancestry.errors_list === undefined) {
        const newAncestries = ancestries().map((item) => {
          if (feature.origin_value !== item.id) return item;

          return { ...item, ...ancestry.ancestry };
        });

        setAncestries(newAncestries);
      }
    }
  }

  return (
    <Show when={ancestries() !== undefined} fallback={<></>}>
      <Button default classList="mb-4 px-2 py-1" onClick={openCreateAncestryModal}>{TRANSLATION[locale()]['add']}</Button>
      <div class="grid grid-cols-3 gap-4">
        <For each={ancestries()}>
          {(ancestry) =>
            <div class="blockable p-4 flex flex-col">
              <div class="flex-1">
                <p class="font-medium! mb-4 text-xl">{ancestry.name}</p>
                <Show when={ancestry.features.length < 2}>
                  <Button default small classList="mb-2 p-1" onClick={() => openCreateFeatureModal(ancestry)}>
                    {TRANSLATION[locale()]['addFeature']}
                  </Button>
                </Show>
                <For each={ancestry.features}>
                  {(feature) =>
                    <div class="mb-4">
                      <p class="font-medium! mb-1">{feature.title.en}</p>
                      <p class="text-sm mb-2">{feature.description.en}</p>
                      <Button default classList="px-2 py-1" onClick={() => removeFeature(feature)}>
                        <Trash width="20" height="20" />
                      </Button>
                    </div>
                  }
                </For>
              </div>
              <div class="flex items-center justify-end gap-x-2 text-neutral-700">
                <Button default classList="px-2 py-1" onClick={() => openChangeAncestryModal(ancestry)}>
                  <Edit width="20" height="20" />
                </Button>
                <Button default classList="px-2 py-1" onClick={() => removeAncestry(ancestry)}>
                  <Trash width="20" height="20" />
                </Button>
              </div>
            </div>
          }
        </For>
      </div>
      <Modal>
        <Show when={modalMode() === 'ancestryForm'}>
          <p class="mb-2 text-xl">{TRANSLATION[locale()]['newAncestryTitle']}</p>
          <Input
            containerClassList="form-field mb-4"
            labelText={TRANSLATION[locale()]['name']}
            value={ancestryForm.name}
            onInput={(value) => setAncestryForm({ ...ancestryForm, name: value })}
          />
          <Button default classList="px-2 py-1" onClick={saveAncestry}>
            {TRANSLATION[locale()]['save']}
          </Button>
        </Show>
        <Show when={modalMode() === 'featureForm'}>
          <DaggerheartFeat origin="ancestry" originValue={featureAncestry().id} onSave={createAncestryFeature} onCancel={closeModal} />
        </Show>
      </Modal>
    </Show>
  );
}
