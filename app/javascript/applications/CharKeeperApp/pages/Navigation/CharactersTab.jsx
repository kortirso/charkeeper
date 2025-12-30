import { createSignal, createEffect, createMemo, For, Switch, Match, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  CharactersListItem, Dc20CharacterForm, DaggerheartCharacterForm, Dnd5CharacterForm, Dnd2024CharacterForm,
  Pathfinder2CharacterForm
} from '../../pages';
import { CharacterNavigation, createModal, PageHeader, Select, Input, Button, Loading } from '../../components';
import { Plus } from '../../assets';
import daggerheartConfig from '../../data/daggerheart.json';
import dnd2024Config from '../../data/dnd2024.json';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { fetchCharactersRequest } from '../../requests/fetchCharactersRequest';
import { fetchCharacterRequest } from '../../requests/fetchCharacterRequest';
import { createCharacterRequest } from '../../requests/createCharacterRequest';
import { removeCharacterRequest } from '../../requests/removeCharacterRequest';
import { fetchHomebrewsRequest } from '../../requests/fetchHomebrewsRequest';
import { resetCharacterRequest } from '../../requests/resetCharacterRequest';

const TRANSLATION = {
  en: {
    deleteCharacterConfirm: 'Are you sure need to remove this character?',
    deleteCharacterTitle: 'Deleting character',
    delete: 'Delete',
    resetCharacterConfirm: 'Are you sure need to reset this character to 1 level?',
    resetCharacterTitle: 'Reseting character',
    reset: 'Reset'
  },
  ru: {
    deleteCharacterConfirm: 'Вы точно хотите избавиться от этого персонажа?',
    deleteCharacterTitle: 'Удаление персонажа',
    delete: 'Удалить',
    resetCharacterConfirm: 'Вы точно хотите сбросить от этого персонажа до 1 уровня?',
    resetCharacterTitle: 'Сброс персонажа',
    reset: 'Сбросить'
  }
}

export const CharactersTab = () => {
  const [loading, setLoading] = createSignal(false);
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

  const daggerheartHeritages = createMemo(() => {
    if (homebrews() === undefined) return {};

    return { ...daggerheartConfig.heritages, ...homebrews().daggerheart.races };
  });

  const daggerheartClasses = createMemo(() => {
    if (homebrews() === undefined) return {};

    return { ...daggerheartConfig.classes, ...homebrews().daggerheart.classes };
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

  const saveCharacter = async (characterForm) => {
    if (platform() === undefined) return undefined;

    setLoading(true);

    const formData = Object.fromEntries(Object.entries(characterForm).filter(([, value]) => value !== undefined));
    const result = await createCharacterRequest(appState.accessToken, platform(), { character: formData });
    
    if (result.errors_list === undefined) {
      batch(() => {
        setCharacters([result.character, ...characters()]);
        setPlatform(undefined);
        setCurrentTab('characters');
        setLoading(false);
      });
    } else {
      batch(() => {
        renderAlerts(result.errors_list);
        setLoading(false);
      })
    }

    return null;
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
              classList="absolute right-4 bottom-4 rounded-full w-12 h-12 z-10"
              onClick={() => setCurrentTab('newCharacter')}
            >
              <Plus />
            </Button>
          </Show>
          <CharacterNavigation
            tabsList={['allFilter'].concat(['dnd5', 'dnd2024', 'pathfinder2', 'daggerheart', 'dc20'].filter((item) => characterProviders().includes(item)))}
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
                    daggerheartHeritages={daggerheartHeritages()}
                    daggerheartClasses={daggerheartClasses()}
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
              items={{ 'dnd5': 'D&D 5', 'dnd2024': 'D&D 2024', 'daggerheart': 'Daggerheart', 'pathfinder2': 'Pathfinder 2', 'dc20': 'DC20 0.10' }}
              selectedValue={platform()}
              onSelect={(value) => setPlatform(value)}
            />
            <Switch>
              <Match when={platform() === 'dnd5'}>
                <Dnd5CharacterForm loading={loading} onCreateCharacter={saveCharacter} homebrews={homebrews} setCurrentTab={setCurrentTab} />
              </Match>
              <Match when={platform() === 'dnd2024'}>
                <Dnd2024CharacterForm loading={loading} onCreateCharacter={saveCharacter} homebrews={homebrews} setCurrentTab={setCurrentTab} dnd2024Races={dnd2024Races} />
              </Match>
              <Match when={platform() === 'pathfinder2'}>
                <Pathfinder2CharacterForm loading={loading} onCreateCharacter={saveCharacter} homebrews={homebrews} setCurrentTab={setCurrentTab} />
              </Match>
              <Match when={platform() === 'daggerheart'}>
                <DaggerheartCharacterForm loading={loading} onCreateCharacter={saveCharacter} homebrews={homebrews} setCurrentTab={setCurrentTab} />
              </Match>
              <Match when={platform() === 'dc20'}>
                <Dc20CharacterForm loading={loading} onCreateCharacter={saveCharacter} setCurrentTab={setCurrentTab} />
              </Match>
            </Switch>
            <Show when={platform() === undefined}>
              <div class="flex mt-4">
                <Button
                  outlined
                  size='default'
                  classList='w-full mr-2'
                  onClick={() => loading() ? null : setCurrentTab('characters')}
                >
                  {t('back')}
                </Button>
              </div>
            </Show>
          </div>
        </Match>
      </Switch>
      <Modal>
        <Show when={deletingCharacterId()}>
          <p class="mb-3 text-xl">{TRANSLATION[locale()].deleteCharacterTitle}</p>
          <p class="mb-3">{TRANSLATION[locale()].deleteCharacterConfirm}</p>
          <div class="flex w-full">
            <Button outlined classList='flex-1 mr-2 text-sm md:text-base' onClick={closeModal}>{t('cancel')}</Button>
            <Button default classList='flex-1 ml-2 text-sm md:text-base' onClick={confirmCharacterDeleting}>{TRANSLATION[locale()].delete}</Button>
          </div>
        </Show>
        <Show when={resetingCharacterId()}>
          <p class="mb-3 text-xl">{TRANSLATION[locale()].resetCharacterTitle}</p>
          <p class="mb-3">{TRANSLATION[locale()].resetCharacterConfirm}</p>
          <div class="flex w-full">
            <Button outlined classList='flex-1 mr-2 text-sm md:text-base' onClick={closeModal}>{t('cancel')}</Button>
            <Button default classList='flex-1 ml-2 text-sm md:text-base' onClick={confirmCharacterReseting}>{TRANSLATION[locale()].reset}</Button>
          </div>
        </Show>
      </Modal>
    </>
  );
}
