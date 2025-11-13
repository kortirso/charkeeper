import { createSignal, createEffect, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useAppState, useAppLocale } from '../../../context';
import { Button, Input, createModal, DaggerheartFeatForm, DaggerheartFeat } from '../../../components';
import { Edit, Trash } from '../../../assets';
import { fetchDaggerheartCommunities } from '../../../requests/fetchDaggerheartCommunities';
import { fetchDaggerheartCommunity } from '../../../requests/fetchDaggerheartCommunity';
import { createDaggerheartCommunity } from '../../../requests/createDaggerheartCommunity';
import { changeDaggerheartCommunity } from '../../../requests/changeDaggerheartCommunity';
import { removeDaggerheartCommunity } from '../../../requests/removeDaggerheartCommunity';
import { createFeat } from '../../../requests/createFeat';
import { removeFeat } from '../../../requests/removeFeat';

const TRANSLATION = {
  en: {
    add: 'Add community',
    newCommunityTitle: 'Community form',
    name: 'Community name',
    save: 'Save',
    addFeature: 'Add feature'
  },
  ru: {
    add: 'Добавить общество',
    newCommunityTitle: 'Редактирование общества',
    name: 'Название общества',
    save: 'Сохранить',
    addFeature: 'Добавить способность'
  }
}

export const DaggerheartCommunities = () => {
  const [communityForm, setCommunityForm] = createStore({ name: '' });
  const [featureCommunity, setFeatureCommunity] = createSignal(undefined);

  const [communities, setCommunities] = createSignal(undefined);
  const [modalMode, setModalMode] = createSignal(undefined);

  const [appState] = useAppState();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    const fetchCommunities = async () => await fetchDaggerheartCommunities(appState.accessToken);

    Promise.all([fetchCommunities()]).then(
      ([communitiesData]) => {
        setCommunities(communitiesData.communities);
      }
    );
  });

  const openCreateCommunityModal = () => {
    batch(() => {
      setCommunityForm({ id: null, name: '' });
      setModalMode('communityForm');
      openModal();
    });
  }

  const openChangeCommunityModal = (community) => {
    batch(() => {
      setCommunityForm({ id: community.id, name: community.name });
      setModalMode('communityForm');
      openModal();
    });
  }

  const openCreateFeatureModal = (community) => {
    batch(() => {
      setFeatureCommunity(community);
      setModalMode('featureForm');
      openModal();
    });
  }

  const saveCommunity = () => {
    communityForm.id === null ? createCommunity() : updateCommunity();
  }

  const createCommunity = async () => {
    const result = await createDaggerheartCommunity(appState.accessToken, { brewery: communityForm });

    if (result.errors_list === undefined) {
      batch(() => {
        setCommunities([result.community].concat(communities()));
        setCommunityForm({ id: null, name: '' });
        closeModal();
      });
    }
  }

  const updateCommunity = async () => {
    const result = await changeDaggerheartCommunity(appState.accessToken, communityForm.id, { brewery: communityForm, only_head: true });

    if (result.errors_list === undefined) {
      const newCommunities = communities().map((item) => {
        if (communityForm.id !== item.id) return item;

        return { ...item, name: communityForm.name };
      });

      batch(() => {
        setCommunities(newCommunities);
        setCommunityForm({ id: null, name: '' });
        closeModal();
      });
    }
  }

  const removeCommunity = async (community) => {
    const result = await removeDaggerheartCommunity(appState.accessToken, community.id);

    if (result.errors_list === undefined) {
      setCommunities(communities().filter(({ id }) => id !== community.id ));
    }
  }

  const createCommunityFeature = async (payload) => {
    const result = await createFeat(appState.accessToken, 'daggerheart', payload);

    if (result.errors_list === undefined) {
      const community = await fetchDaggerheartCommunity(appState.accessToken, featureCommunity().id)

      if (community.errors_list === undefined) {
        const newCommunities = communities().map((item) => {
          if (featureCommunity().id !== item.id) return item;

          return { ...item, ...community.community };
        });

        batch(() => {
          setCommunities(newCommunities);
          setFeatureCommunity(undefined);
          setModalMode(undefined);
          closeModal();
        });
      }
    }
  }

  const removeFeature = async (feature) => {
    const result = await removeFeat(appState.accessToken, 'daggerheart', feature.id);

    if (result.errors_list === undefined) {
      const community = await fetchDaggerheartCommunity(appState.accessToken, feature.origin_value)

      if (community.errors_list === undefined) {
        const newCommunities = communities().map((item) => {
          if (feature.origin_value !== item.id) return item;

          return { ...item, ...community.community };
        });

        setCommunities(newCommunities);
      }
    }
  }

  return (
    <Show when={communities() !== undefined} fallback={<></>}>
      <Button default classList="mb-4 px-2 py-1" onClick={openCreateCommunityModal}>{TRANSLATION[locale()]['add']}</Button>
      <div class="grid grid-cols-3 gap-4">
        <For each={communities()}>
          {(community) =>
            <div class="blockable p-4 flex flex-col">
              <div class="flex-1">
                <p class="font-medium! mb-4 text-xl">{community.name}</p>
                <Show when={community.features.length < 1}>
                  <Button default small classList="mb-2 p-1" onClick={() => openCreateFeatureModal(community)}>
                    {TRANSLATION[locale()]['addFeature']}
                  </Button>
                </Show>
                <For each={community.features}>
                  {(feature) =>
                    <DaggerheartFeat feature={feature} onRemoveFeature={removeFeature} />
                  }
                </For>
              </div>
              <div class="flex items-center justify-end gap-x-2 text-neutral-700">
                <Button default classList="px-2 py-1" onClick={() => openChangeCommunityModal(community)}>
                  <Edit width="20" height="20" />
                </Button>
                <Button default classList="px-2 py-1" onClick={() => removeCommunity(community)}>
                  <Trash width="20" height="20" />
                </Button>
              </div>
            </div>
          }
        </For>
      </div>
      <Modal>
        <Show when={modalMode() === 'communityForm'}>
          <p class="mb-2 text-xl">{TRANSLATION[locale()]['newCommunityTitle']}</p>
          <Input
            containerClassList="form-field mb-4"
            labelText={TRANSLATION[locale()]['name']}
            value={communityForm.name}
            onInput={(value) => setCommunityForm({ ...communityForm, name: value })}
          />
          <Button default classList="px-2 py-1" onClick={saveCommunity}>
            {TRANSLATION[locale()]['save']}
          </Button>
        </Show>
        <Show when={modalMode() === 'featureForm'}>
          <DaggerheartFeatForm origin="community" originValue={featureCommunity().id} onSave={createCommunityFeature} onCancel={closeModal} />
        </Show>
      </Modal>
    </Show>
  );
}
