import { createSignal, createEffect, Show, For, batch } from 'solid-js';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, createModal, DaggerheartFeatForm, Select } from '../../../components';
import { Trash } from '../../../assets';
import { translate } from '../../../helpers';
import { fetchDaggerheartFeatures } from '../../../requests/fetchDaggerheartFeatures';
import { createFeat } from '../../../requests/createFeat';
import { removeFeat } from '../../../requests/removeFeat';

import { fetchCharactersRequest } from '../../../../CharKeeperApp/requests/fetchCharactersRequest';

const TRANSLATION = {
  en: {
    newFeatureTitle: 'Selecting feature origin',
    add: 'Add feature',
    origin: "Feature's origin",
    selectCharacter: 'Select character'
  },
  ru: {
    newFeatureTitle: 'Выбор принадлежности способности',
    add: 'Добавить способность',
    origin: 'Принадлежность способности',
    selectCharacter: 'Выберите персонажа'
  }
}

export const DaggerheartFeatures = () => {
  const [origin, setOrigin] = createSignal(null);
  const [characterId, setCharacterId] = createSignal(null);

  const [characters, setCharacters] = createSignal(undefined);
  const [features, setFeatures] = createSignal([]);

  const [appState] = useAppState();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();
  const [{ renderAlerts }] = useAppAlert();

  createEffect(() => {
    if (characters() !== undefined) return;

    const fetchFeatures = async () => await fetchDaggerheartFeatures(appState.accessToken);
    const fetchCharacters = async () => await fetchCharactersRequest(appState.accessToken);

    Promise.all([fetchFeatures(), fetchCharacters()]).then(
      ([featuresData, charactersData]) => {
        batch(() => {
          setFeatures(featuresData.feats.filter((item) => item.origin === 'character'));
          setCharacters(charactersData.characters.filter((item) => item.provider === 'daggerheart').reduce((acc, item) => { acc[item.id] = item.name; return acc; }, {}));
        });
      }
    );
  });

  const createFeature = async (payload) => {
    const result = await createFeat(appState.accessToken, 'daggerheart', payload);

    if (result.errors_list === undefined) {
      batch(() => {
        setFeatures([result.feat].concat(features()));
        setOrigin(null);
        setCharacterId(null);
        closeModal();
      });
    } else renderAlerts(result.errors_list);
  }

  const removeFeature = async (feature) => {
    const result = await removeFeat(appState.accessToken, 'daggerheart', feature.id);

    if (result.errors_list === undefined) {
      setFeatures(features().filter((item) => item.id !== feature.id));
    } else renderAlerts(result.errors_list);
  }

  return (
    <Show when={characters() !== undefined} fallback={<></>}>
      <Button default classList="mb-4 px-2 py-1" onClick={openModal}>{TRANSLATION[locale()].add}</Button>
      <Show when={features().length > 0}>
        
        <table class="w-full table">
          <thead>
            <tr class="text-sm">
              <td class="p-1" />
              <td class="p-1" />
              <td class="p-1" />
            </tr>
          </thead>
          <tbody>
            <For each={features()}>
              {(feature) =>
                <tr>
                  <td class="minimum-width py-1">{feature.title[locale()]}</td>
                  <td class="py-1">{feature.description[locale()]}</td>
                  <td>
                    <div class="flex items-center justify-end gap-x-2 text-neutral-700">
                      <Button default classList="px-2 py-1" onClick={() => removeFeature(feature)}>
                        <Trash width="20" height="20" />
                      </Button>
                    </div>
                  </td>
                </tr>
              }
            </For>
          </tbody>
        </table>

      </Show>
      <Modal>
        <p class="text-xl">{TRANSLATION[locale()].newFeatureTitle}</p>
        <Select
          relative
          containerClassList="mt-2"
          labelText={TRANSLATION[locale()].origin}
          items={translate({ "character": { "name": { "en": "Character", "ru": "Персонаж" } } }, locale())}
          selectedValue={origin()}
          onSelect={(value) => setOrigin(value)}
        />
        <Show when={origin() === 'character'}>
          <Select
            relative
            containerClassList="mt-2 mb-2"
            labelText={TRANSLATION[locale()].selectCharacter}
            items={characters()}
            selectedValue={characterId()}
            onSelect={setCharacterId}
          />
        </Show>
        <Show when={characterId()}>
          <DaggerheartFeatForm origin="character" originValue={characterId()} onSave={createFeature} onCancel={closeModal} />
        </Show>
      </Modal>
    </Show>
  );
}
