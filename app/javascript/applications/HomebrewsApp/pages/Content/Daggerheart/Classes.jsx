import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import config from '../../../../CharKeeperApp/data/daggerheart.json';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, Input, createModal, DaggerheartFeatForm, DaggerheartFeat, Select } from '../../../components';
import { Edit, Trash } from '../../../assets';
import { fetchHomebrewsList } from '../../../requests/fetchHomebrewsList';
import { fetchDaggerheartSpecialities } from '../../../requests/fetchDaggerheartSpecialities';
import { fetchDaggerheartSpeciality } from '../../../requests/fetchDaggerheartSpeciality';
import { createDaggerheartSpeciality } from '../../../requests/createDaggerheartSpeciality';
import { changeDaggerheartSpeciality } from '../../../requests/changeDaggerheartSpeciality';
import { removeDaggerheartSpeciality } from '../../../requests/removeDaggerheartSpeciality';
import { createFeat } from '../../../requests/createFeat';
import { removeFeat } from '../../../requests/removeFeat';
import { translate } from '../../../helpers';

const TRANSLATION = {
  en: {
    add: 'Add class',
    newspecialityTitle: 'Class form',
    name: 'Class name',
    save: 'Save',
    addFeature: 'Add feature',
    evasion: 'Evasion',
    healthMax: 'Starting health',
    domains: 'Domains'
  },
  ru: {
    add: 'Добавить класс',
    newspecialityTitle: 'Редактирование класса',
    name: 'Название класса',
    save: 'Сохранить',
    addFeature: 'Добавить способность',
    evasion: 'Уклонение',
    healthMax: 'Здоровье',
    domains: 'Домены'
  }
}

export const DaggerheartClasses = () => {
  const [specialityForm, setSpecialityForm] = createStore({
    name: '',
    domains: [],
    evasion: 10,
    health_max: 6
  });
  const [featureSpeciality, setFeatureSpeciality] = createSignal(undefined);

  const [specialities, setSpecialities] = createSignal(undefined);
  const [modalMode, setModalMode] = createSignal(undefined);
  const [homebrews, setHomebrews] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    const fetchHomebrews = async () => await fetchHomebrewsList(appState.accessToken, 'daggerheart');
    const fetchSpecialities = async () => await fetchDaggerheartSpecialities(appState.accessToken);

    Promise.all([fetchSpecialities(), fetchHomebrews()]).then(
      ([specialitiesData, homebrewsData]) => {
        batch(() => {
          setSpecialities(specialitiesData.specialities);
          setHomebrews(homebrewsData);
        });
      }
    );
  });

  const daggerheartDomains = createMemo(() => {
    const result = translate(config.domains, locale());
    if (homebrews() === undefined) return result;

    return { ...result, ...homebrews().domains.reduce((acc, item) => { acc[item.id] = item.name; return acc; }, {}) };
  });

  const openCreateSpecialityModal = () => {
    batch(() => {
      setSpecialityForm({ id: null, name: '' });
      setModalMode('specialityForm');
      openModal();
    });
  }

  const openChangeSpecialityModal = (speciality) => {
    batch(() => {
      setSpecialityForm({ id: speciality.id, name: speciality.name, domains: speciality.domains, evasion: speciality.evasion, health_max: speciality.health_max });
      setModalMode('specialityForm');
      openModal();
    });
  }

  const openCreateFeatureModal = (speciality) => {
    batch(() => {
      setFeatureSpeciality(speciality);
      setModalMode('featureForm');
      openModal();
    });
  }

  const updateMultiFeatureValue = (value) => {
    const currentValues = specialityForm.domains;
    const newValue = currentValues.includes(value) ? currentValues.filter((item) => item !== value) : currentValues.concat([value]);
    setSpecialityForm({ ...specialityForm, domains: newValue });
  }

  const saveSpeciality = () => {
    specialityForm.id === null ? createSpeciality() : updateSpeciality();
  }

  const createSpeciality = async () => {
    const result = await createDaggerheartSpeciality(appState.accessToken, { brewery: specialityForm });

    if (result.errors_list === undefined) {
      batch(() => {
        setSpecialities([result.speciality].concat(specialities()));
        setSpecialityForm({ id: null, name: '' });
        closeModal();
      });
    } else renderAlerts(result.errors_list);
  }

  const updateSpeciality = async () => {
    const result = await changeDaggerheartSpeciality(appState.accessToken, specialityForm.id, { brewery: specialityForm, only_head: true });

    if (result.errors_list === undefined) {
      const newSpecialities = specialities().map((item) => {
        if (specialityForm.id !== item.id) return item;

        return { ...item, name: specialityForm.name };
      });

      batch(() => {
        setSpecialities(newSpecialities);
        setSpecialityForm({ id: null, name: '' });
        closeModal();
      });
    } else renderAlerts(result.errors_list);
  }

  const removeSpeciality = async (speciality) => {
    const result = await removeDaggerheartSpeciality(appState.accessToken, speciality.id);

    if (result.errors_list === undefined) {
      setSpecialities(specialities().filter(({ id }) => id !== speciality.id ));
    } else renderAlerts(result.errors_list);
  }

  const createSpecialityFeature = async (payload) => {
    const result = await createFeat(appState.accessToken, 'daggerheart', payload);

    if (result.errors_list === undefined) {
      const speciality = await fetchDaggerheartSpeciality(appState.accessToken, featureSpeciality().id)

      if (speciality.errors_list === undefined) {
        const newSpecialities = specialities().map((item) => {
          if (featureSpeciality().id !== item.id) return item;

          return { ...item, ...speciality.speciality };
        });

        batch(() => {
          setSpecialities(newSpecialities);
          setFeatureSpeciality(undefined);
          setModalMode(undefined);
          closeModal();
        });
      }
    } else renderAlerts(result.errors_list);
  }

  const removeFeature = async (feature) => {
    const result = await removeFeat(appState.accessToken, 'daggerheart', feature.id);

    if (result.errors_list === undefined) {
      const speciality = await fetchDaggerheartSpeciality(appState.accessToken, feature.origin_value)

      if (speciality.errors_list === undefined) {
        const newSpecialities = specialities().map((item) => {
          if (feature.origin_value !== item.id) return item;

          return { ...item, ...speciality.speciality };
        });

        setSpecialities(newSpecialities);
      } else renderAlerts(result.errors_list);
    } else renderAlerts(result.errors_list);
  }

  return (
    <Show when={specialities() !== undefined} fallback={<></>}>
      <Button default classList="mb-4 px-2 py-1" onClick={openCreateSpecialityModal}>{TRANSLATION[locale()].add}</Button>
      <div class="grid grid-cols-3 gap-4">
        <For each={specialities()}>
          {(speciality) =>
            <div class="blockable p-4 flex flex-col">
              <div class="flex-1">
                <p class="font-medium! mb-2 text-xl">{speciality.name}</p>
                <p class="mb-1">{TRANSLATION[locale()].evasion} {speciality.evasion}</p>
                <p class="mb-1">{TRANSLATION[locale()].healthMax} {speciality.health_max}</p>
                <p class="mb-4">{TRANSLATION[locale()].domains} - {speciality.domains.map((item) => daggerheartDomains()[item]).join(', ')}</p>
                <Button default small classList="mb-2 p-1" onClick={() => openCreateFeatureModal(speciality)}>
                  {TRANSLATION[locale()].addFeature}
                </Button>
                <For each={speciality.features}>
                  {(feature) =>
                    <DaggerheartFeat feature={feature} onRemoveFeature={removeFeature} />
                  }
                </For>
              </div>
              <div class="flex items-center justify-end gap-x-2 text-neutral-700">
                <Button default classList="px-2 py-1" onClick={() => openChangeSpecialityModal(speciality)}>
                  <Edit width="20" height="20" />
                </Button>
                <Button default classList="px-2 py-1" onClick={() => removeSpeciality(speciality)}>
                  <Trash width="20" height="20" />
                </Button>
              </div>
            </div>
          }
        </For>
      </div>
      <Modal>
        <Show when={modalMode() === 'specialityForm'}>
          <p class="mb-2 text-xl">{TRANSLATION[locale()].newSpecialityTitle}</p>
          <Input
            containerClassList="form-field mb-2"
            labelText={TRANSLATION[locale()].name}
            value={specialityForm.name}
            onInput={(value) => setSpecialityForm({ ...specialityForm, name: value })}
          />
          <Select
            containerClassList="flex-1 mb-2"
            labelText={TRANSLATION[locale()].evasion}
            items={{ 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 12 }}
            selectedValue={specialityForm.evasion}
            onSelect={(value) => setSpecialityForm({ ...specialityForm, evasion: value })}
          />
          <Select
            containerClassList="flex-1 mb-2"
            labelText={TRANSLATION[locale()].healthMax}
            items={{ 4: 4, 5: 5, 6: 6, 7: 7, 8: 8 }}
            selectedValue={specialityForm.health_max}
            onSelect={(value) => setSpecialityForm({ ...specialityForm, health_max: value })}
          />
          <Select
            multi
            containerClassList="mb-4"
            labelText={TRANSLATION[locale()].domains}
            items={daggerheartDomains()}
            selectedValues={specialityForm.domains}
            onSelect={(value) => updateMultiFeatureValue(value)}
          />
          <Button default classList="px-2 py-1" onClick={saveSpeciality}>
            {TRANSLATION[locale()].save}
          </Button>
        </Show>
        <Show when={modalMode() === 'featureForm'}>
          <DaggerheartFeatForm origin="class" originValue={featureSpeciality().id} onSave={createSpecialityFeature} onCancel={closeModal} />
        </Show>
      </Modal>
    </Show>
  );
}
