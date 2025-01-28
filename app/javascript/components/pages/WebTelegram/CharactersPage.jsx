import { createSignal, createEffect, For, Switch, Match, Show, batch } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { CharacterLink, CharacterView } from '../../../components';
import { createModal } from '../../molecules';
import { Select } from '../../atoms';

import { useAppState, useAppLocale } from '../../../context';
import { fetchCharactersRequest } from '../../../requests/fetchCharactersRequest';
import { createCharacterRequest } from '../../../requests/createCharacterRequest';

export const CharactersPage = () => {
  const [characters, setCharacters] = createSignal(undefined);
  const [platform, setPlatform] = createSignal(undefined);
  const [characterForm, setCharacterForm] = createStore({
    name: '',
    race: undefined,
    subrace: undefined,
    main_class: undefined,
    alignment: 'neutral'
  });

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (characters() !== undefined) return;

    const fetchCharacters = async () => await fetchCharactersRequest(appState.accessToken);

    Promise.all([fetchCharacters()]).then(
      ([charactersData]) => {
        setCharacters(charactersData.characters);
      }
    );
  });

  const saveCharacter = async () => {
    if (platform() === undefined) return;

    const result = await createCharacterRequest(appState.accessToken, platform(), { character: characterForm });
    
    if (result.errors === undefined) {
      batch(() => {
        setCharacters(characters().concat(result.character));
        setCharacterForm({ name: '', race: undefined, subrace: undefined, main_class: undefined, alignment: 'neutral' });
        closeModal();
      });
    }
  }

  // 453x750
  // 420x690
  return (
    <>
      <Switch>
        <Match when={Object.keys(appState.activePageParams).length === 0}>
          <div class="h-full flex flex-col">
            <div class="w-full flex justify-between items-center py-4 px-2 bg-white border-b border-gray">
              <div class="w-10" />
              <p class="flex-1 text-center">{t('characters.title')}</p>
              <div class="w-10 h-8 p-2 flex flex-col justify-between cursor-pointer" onClick={openModal}>
                <p class="w-full border border-black" />
                <p class="w-full border border-black" />
                <p class="w-full border border-black" />
              </div>
            </div>
            <div class="p-4 flex-1 overflow-y-scroll">
              <Show when={characters() !== undefined}>
                <For each={characters()}>
                  {(character) =>
                    <CharacterLink character={character} />
                  }
                </For>
              </Show>
            </div>
          </div>
        </Match>
        <Match when={appState.activePageParams.id}>
          <CharacterView />
        </Match>
      </Switch>
      <Modal>
        <div class="flex flex-col">
          <h2 class="mb-2 text-center">{t('newCharacter.title')}</h2>
          <Select
            classList="w-52 mb-2"
            labelText={t('newCharacter.platform')}
            items={{ 'dnd5': 'D&D 5' }}
            selectedValue={platform()}
            onSelect={(value) => setPlatform(value)}
          />
          <div class="mb-2 w-52">
            <label class="text-sm">{t('newCharacter.name')}</label>
            <input
              class="border border-gray-200 rounded py-2.5 px-2 text-sm"
              onInput={(e) => setCharacterForm({ ...characterForm, name: e.target.value })}
              value={characterForm.name}
            />
          </div>
          <Switch>
            <Match when={platform() === 'dnd5'}>
              <Select
                classList="w-52 mb-2"
                labelText={t('newCharacter.race')}
                items={dict().races}
                selectedValue={characterForm.race}
                onSelect={(value) => setCharacterForm({ ...characterForm, race: value })}
              />
              <Show when={dict().subraces[characterForm.race]}>
                <Select
                  classList="w-52 mb-2"
                  labelText={t('newCharacter.subrace')}
                  items={dict().subraces[characterForm.race]}
                  selectedValue={characterForm.subrace}
                  onSelect={(value) => setCharacterForm({ ...characterForm, subrace: value })}
                />
              </Show>
              <Select
                classList="w-52"
                labelText={t('newCharacter.mainClass')}
                items={dict().classes}
                selectedValue={characterForm.main_class}
                onSelect={(value) => setCharacterForm({ ...characterForm, main_class: value })}
              />
            </Match>
          </Switch>
          <button
            class="mt-4 py-2 px-4 bg-gray-200 rounded"
            onClick={saveCharacter}
          >{t('buttons.save')}</button>
        </div>
      </Modal>
    </>
  );
}
