import { createSignal, createEffect, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, Input, createModal, DaggerheartFeatForm, DaggerheartFeat, Toggle, Select } from '../../../components';
import { Edit, Trash, Stroke } from '../../../assets';
import { fetchDaggerheartBooks } from '../../../requests/fetchDaggerheartBooks';
import { changeBookContent } from '../../../requests/changeBookContent';
import { fetchDaggerheartDomains } from '../../../requests/fetchDaggerheartDomains';
import { fetchDaggerheartDomain } from '../../../requests/fetchDaggerheartDomain';
import { createDaggerheartDomain } from '../../../requests/createDaggerheartDomain';
import { changeDaggerheartDomain } from '../../../requests/changeDaggerheartDomain';
import { removeDaggerheartDomain } from '../../../requests/removeDaggerheartDomain';
import { createFeat } from '../../../requests/createFeat';
import { removeFeat } from '../../../requests/removeFeat';

const TRANSLATION = {
  en: {
    added: 'Content is added to the book',
    selectBook: 'Select book',
    selectBookHelp: 'Select required elements for adding to the book',
    add: 'Add domain',
    newDomainTitle: 'Domain form',
    name: 'Domain name',
    save: 'Save',
    addFeature: 'Add feature'
  },
  ru: {
    added: 'Контент добавлен в книгу',
    selectBook: 'Выберите книгу',
    selectBookHelp: 'Выберите необходимые элементы для добавления в книгу',
    add: 'Добавить домен',
    newDomainTitle: 'Редактирование домена',
    name: 'Название домена',
    save: 'Сохранить',
    addFeature: 'Добавить способность'
  }
}

export const DaggerheartDomains = () => {
  const [domainForm, setDomainForm] = createStore({ name: '' });
  const [featureDomain, setFeatureDomain] = createSignal(undefined);
  const [selectedIds, setSelectedIds] = createSignal([]);
  const [book, setBook] = createSignal(null);

  const [books, setBooks] = createSignal(undefined);
  const [domains, setDomains] = createSignal(undefined);
  const [modalMode, setModalMode] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    const fetchBooks = async () => await fetchDaggerheartBooks(appState.accessToken);
    const fetchDomains = async () => await fetchDaggerheartDomains(appState.accessToken);

    Promise.all([fetchDomains(), fetchBooks()]).then(
      ([domainsData, booksData]) => {
        batch(() => {
          setBooks(booksData.books.filter((item) => item.shared === null));
          setDomains(domainsData.domains);
        });
      }
    );
  });

  const openCreateDomainModal = () => {
    batch(() => {
      setDomainForm({ id: null, name: '' });
      setModalMode('domainForm');
      openModal();
    });
  }

  const openChangeDomainModal = (domain) => {
    batch(() => {
      setDomainForm({ id: domain.id, name: domain.name });
      setModalMode('domainForm');
      openModal();
    });
  }

  const openCreateFeatureModal = (domain) => {
    batch(() => {
      setFeatureDomain(domain);
      setModalMode('featureForm');
      openModal();
    });
  }

  const saveDomain = () => {
    domainForm.id === null ? createDomain() : updateDomain();
  }

  const createDomain = async () => {
    const result = await createDaggerheartDomain(appState.accessToken, { brewery: domainForm });

    if (result.errors_list === undefined) {
      batch(() => {
        setDomains([result.domain].concat(domains()));
        setDomainForm({ id: null, name: '' });
        closeModal();
      });
    } else renderAlerts(result.errors_list);
  }

  const updateDomain = async () => {
    const result = await changeDaggerheartDomain(appState.accessToken, domainForm.id, { brewery: domainForm, only_head: true });

    if (result.errors_list === undefined) {
      const newDomains = domains().map((item) => {
        if (domainForm.id !== item.id) return item;

        return { ...item, name: domainForm.name };
      });

      batch(() => {
        setDomains(newDomains);
        setDomainForm({ id: null, name: '' });
        closeModal();
      });
    } else renderAlerts(result.errors_list);
  }

  const removeDomain = async (domain) => {
    const result = await removeDaggerheartDomain(appState.accessToken, domain.id);

    if (result.errors_list === undefined) {
      setDomains(domains().filter(({ id }) => id !== domain.id ));
    } else renderAlerts(result.errors_list);
  }

  const createDomainFeature = async (payload) => {
    const result = await createFeat(appState.accessToken, 'daggerheart', payload);

    if (result.errors_list === undefined) {
      const domain = await fetchDaggerheartDomain(appState.accessToken, featureDomain().id)

      if (domain.errors_list === undefined) {
        const newDomains = domains().map((item) => {
          if (featureDomain().id !== item.id) return item;

          return { ...item, ...domain.domain };
        });

        batch(() => {
          setDomains(newDomains);
          setFeatureDomain(undefined);
          setModalMode(undefined);
          closeModal();
        });
      }
    } else renderAlerts(result.errors_list);
  }

  const removeFeature = async (feature) => {
    const result = await removeFeat(appState.accessToken, 'daggerheart', feature.id);

    if (result.errors_list === undefined) {
      const domain = await fetchDaggerheartDomain(appState.accessToken, feature.origin_value)

      if (domain.errors_list === undefined) {
        const newDomains = domains().map((item) => {
          if (feature.origin_value !== item.id) return item;

          return { ...item, ...domain.domain };
        });

        setDomains(newDomains);
      }
    } else renderAlerts(result.errors_list);
  }

  const addToBook = async () => {
    const result = await changeBookContent(appState.accessToken, book(), { ids: selectedIds(), only_head: true }, 'domain');

    if (result.errors_list === undefined) {
      batch(() => {
        setBook(null);
        setSelectedIds([]);
      });
      renderNotice(TRANSLATION[locale()].added)
    }
  }

  return (
    <Show when={domains() !== undefined} fallback={<></>}>
      <Button default classList="mb-4 px-2 py-1" onClick={openCreateDomainModal}>{TRANSLATION[locale()].add}</Button>
      <Show when={domains().length > 0}>
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
      </Show>
      <For each={domains()}>
        {(domain) =>
          <Toggle title={domain.name}>
            <div class="py-4 flex flex-col">
              <div class="flex items-center justify-between">
                <Button default small classList="mb-2 p-1" onClick={() => openCreateFeatureModal(domain)}>
                  {TRANSLATION[locale()].addFeature}
                </Button>
                <div class="flex items-center justify-between gap-x-2 text-neutral-700">
                  <Button
                    default
                    classList="p-2"
                    onClick={() => selectedIds().includes(domain.id) ? setSelectedIds(selectedIds().filter((id) => id !== domain.id)) : setSelectedIds(selectedIds().concat(domain.id))}
                  >
                    <span classList={{ 'opacity-25': !selectedIds().includes(domain.id) }}>
                      <Stroke width="16" height="12" />
                    </span>
                  </Button>
                  <Button default classList="px-2 py-1" onClick={() => openChangeDomainModal(domain)}>
                    <Edit width="20" height="20" />
                  </Button>
                  <Button default classList="px-2 py-1" onClick={() => removeDomain(domain)}>
                    <Trash width="20" height="20" />
                  </Button>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <For each={domain.features}>
                {(feature) =>
                  <div class="blockable p-4 flex flex-col">
                    <DaggerheartFeat feature={feature} onRemoveFeature={removeFeature} />
                  </div>
                }
              </For>
            </div>
          </Toggle>
        }
      </For>
      <Modal>
        <Show when={modalMode() === 'domainForm'}>
          <p class="mb-2 text-xl">{TRANSLATION[locale()].newDomainTitle}</p>
          <Input
            containerClassList="form-field mb-4"
            labelText={TRANSLATION[locale()].name}
            value={domainForm.name}
            onInput={(value) => setDomainForm({ ...domainForm, name: value })}
          />
          <Button default classList="px-2 py-1" onClick={saveDomain}>
            {TRANSLATION[locale()].save}
          </Button>
        </Show>
        <Show when={modalMode() === 'featureForm'}>
          <DaggerheartFeatForm origin="domain_card" originValue={featureDomain().id} onSave={createDomainFeature} onCancel={closeModal} />
        </Show>
      </Modal>
    </Show>
  );
}
