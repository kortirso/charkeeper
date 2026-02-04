import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, Input, createModal, DaggerheartFeatForm, DaggerheartFeat, Select, Checkbox } from '../../../components';
import { Edit, Trash, Stroke, Copy, Plus } from '../../../assets';
import { fetchBooksRequest } from '../../../requests/books/fetchBooksRequest';
import { changeBookContent } from '../../../requests/changeBookContent';
import { fetchDaggerheartCommunities } from '../../../requests/fetchDaggerheartCommunities';
import { fetchDaggerheartCommunity } from '../../../requests/fetchDaggerheartCommunity';
import { createDaggerheartCommunity } from '../../../requests/createDaggerheartCommunity';
import { changeDaggerheartCommunity } from '../../../requests/changeDaggerheartCommunity';
import { removeDaggerheartCommunity } from '../../../requests/removeDaggerheartCommunity';
import { copyDaggerheartCommunity } from '../../../requests/copyDaggerheartCommunity';
import { createFeat } from '../../../requests/createFeat';
import { changeFeat } from '../../../requests/changeFeat';
import { removeFeat } from '../../../requests/removeFeat';

const TRANSLATION = {
  en: {
    added: 'Content is added to the book',
    selectBook: 'Select book',
    selectBookHelp: 'Select required elements for adding to the book',
    add: 'Add community',
    newCommunityTitle: 'Community form',
    name: 'Community name',
    save: 'Save',
    showPublic: 'Show public',
    public: 'Public',
    copyCompleted: 'Community copy is completed'
  },
  ru: {
    added: 'Контент добавлен в книгу',
    selectBook: 'Выберите книгу',
    selectBookHelp: 'Выберите необходимые элементы для добавления в книгу',
    add: 'Добавить общество',
    newCommunityTitle: 'Редактирование общества',
    name: 'Название общества',
    save: 'Сохранить',
    showPublic: 'Показать общедоступные',
    public: 'Общедоступная',
    copyCompleted: 'Копирование общества завершено'
  }
}

export const DaggerheartCommunities = () => {
  const [communityForm, setCommunityForm] = createStore({ name: '', public: false });
  const [featureCommunity, setFeatureCommunity] = createSignal(undefined);
  const [selectedIds, setSelectedIds] = createSignal([]);
  const [book, setBook] = createSignal(null);

  const [books, setBooks] = createSignal(undefined);
  const [communities, setCommunities] = createSignal(undefined);
  const [modalMode, setModalMode] = createSignal(undefined);
  const [open, setOpen] = createSignal(false);

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    const fetchBooks = async () => await fetchBooksRequest(appState.accessToken, 'daggerheart');
    const fetchCommunities = async () => await fetchDaggerheartCommunities(appState.accessToken);

    Promise.all([fetchCommunities(), fetchBooks()]).then(
      ([communitiesData, booksData]) => {
        batch(() => {
          setBooks(booksData.books.filter((item) => item.own));
          setCommunities(communitiesData.communities);
        });
      }
    );
  });

  const filteredCommunities = createMemo(() => {
    if (communities() === undefined) return [];

    return communities().filter(({ own }) => open() ? !own : own);
  });

  const openCreateCommunityModal = () => {
    batch(() => {
      setCommunityForm({ id: null, name: '', public: false });
      setModalMode('communityForm');
      openModal();
    });
  }

  const openChangeCommunityModal = (community) => {
    batch(() => {
      setCommunityForm({ id: community.id, name: community.name, public: community.public });
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
        setCommunityForm({ id: null, name: '', public: false });
        closeModal();
      });
    } else renderAlerts(result.errors_list);
  }

  const updateCommunity = async () => {
    const result = await changeDaggerheartCommunity(appState.accessToken, communityForm.id, { brewery: communityForm, only_head: true });

    if (result.errors_list === undefined) {
      const newCommunities = communities().map((item) => {
        if (communityForm.id !== item.id) return item;

        return { ...item, name: communityForm.name, public: communityForm.public };
      });

      batch(() => {
        setCommunities(newCommunities);
        setCommunityForm({ id: null, name: '', own: true, public: false });
        closeModal();
      });
    } else renderAlerts(result.errors_list);
  }

  const removeCommunity = async (community) => {
    const result = await removeDaggerheartCommunity(appState.accessToken, community.id);

    if (result.errors_list === undefined) {
      setCommunities(communities().filter(({ id }) => id !== community.id ));
    } else renderAlerts(result.errors_list);
  }

  const copyCommunity = async (communityId) => {
    const result = await copyDaggerheartCommunity(appState.accessToken, communityId);
    const community = await fetchDaggerheartCommunity(appState.accessToken, result.community.id)
    if (community.errors_list === undefined) {
      setCommunities([community.community].concat(communities()));
      renderNotice(TRANSLATION[locale()].copyCompleted);
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

  const updateFeature = async (id, originId, payload) => {
    const result = await changeFeat(appState.accessToken, 'daggerheart', id, payload);

    if (result.errors_list === undefined) {
      const community = await fetchDaggerheartCommunity(appState.accessToken, originId)

      if (community.errors_list === undefined) {
        const newCommunities = communities().map((item) => {
          if (originId !== item.id) return item;

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

  const addToBook = async () => {
    const result = await changeBookContent(appState.accessToken, book(), { ids: selectedIds(), only_head: true }, 'community');

    if (result.errors_list === undefined) {
      batch(() => {
        setBook(null);
        setSelectedIds([]);
      });
      renderNotice(TRANSLATION[locale()].added)
    }
  }

  return (
    <Show when={communities() !== undefined} fallback={<></>}>
      <div class="flex">
        <Button default classList="mb-4 px-2 py-1" onClick={openCreateCommunityModal}>{TRANSLATION[locale()].add}</Button>
        <Button default active={open()} classList="ml-4 mb-4 px-2 py-1" onClick={() => setOpen(!open())}>{TRANSLATION[locale()].showPublic}</Button>
      </div>
      <Show when={filteredCommunities().length > 0}>
        <div class="flex items-center">
          <Select
            containerClassList="w-40"
            labelText={TRANSLATION[locale()].selectBook}
            items={Object.fromEntries(books().filter(({ shared }) => shared === null).map((item) => [item.id, item.name]))}
            selectedValue={book()}
            onSelect={setBook}
          />
          <Show when={book() && selectedIds().length > 0}>
            <Button default classList="px-2 py-1 mt-6 ml-4" onClick={addToBook}>
              {TRANSLATION[locale()].save}
            </Button>
          </Show>
        </div>
        <p class="text-sm mt-1 mb-2">{TRANSLATION[locale()].selectBookHelp}</p>
        <div class="border border-gray-200 rounded border-b-0">
          <For each={filteredCommunities()}>
            {(community) =>
              <div class="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 rounded">
                <div class="col-span-3">
                  <p class="text-xl">{community.name}</p>
                </div>
                <div class="col-span-7">
                  <Show when={!open() && community.features.length < 1}>
                    <Button default small classList="mb-2 p-1" onClick={() => openCreateFeatureModal(community)}>
                      <Plus width="20" height="20" />
                    </Button>
                  </Show>
                  <For each={community.features}>
                    {(feature, index) =>
                      <div class="mb-2">
                        <DaggerheartFeat
                          open={open()}
                          feature={feature}
                          index={index()}
                          originId={community.id}
                          onRemoveFeature={removeFeature}
                          updateFeature={updateFeature}
                        />
                      </div>
                    }
                  </For>
                </div>
                <div class="col-span-2 flex items-start justify-end gap-2">
                  <Show
                    when={!open()}
                    fallback={
                      <Button default classList="px-2 py-1" onClick={() => copyCommunity(community.id)}>
                        <Copy width="20" height="20" />
                      </Button>
                    }
                  >
                    <Button
                      default
                      classList="p-2"
                      onClick={() => selectedIds().includes(community.id) ? setSelectedIds(selectedIds().filter((id) => id !== community.id)) : setSelectedIds(selectedIds().concat(community.id))}
                    >
                      <span classList={{ 'opacity-25': !selectedIds().includes(community.id) }}>
                        <Stroke width="16" height="12" />
                      </span>
                    </Button>
                    <Button default classList="px-2 py-1" onClick={() => openChangeCommunityModal(community)}>
                      <Edit width="20" height="20" />
                    </Button>
                    <Button default classList="px-2 py-1" onClick={() => removeCommunity(community)}>
                      <Trash width="20" height="20" />
                    </Button>
                  </Show>
                </div>
              </div>
            }
          </For>
        </div>
      </Show>
      <Modal>
        <Show when={modalMode() === 'communityForm'}>
          <p class="mb-2 text-xl">{TRANSLATION[locale()].newCommunityTitle}</p>
          <Input
            containerClassList="form-field mb-4"
            labelText={TRANSLATION[locale()].name}
            value={communityForm.name}
            onInput={(value) => setCommunityForm({ ...communityForm, name: value })}
          />
          <Checkbox
            labelText={TRANSLATION[locale()].public}
            labelPosition="right"
            labelClassList="ml-2"
            checked={communityForm.public}
            classList="mb-4"
            onToggle={() => setCommunityForm({ ...communityForm, public: !communityForm.public })}
          />
          <Button default classList="px-2 py-1" onClick={saveCommunity}>
            {TRANSLATION[locale()].save}
          </Button>
        </Show>
        <Show when={modalMode() === 'featureForm'}>
          <DaggerheartFeatForm origin="community" originValue={featureCommunity().id} onSave={createCommunityFeature} onCancel={closeModal} />
        </Show>
      </Modal>
    </Show>
  );
}
