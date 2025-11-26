import { createSignal, createEffect, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useAppState, useAppLocale } from '../../../context';
import { Button, Input, createModal, DaggerheartFeatForm, DaggerheartFeat } from '../../../components';
import { Edit, Trash } from '../../../assets';
import { fetchDaggerheartDomains } from '../../../requests/fetchDaggerheartDomains';
import { fetchDaggerheartDomain } from '../../../requests/fetchDaggerheartDomain';
import { createDaggerheartDomain } from '../../../requests/createDaggerheartDomain';
import { changeDaggerheartDomain } from '../../../requests/changeDaggerheartDomain';
import { removeDaggerheartDomain } from '../../../requests/removeDaggerheartDomain';
import { createFeat } from '../../../requests/createFeat';
import { removeFeat } from '../../../requests/removeFeat';

const TRANSLATION = {
  en: {
    add: 'Add domain',
    newDomainTitle: 'Domain form',
    name: 'Domain name',
    save: 'Save',
    addFeature: 'Add feature'
  },
  ru: {
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

  const [domains, setDomains] = createSignal(undefined);
  const [modalMode, setModalMode] = createSignal(undefined);

  const [appState] = useAppState();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    const fetchDomains = async () => await fetchDaggerheartDomains(appState.accessToken);

    Promise.all([fetchDomains()]).then(
      ([domainsData]) => {
        setDomains(domainsData.domains);
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
    }
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
    }
  }

  const removeDomain = async (domain) => {
    const result = await removeDaggerheartDomain(appState.accessToken, domain.id);

    if (result.errors_list === undefined) {
      setDomains(domains().filter(({ id }) => id !== domain.id ));
    }
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
    }
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
    }
  }

  return (
    <Show when={domains() !== undefined} fallback={<></>}>
      <Button default classList="mb-4 px-2 py-1" onClick={openCreateDomainModal}>{TRANSLATION[locale()].add}</Button>
      <For each={domains()}>
        {(domain) =>
          <>
            <div class="p-4 flex flex-col">
              <p class="font-medium! mb-4 text-xl">{domain.name}</p>
              <div class="flex items-center justify-between">
                <Button default small classList="mb-2 p-1" onClick={() => openCreateFeatureModal(domain)}>
                  {TRANSLATION[locale()].addFeature}
                </Button>
                <div class="flex items-center justify-between gap-x-2 text-neutral-700">
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
          </>
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
