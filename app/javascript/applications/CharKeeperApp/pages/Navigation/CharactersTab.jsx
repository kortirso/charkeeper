import { createSignal, createEffect, createMemo, For, Switch, Match, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  CharactersListItem, Dc20CharacterForm, DaggerheartCharacterForm, Dnd5CharacterForm, Dnd2024CharacterForm,
  Pathfinder2CharacterForm, FateCharacterForm, FalloutCharacterForm, CosmereCharacterForm, Cthulhu7CharacterForm
} from '../../pages';
import { CharacterNavigation, createModal, PageHeader, Select, Input, Button, Loading } from '../../components';
import { Plus } from '../../assets';
import dnd2024Config from '../../data/dnd2024.json';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { fetchCharactersRequest } from '../../requests/fetchCharactersRequest';
import { fetchCharacterRequest } from '../../requests/fetchCharacterRequest';
import { createCharacterRequest } from '../../requests/createCharacterRequest';
import { importCharacterRequest } from '../../requests/importCharacterRequest';
import { removeCharacterRequest } from '../../requests/removeCharacterRequest';
import { fetchHomebrewsRequest } from '../../requests/fetchHomebrewsRequest';
import { resetCharacterRequest } from '../../requests/resetCharacterRequest';
import { localize } from '../../helpers';

const TRANSLATION = {
  en: {
    deleteCharacterConfirm: 'Are you sure need to remove this character?',
    deleteCharacterTitle: 'Deleting character',
    delete: 'Delete',
    resetCharacterConfirm1: 'Are you sure need to reset this character to 1 level?',
    resetCharacterConfirm2: "Only character's equipment will not be reset.",
    resetCharacterTitle: 'Reseting character',
    reset: 'Reset'
  },
  ru: {
    deleteCharacterConfirm: 'Вы точно хотите избавиться от этого персонажа?',
    deleteCharacterTitle: 'Удаление персонажа',
    delete: 'Удалить',
    resetCharacterConfirm1: 'Вы точно хотите сбросить от этого персонажа до 1 уровня?',
    resetCharacterConfirm2: "Только снаряжение персонажа не будет сброшено.",
    resetCharacterTitle: 'Сброс персонажа',
    reset: 'Сбросить'
  },
  es: {
    deleteCharacterConfirm: '¿Estás seguro de que quieres eliminar este personaje?',
    deleteCharacterTitle: 'Eliminando personaje',
    delete: 'Eliminar',
    resetCharacterConfirm1: '¿Estás seguro de que quieres restablecer este personaje a nivel 1?',
    resetCharacterConfirm2: "Solo el equipo del personaje no será restablecido.",
    resetCharacterTitle: 'Restableciendo personaje',
    reset: 'Restablecer'
  }
}

export const CharactersTab = () => {
  const [currentTab, setCurrentTab] = createSignal('characters');
  const [activeFilter, setActiveFilter] = createSignal('allFilter');
  const [characters, setCharacters] = createSignal(undefined);
  const [platform, setPlatform] = createSignal(undefined);
  const [deletingCharacterId, setDeletingCharacterId] = createSignal(undefined);
  const [resetingCharacterId, setResetingCharacterId] = createSignal(undefined);
  const [adminCharacterId, setAdminCharacterId] = createSignal('');
  const [homebrews, setHomebrews] = createSignal(undefined);

  const { Modal, openModal, closeModal } = createModal();
  const [appState, { navigate }] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const fetchCharacters = async () => await fetchCharactersRequest(appState.accessToken);

  createEffect(() => {
    if (characters() !== undefined) return;
    if (homebrews() !== undefined) return;

    const fetchHomebrews = async () => await fetchHomebrewsRequest(appState.accessToken);

    Promise.all([fetchCharacters(), fetchHomebrews()]).then(
      ([charactersData, homebrewsData]) => {
        batch(() => {
          setCharacters(charactersData.characters);
          setHomebrews(homebrewsData);
        });
      }
    );
  });

  const findAdminCharacter = async () => {
    const characterData = await fetchCharacterRequest(appState.accessToken, adminCharacterId());
    if (characterData.errors == undefined) setCharacters(characters().concat(characterData.character));
  }

  const dnd2024Races = createMemo(() => {
    if (homebrews() === undefined) return {};

    return { ...dnd2024Config.species, ...homebrews().dnd2024.races };
  });

  const characterProviders = createMemo(() => {
    if (characters() === undefined) return [];

    const uniqProviders = new Set(characters().map((item) => item.provider));
    return [...uniqProviders];
  });

  const filteredCharacters = createMemo(() => {
    if (characters() === undefined) return undefined;
    if (activeFilter() === 'allFilter') return characters();

    return characters().filter((item) => item.provider === activeFilter());
  });

  const characterComponent = createMemo(() => {
    if (!platform()) return (
      <div class="flex mt-4">
        <Button outlined size="default" classList="w-full mr-2" onClick={() => setCurrentTab('characters')}>
          {t('back')}
        </Button>
      </div>
    );

    if (platform() === 'dnd2024') {
      return <Dnd2024CharacterForm onCreateCharacter={saveCharacter} onImportCharacter={importCharacter} homebrews={homebrews} setCurrentTab={setCurrentTab} dnd2024Races={dnd2024Races} />;
    }

    const HOMEBREW_COMPONENTS = { dnd5: Dnd5CharacterForm, pathfinder2: Pathfinder2CharacterForm, daggerheart: DaggerheartCharacterForm }
    if (HOMEBREW_COMPONENTS[platform()]) {
      const Component = HOMEBREW_COMPONENTS[platform()];
      return <Component onCreateCharacter={saveCharacter} onImportCharacter={importCharacter} homebrews={homebrews} setCurrentTab={setCurrentTab} />;
    }

    const COMPONENTS = {
      fate: FateCharacterForm, dc20: Dc20CharacterForm, fallout: FalloutCharacterForm, cosmere: CosmereCharacterForm, cthulhu7: Cthulhu7CharacterForm
    }
    const Component = COMPONENTS[platform()];
    return <Component onCreateCharacter={saveCharacter} setCurrentTab={setCurrentTab} />
  });

  const deleteCharacter = (event, characterId) => {
    event.stopPropagation();

    batch(() => {
      setDeletingCharacterId(characterId);
      openModal();
    });
  }

  const resetCharacter = (event, characterId) => {
    event.stopPropagation();

    batch(() => {
      setResetingCharacterId(characterId);
      openModal();
    });
  }

  const confirmCharacterDeleting = async () => {
    const result = await removeCharacterRequest(appState.accessToken, deletingCharacterId());

    if (result.errors_list === undefined) {
      batch(() => {
        setCharacters(characters().filter((item) => item.id !== deletingCharacterId()));
        closeModal();
      });
      navigate(null, {});
    } else renderAlerts(result.errors_list);
  }

  const confirmCharacterReseting = async () => {
    const result = await resetCharacterRequest(appState.accessToken, resetingCharacterId());

    if (result.errors_list === undefined) {
      const refreshData = await fetchCharacters()
      batch(() => {
        setCharacters(refreshData.characters);
        closeModal();
        navigate(null, {});
      });
    } else renderAlerts(result.errors_list);
  }

  const importCharacter = async (provider, json) => {
    if (platform() === undefined) return undefined;

    const result = await importCharacterRequest(appState.accessToken, platform(), { provider: provider, data: json });
    
    if (result.errors_list === undefined) {
      batch(() => {
        setCharacters([result.character, ...characters()]);
        setPlatform(undefined);
        setCurrentTab('characters');
      });
      return null;
    } else renderAlerts(result.errors_list);
  }

  const saveCharacter = async (characterForm) => {
    if (platform() === undefined) return undefined;

    const formData = Object.fromEntries(Object.entries(characterForm).filter(([, value]) => value !== undefined));
    const result = await createCharacterRequest(appState.accessToken, platform(), { character: formData });
    
    if (result.errors_list === undefined) {
      batch(() => {
        setCharacters([result.character, ...characters()]);
        setPlatform(undefined);
        setCurrentTab('characters');
      });
      return null;
    } else renderAlerts(result.errors_list);
  }

  return (
    <>
      <Switch>
        <Match when={currentTab() === 'newCharacter'}>
          <PageHeader>
            {t('newCharacterPage.title')}
          </PageHeader>
        </Match>
        <Match when={currentTab() === 'characters'}>
          <Show when={filteredCharacters()}>
            <Button
              default
              classList="absolute right-4 bottom-4 rounded-full! w-12 h-12 z-10"
              onClick={() => setCurrentTab('newCharacter')}
              dataTestId="new-character-button"
            >
              <Plus />
            </Button>
          </Show>
          <CharacterNavigation
            tabsList={['allFilter'].concat(['dnd5', 'dnd2024', 'pathfinder2', 'daggerheart', 'fate', 'fallout', 'cosmere', 'dc20', 'cthulhu7'].filter((item) => characterProviders().includes(item)))}
            activeTab={activeFilter()}
            setActiveTab={setActiveFilter}
          />
        </Match>
      </Switch>
      <Switch>
        <Match when={currentTab() === 'characters'}>
          <div class="flex-1 overflow-y-auto">
            <Show when={filteredCharacters()} fallback={<Loading />}>
              <For each={filteredCharacters()}>
                {(character) =>
                  <CharactersListItem
                    character={character}
                    isActive={character.id == appState.activePageParams.id}
                    dnd2024Races={dnd2024Races()}
                    onClick={() => navigate('character', { id: character.id })}
                    onViewClick={() => navigate('characterView', { id: character.id })}
                    onDeleteCharacter={(e) => deleteCharacter(e, character.id)}
                    onResetCharacter={(e) => resetCharacter(e, character.id)}
                  />
                }
              </For>
              <Show when={appState.isAdmin}>
                <div class="w-full flex p-2">
                  <Button default size="small" classList="px-2" onClick={findAdminCharacter}>
                    {t('find')}
                  </Button>
                  <Input
                    containerClassList="ml-4 flex-1"
                    labelText={t('newCharacterPage.adminCharacterId')}
                    value={adminCharacterId()}
                    onInput={(value) => setAdminCharacterId(value)}
                  />
                </div>
              </Show>
            </Show>
          </div>
        </Match>
        <Match when={currentTab() === 'newCharacter'}>
          <div class="p-4 flex-1 flex flex-col overflow-y-auto">
            <Select
              showAll
              containerClassList="mb-2"
              classList="w-full"
              labelText={t('newCharacterPage.platform')}
              items={{ 'dnd5': 'D&D 5', 'dnd2024': 'D&D 2024', 'daggerheart': 'Daggerheart', 'pathfinder2': 'Pathfinder 2', 'fate': 'Fate', 'fallout': 'Fallout 2D20', 'cosmere': 'Cosmere', 'cthulhu7': 'Call of Cthulhu 7', 'dc20': 'DC20 0.10' }}
              selectedValue={platform()}
              onSelect={(value) => setPlatform(value)}
              dataTestId="new-character-platform-select"
            />
            {characterComponent()}
          </div>
        </Match>
      </Switch>
      <Modal>
        <Show when={deletingCharacterId()}>
          <p class="mb-2 text-xl">{localize(TRANSLATION, locale()).deleteCharacterTitle}</p>
          <p class="mb-2">{localize(TRANSLATION, locale()).deleteCharacterConfirm}</p>
          <div class="flex w-full">
            <Button outlined classList='flex-1 mr-2 text-sm md:text-base' onClick={closeModal}>{t('cancel')}</Button>
            <Button default classList='flex-1 ml-2 text-sm md:text-base' onClick={confirmCharacterDeleting}>{localize(TRANSLATION, locale()).delete}</Button>
          </div>
        </Show>
        <Show when={resetingCharacterId()}>
          <p class="mb-2 text-xl">{localize(TRANSLATION, locale()).resetCharacterTitle}</p>
          <p class="mb-2">{localize(TRANSLATION, locale()).resetCharacterConfirm1}</p>
          <p class="mb-2">{localize(TRANSLATION, locale()).resetCharacterConfirm2}</p>
          <div class="flex w-full">
            <Button outlined classList='flex-1 mr-2 text-sm md:text-base' onClick={closeModal}>{t('cancel')}</Button>
            <Button default classList='flex-1 ml-2 text-sm md:text-base' onClick={confirmCharacterReseting}>{localize(TRANSLATION, locale()).reset}</Button>
          </div>
        </Show>
      </Modal>
    </>
  );
}
