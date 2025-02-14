import { createSignal, createEffect, For, Switch, Match, Show, batch } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { createModal, PageHeader } from '../molecules';
import { Select, Input, IconButton, Button } from '../atoms';

import { Close } from '../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { fetchCharactersRequest } from '../../requests/fetchCharactersRequest';
import { createCharacterRequest } from '../../requests/createCharacterRequest';
import { removeCharacterRequest } from '../../requests/removeCharacterRequest';

const CHARACTER_SIZES = {
  'human': ['medium', 'small'],
  'dwarf': ['medium'],
  'elf': ['medium'],
  'halfling': ['small'],
  'dragonborn': ['medium'],
  'gnome': ['small'],
  'orc': ['medium'],
  'tiefling': ['medium', 'small'],
  'aasimar': ['medium', 'small'],
  'goliath': ['medium']
}

export const CharactersPage = () => {
  const [currentTab, setCurrentTab] = createSignal('characters');
  const [characters, setCharacters] = createSignal(undefined);
  const [platform, setPlatform] = createSignal(undefined);
  const [deletingCharacterId, setDeletingCharacterId] = createSignal(undefined);
  const [characterDnd5Form, setCharacterDnd5Form] = createStore({
    name: '',
    race: undefined,
    subrace: undefined,
    main_class: undefined,
    alignment: 'neutral'
  });
  const [characterDnd2024Form, setCharacterDnd2024Form] = createStore({
    name: '',
    species: undefined,
    size: undefined,
    main_class: undefined,
    alignment: 'neutral'
  });

  const { Modal, openModal, closeModal } = createModal();
  const [appState, { navigate }] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
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

    const formData = platform() === 'dnd5' ? characterDnd5Form : characterDnd2024Form;
    const result = await createCharacterRequest(appState.accessToken, platform(), { character: formData });
    
    if (result.errors === undefined) {
      batch(() => {
        setCharacters(characters().concat(result.character));
        setCharacterDnd5Form({ name: '', race: undefined, subrace: undefined, main_class: undefined, alignment: 'neutral' });
        setCharacterDnd2024Form({ name: '', species: undefined, size: undefined, main_class: undefined, alignment: 'neutral' });
        setCurrentTab('characters');
      });
    } else renderAlerts(result.errors);
  }

  const deleteCharacter = (event, characterId) => {
    event.stopPropagation();

    batch(() => {
      setDeletingCharacterId(characterId);
      openModal();
    });
  }

  const confirmCharacterDeleting = async () => {
    const result = await removeCharacterRequest(appState.accessToken, deletingCharacterId());

    if (result.errors === undefined) {
      batch(() => {
        setCharacters(characters().filter((item) => item.id !== deletingCharacterId()));
        closeModal();
      });
    } else renderAlerts(result.errors);
  }

  // 453x750
  // 420x690
  return (
    <>
      <Switch>
        <Match when={currentTab() === 'characters'}>
          <PageHeader>
            {t('charactersPage.title')}
          </PageHeader>
          <div class="p-4 flex-1 overflow-y-scroll">
            <Button
              primary
              classList='mb-4 w-full uppercase'
              text={t('charactersPage.new')}
              onClick={() => setCurrentTab('newCharacter')}
            />
            <Show when={characters() !== undefined}>
              <For each={characters()}>
                {(character) =>
                  <div
                    class="mb-4 p-4 flex white-box cursor-pointer"
                    onClick={() => navigate('characters', { id: character.id })}
                  >
                    <Switch>
                      <Match when={character.provider === 'dnd5'}>
                        <div class="mr-2">
                          <div class="w-16 h-16 bordered" />
                        </div>
                        <div class="flex-1">
                          <div class="flex mb-1">
                            <p class="font-medium">{character.name}</p>
                            <span class="text-xs ml-2">D&D 5</span>
                          </div>
                          <div class="mb-1">
                            <p class="text-xs">
                              {t('charactersPage.level')} {character.object_data.level} | {character.object_data.subrace ? t(`dnd5.subraces.${character.object_data.race}.${character.object_data.subrace}`) : t(`dnd5.races.${character.object_data.race}`)}
                            </p>
                          </div>
                          <p class="text-xs">
                            {Object.keys(character.object_data.classes).map((item) => t(`dnd5.classes.${item}`)).join(' * ')}
                          </p>
                        </div>
                        <IconButton big onClick={(e) => deleteCharacter(e, character.id)}>
                          <Close />
                        </IconButton>
                      </Match>
                      <Match when={character.provider === 'dnd2024'}>
                        <div class="mr-2">
                          <div class="w-16 h-16 bordered" />
                        </div>
                        <div class="flex-1">
                          <div class="flex mb-1">
                            <p class="font-medium">{character.name}</p>
                            <span class="text-xs ml-2">D&D 2024</span>
                          </div>
                          <div class="mb-1">
                            <p class="text-xs">
                              {t('charactersPage.level')} {character.object_data.level} | {t(`dnd2024.species.${character.object_data.species}`)}
                            </p>
                          </div>
                          <p class="text-xs">
                            {Object.keys(character.object_data.classes).map((item) => t(`dnd2024.classes.${item}`)).join(' * ')}
                          </p>
                        </div>
                        <IconButton big onClick={(e) => deleteCharacter(e, character.id)}>
                          <Close />
                        </IconButton>
                      </Match>
                    </Switch>
                  </div>
                }
              </For>
            </Show>
          </div>
        </Match>
        <Match when={currentTab() === 'newCharacter'}>
          <PageHeader leftContent={<p class="cursor-pointer" onClick={() => setCurrentTab('characters')}>{t('back')}</p>}>
            {t('newCharacterPage.title')}
          </PageHeader>
          <div class="p-4 flex-1 flex flex-col overflow-y-scroll">
            <div class="p-4 flex-1 flex flex-col white-box">
              <div class="flex-1">
                <Select
                  classList="w-full mb-2"
                  labelText={t('newCharacterPage.platform')}
                  items={{ 'dnd5': 'D&D 5', 'dnd2024': 'D&D 2024' }}
                  selectedValue={platform()}
                  onSelect={(value) => setPlatform(value)}
                />
                <Switch>
                  <Match when={platform() === 'dnd5'}>
                    <Input
                      classList="mb-2"
                      labelText={t('newCharacterPage.name')}
                      value={characterDnd5Form.name}
                      onInput={(value) => setCharacterDnd5Form({ ...characterDnd5Form, name: value })}
                    />
                    <Select
                      classList="mb-2"
                      labelText={t('newCharacterPage.dnd5.race')}
                      items={dict().dnd5.races}
                      selectedValue={characterDnd5Form.race}
                      onSelect={(value) => setCharacterDnd5Form({ ...characterDnd5Form, race: value })}
                    />
                    <Show when={dict().dnd5.subraces[characterDnd5Form.race]}>
                      <Select
                        classList="mb-2"
                        labelText={t('newCharacterPage.dnd5.subrace')}
                        items={dict().dnd5.subraces[characterDnd5Form.race]}
                        selectedValue={characterDnd5Form.subrace}
                        onSelect={(value) => setCharacterDnd5Form({ ...characterDnd5Form, subrace: value })}
                      />
                    </Show>
                    <Select
                      classList="mb-2"
                      labelText={t('newCharacterPage.dnd5.mainClass')}
                      items={dict().dnd5.classes}
                      selectedValue={characterDnd5Form.main_class}
                      onSelect={(value) => setCharacterDnd5Form({ ...characterDnd5Form, main_class: value })}
                    />
                    <Select
                      labelText={t('newCharacterPage.dnd5.alignment')}
                      items={dict().dnd.alignments}
                      selectedValue={characterDnd5Form.alignment}
                      onSelect={(value) => setCharacterDnd5Form({ ...characterDnd5Form, alignment: value })}
                    />
                  </Match>
                  <Match when={platform() === 'dnd2024'}>
                    <Input
                      classList="mb-2"
                      labelText={t('newCharacterPage.name')}
                      value={characterDnd2024Form.name}
                      onInput={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, name: value })}
                    />
                    <Select
                      classList="mb-2"
                      labelText={t('newCharacterPage.dnd2024.species')}
                      items={dict().dnd2024.species}
                      selectedValue={characterDnd2024Form.species}
                      onSelect={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, species: value, size: CHARACTER_SIZES[value][0] })}
                    />
                    <Select
                      classList="mb-2"
                      labelText={t('newCharacterPage.dnd2024.size')}
                      items={characterDnd2024Form.species ? CHARACTER_SIZES[characterDnd2024Form.species].reduce((acc, item) => { acc[item] = t(`dnd2024.sizes.${item}`); return acc; }, {}) : {}}
                      selectedValue={characterDnd2024Form.size}
                      onSelect={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, size: value })}
                    />
                    <Select
                      classList="mb-2"
                      labelText={t('newCharacterPage.dnd2024.mainClass')}
                      items={dict().dnd2024.classes}
                      selectedValue={characterDnd2024Form.main_class}
                      onSelect={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, main_class: value })}
                    />
                    <Select
                      labelText={t('newCharacterPage.dnd2024.alignment')}
                      items={dict().dnd.alignments}
                      selectedValue={characterDnd2024Form.alignment}
                      onSelect={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, alignment: value })}
                    />
                  </Match>
                </Switch>
              </div>
              <div class="flex justify-end">
                <Button primary classList='mt-4' text={t('save')} onClick={saveCharacter} />
              </div>
            </div>
          </div>
        </Match>
      </Switch>
      <Modal>
        <p class="mb-4 text-center">{t('deleteCharacterConfirm')}</p>
        <div class="flex w-full">
          <Button primary classList='flex-1 mr-4' text={t('cancel')} onClick={closeModal} />
          <Button warning classList='flex-1 ml-4' text={t('delete')} onClick={confirmCharacterDeleting} />
        </div>
      </Modal>
    </>
  );
}
