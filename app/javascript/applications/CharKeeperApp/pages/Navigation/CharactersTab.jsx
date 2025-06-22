import { createSignal, createEffect, createMemo, For, Switch, Match, Show, batch } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { Item, CharacterNavigation } from '../../components';
import { createModal, PageHeader } from '../../components/molecules';
import { Select, Input, Button, Checkbox } from '../../components/atoms';

import { Plus } from '../../assets';
import pathfinder2Config from '../../data/pathfinder2.json';
import daggerheartConfig from '../../data/daggerheart.json';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { fetchCharactersRequest } from '../../requests/fetchCharactersRequest';
import { createCharacterRequest } from '../../requests/createCharacterRequest';
import { removeCharacterRequest } from '../../requests/removeCharacterRequest';

import { translate } from '../../helpers';

DAGGERHEART_DEFAULT_FORM = {
  name: '', heritage: undefined, heritage_name: '', heritage_features: [], main_feature: undefined,
  secondary_feature: undefined, community: undefined, main_class: undefined, subclass: undefined,
  avatar_file: undefined, avatar_url: undefined
}

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

export const CharactersTab = () => {
  const [loading, setLoading] = createSignal(false);
  const [selectedFile, setSelectedFile] = createSignal(null);
  const [currentTab, setCurrentTab] = createSignal('characters');
  const [activeFilter, setActiveFilter] = createSignal('allFilter');
  const [characters, setCharacters] = createSignal(undefined);
  const [platform, setPlatform] = createSignal(undefined);
  const [avatarUrl, setAvatarUrl] = createSignal('');
  const [deletingCharacterId, setDeletingCharacterId] = createSignal(undefined);
  const [characterDnd5Form, setCharacterDnd5Form] = createStore({
    name: '',
    race: undefined,
    subrace: undefined,
    main_class: undefined,
    alignment: 'neutral',
    avatar_file: undefined,
    avatar_url: undefined
  });
  const [characterDnd2024Form, setCharacterDnd2024Form] = createStore({
    name: '',
    species: undefined,
    size: undefined,
    main_class: undefined,
    alignment: 'neutral',
    avatar_file: undefined,
    avatar_url: undefined
  });
  const [characterPathfinder2Form, setCharacterPathfinder2Form] = createStore({
    name: '',
    race: undefined,
    subrace: undefined,
    main_class: undefined,
    background: undefined,
    main_ability: undefined,
    avatar_file: undefined,
    avatar_url: undefined
  });
  const [characterDaggerheartForm, setCharacterDaggerheartForm] = createStore(DAGGERHEART_DEFAULT_FORM);
  const [customHeritage, setCustomHeritage] = createSignal(false);

  const { Modal, openModal, closeModal } = createModal();
  const [appState, { navigate }] = useAppState();
  const [{ renderAlert, renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

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

  const heritageFeatures = createMemo(() => {
    const mainFeatures = {};
    const secondaryFeatures = {};

    Object.values(daggerheartConfig.heritages).forEach((item) => {
      mainFeatures[item.main_feature.slug] = `${item.name[locale()]} - ${item.main_feature.name[locale()]}`;
      secondaryFeatures[item.secondary_feature.slug] = `${item.name[locale()]} - ${item.secondary_feature.name[locale()]}`;
    })

    return [mainFeatures, secondaryFeatures];
  });

  const characterProviders = createMemo(() => {
    if (characters() === undefined) return [];

    const uniqProviders = new Set(characters().map((item) => item.provider));
    return [...uniqProviders];
  });

  const filteredCharacters = createMemo(() => {
    if (characters() === undefined) return [];
    if (activeFilter() === 'allFilter') return characters();

    return characters().filter((item) => item.provider === activeFilter());
  });

  const handleFileChange = (event) => {
    const target = event.target;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      setSelectedFile(file);
      if (file.size > 1000000) renderAlert(t('alerts.fileSizeLimit'));
    }
  }

  const imageToBase64 = (file) => {
    if (file === null) return;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.replace(/^data:image\/[a-z]+;base64,/, "");
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const saveCharacter = async () => {
    if (platform() === undefined) return;
    if (selectedFile() && selectedFile().size > 1000000) {
      return renderAlert(t('alerts.fileSizeLimit'));
    }

    setLoading(true);

    let characterFormData = null;
    switch (platform()) {
      case 'dnd5':
        characterFormData = characterDnd5Form; // eslint-disable-line solid/reactivity
        break;
      case 'dnd2024':
        characterFormData = characterDnd2024Form; // eslint-disable-line solid/reactivity
        break;
      case 'pathfinder2':
        characterFormData = characterPathfinder2Form; // eslint-disable-line solid/reactivity
        break;
      case 'daggerheart':
        characterFormData = characterDaggerheartForm; // eslint-disable-line solid/reactivity

        if (customHeritage()) {
          characterFormData = {
            ...characterFormData, heritage_features: [characterFormData.main_feature, characterFormData.secondary_feature]
          }
          characterFormData = {
            ...characterFormData, heritage: undefined, main_feature: undefined, secondary_feature: undefined
          }
        } else {
          characterFormData = {
            ...characterFormData, heritage_features: undefined, heritage_name: undefined, main_feature: undefined, secondary_feature: undefined
          }
        }
        break;
    }

    characterFormData = Object.fromEntries(Object.entries(characterFormData).filter(([, value]) => value !== undefined))

    const fileContent = await imageToBase64(selectedFile());
    if (fileContent) {
      const avatarFile = { file_content: fileContent, file_name: selectedFile().name }
      characterFormData = { ...characterFormData, avatar_file: avatarFile }
    }
    if (avatarUrl().length > 0) {
      characterFormData = { ...characterFormData, avatar_url: avatarUrl() }
    }

    const result = await createCharacterRequest(appState.accessToken, platform(), { character: characterFormData });
    
    if (result.errors === undefined) {
      batch(() => {
        setCharacters(characters().concat(result.character));
        setPlatform(undefined);
        setCharacterDnd5Form({ name: '', race: undefined, subrace: undefined, main_class: undefined, alignment: 'neutral', avatar_file: undefined, avatar_url: undefined });
        setCharacterDnd2024Form({ name: '', species: undefined, size: undefined, main_class: undefined, alignment: 'neutral', avatar_file: undefined, avatar_url: undefined });
        setCharacterPathfinder2Form({ name: '', race: undefined, subrace: undefined, main_class: undefined, background: undefined, avatar_file: undefined, avatar_url: undefined, main_ability: undefined });
        setCharacterDaggerheartForm(DAGGERHEART_DEFAULT_FORM);
        setCurrentTab('characters');
        setLoading(false);
      });
    } else {
      batch(() => {
        renderAlerts(result.errors);
        setLoading(false);
      })
    }
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

  return (
    <>
      <Switch>
        <Match when={currentTab() === 'newCharacter'}>
          <PageHeader>
            {t('newCharacterPage.title')}
          </PageHeader>
        </Match>
        <Match when={currentTab() === 'characters'}>
          <CharacterNavigation
            tabsList={['allFilter'].concat(characterProviders())}
            disableTabsList={['dnd5', 'dnd2024', 'pathfinder2', 'daggerheart'].filter((item) => !characterProviders().includes(item))}
            activeTab={activeFilter()}
            setActiveTab={setActiveFilter}
          />
        </Match>
      </Switch>
      <Switch>
        <Match when={currentTab() === 'characters'}>
          <div class="relative flex-1 overflow-y-scroll">
            <Button
              default
              classList='absolute right-4 bottom-4 rounded-full min-w-12 min-h-12 z-10'
              onClick={() => setCurrentTab('newCharacter')}
            >
              <Plus />
            </Button>
            <Show when={characters() !== undefined}>
              <For each={filteredCharacters()}>
                {(character) =>
                  <Switch>
                    <Match when={character.provider === 'dnd5'}>
                      <Item
                        isActive={character.id == appState.activePageParams.id}
                        avatar={character.avatar}
                        name={character.name}
                        provider='D&D 5'
                        firstText={`${t('charactersPage.level')} ${character.level} | ${character.subrace ? t(`dnd5.subraces.${character.race}.${character.subrace}`) : t(`dnd5.races.${character.race}`)}`}
                        secondText={Object.keys(character.classes).map((item) => t(`dnd5.classes.${item}`)).join(' * ')}
                        onClick={() => navigate('character', { id: character.id })}
                        onDeleteCharacter={(e) => deleteCharacter(e, character.id)}
                      />
                    </Match>
                    <Match when={character.provider === 'dnd2024'}>
                      <Item
                        isActive={character.id == appState.activePageParams.id}
                        avatar={character.avatar}
                        name={character.name}
                        provider='D&D 2024'
                        firstText={`${t('charactersPage.level')} ${character.level} | ${character.legacy ? t(`dnd2024.legacies.${character.species}.${character.legacy}`) : t(`dnd2024.species.${character.species}`)}`}
                        secondText={Object.keys(character.classes).map((item) => t(`dnd2024.classes.${item}`)).join(' * ')}
                        onClick={() => navigate('character', { id: character.id })}
                        onDeleteCharacter={(e) => deleteCharacter(e, character.id)}
                      />
                    </Match>
                    <Match when={character.provider === 'pathfinder2'}>
                      <Item
                        isActive={character.id == appState.activePageParams.id}
                        avatar={character.avatar}
                        name={character.name}
                        provider='Pathfinder 2'
                        firstText={`${t('charactersPage.level')} ${character.level} | ${character.subrace ? pathfinder2Config.races[character.race].subraces[character.subrace].name[locale()] : pathfinder2Config.races[character.race].name[locale()]}`}
                        secondText={Object.keys(character.classes).map((item) => pathfinder2Config.classes[item].name[locale()]).join(' * ')}
                        onClick={() => navigate('character', { id: character.id })}
                        onDeleteCharacter={(e) => deleteCharacter(e, character.id)}
                      />
                    </Match>
                    <Match when={character.provider === 'daggerheart'}>
                      <Item
                        isActive={character.id == appState.activePageParams.id}
                        avatar={character.avatar}
                        name={character.name}
                        provider='Daggerheart'
                        firstText={`${t('charactersPage.level')} ${character.level} | ${character.heritage ? daggerheartConfig.heritages[character.heritage].name[locale()] : character.heritage_name}`}
                        secondText={Object.keys(character.classes).map((item) => daggerheartConfig.classes[item].name[locale()]).join(' * ')}
                        onClick={() => navigate('character', { id: character.id })}
                        onDeleteCharacter={(e) => deleteCharacter(e, character.id)}
                      />
                    </Match>
                  </Switch>
                }
              </For>
            </Show>
          </div>
        </Match>
        <Match when={currentTab() === 'newCharacter'}>
          <div class="p-4 flex-1 flex flex-col overflow-y-scroll">
            {console.log(heritageFeatures())}
            <div class="flex-1">
              <Select
                containerClassList="mb-2"
                classList="w-full"
                labelText={t('newCharacterPage.platform')}
                items={{ 'dnd5': 'D&D 5', 'dnd2024': 'D&D 2024', 'pathfinder2': 'Pathfinder 2', 'daggerheart': 'Daggerheart' }}
                selectedValue={platform()}
                onSelect={(value) => setPlatform(value)}
              />
              <div class="mb-8">
                <Switch>
                  <Match when={platform() === 'dnd5'}>
                    <Input
                      containerClassList="mb-2"
                      labelText={t('newCharacterPage.name')}
                      value={characterDnd5Form.name}
                      onInput={(value) => setCharacterDnd5Form({ ...characterDnd5Form, name: value })}
                    />
                    <Select
                      containerClassList="mb-2"
                      labelText={t('newCharacterPage.dnd5.race')}
                      items={dict().dnd5.races}
                      selectedValue={characterDnd5Form.race}
                      onSelect={(value) => setCharacterDnd5Form({ ...characterDnd5Form, race: value, subrace: undefined })}
                    />
                    <Show when={dict().dnd5.subraces[characterDnd5Form.race]}>
                      <Select
                        containerClassList="mb-2"
                        labelText={t('newCharacterPage.dnd5.subrace')}
                        items={dict().dnd5.subraces[characterDnd5Form.race]}
                        selectedValue={characterDnd5Form.subrace}
                        onSelect={(value) => setCharacterDnd5Form({ ...characterDnd5Form, subrace: value })}
                      />
                    </Show>
                    <Select
                      containerClassList="mb-2"
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
                      containerClassList="mb-2"
                      labelText={t('newCharacterPage.name')}
                      value={characterDnd2024Form.name}
                      onInput={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, name: value })}
                    />
                    <Select
                      containerClassList="mb-2"
                      labelText={t('newCharacterPage.dnd2024.species')}
                      items={dict().dnd2024.species}
                      selectedValue={characterDnd2024Form.species}
                      onSelect={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, species: value, size: CHARACTER_SIZES[value][0], legacy: undefined })}
                    />
                    <Show when={dict().dnd2024.legacies[characterDnd2024Form.species]}>
                      <Select
                        containerClassList="mb-2"
                        labelText={t('newCharacterPage.dnd2024.legacy')}
                        items={dict().dnd2024.legacies[characterDnd2024Form.species]}
                        selectedValue={characterDnd2024Form.legacy}
                        onSelect={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, legacy: value })}
                      />
                    </Show>
                    <Select
                      containerClassList="mb-2"
                      labelText={t('newCharacterPage.dnd2024.size')}
                      items={characterDnd2024Form.species ? CHARACTER_SIZES[characterDnd2024Form.species].reduce((acc, item) => { acc[item] = t(`dnd2024.sizes.${item}`); return acc; }, {}) : {}}
                      selectedValue={characterDnd2024Form.size}
                      onSelect={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, size: value })}
                    />
                    <Select
                      containerClassList="mb-2"
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
                  <Match when={platform() === 'pathfinder2'}>
                    <Input
                      containerClassList="mb-2"
                      labelText={t('newCharacterPage.name')}
                      value={characterPathfinder2Form.name}
                      onInput={(value) => setCharacterPathfinder2Form({ ...characterPathfinder2Form, name: value })}
                    />
                    <Select
                      containerClassList="mb-2"
                      labelText={t('newCharacterPage.pathfinder2.race')}
                      items={translate(pathfinder2Config.races, locale())}
                      selectedValue={characterPathfinder2Form.race}
                      onSelect={(value) => setCharacterPathfinder2Form({ ...characterPathfinder2Form, race: value, subrace: undefined })}
                    />
                    <Show when={pathfinder2Config.races[characterPathfinder2Form.race]?.subraces}>
                      <Select
                        containerClassList="mb-2"
                        labelText={t('newCharacterPage.pathfinder2.subrace')}
                        items={translate(pathfinder2Config.races[characterPathfinder2Form.race].subraces, locale())}
                        selectedValue={characterPathfinder2Form.subrace}
                        onSelect={(value) => setCharacterPathfinder2Form({ ...characterPathfinder2Form, subrace: value })}
                      />
                    </Show>
                    <Select
                      containerClassList="mb-2"
                      labelText={t('newCharacterPage.pathfinder2.background')}
                      items={translate(pathfinder2Config.backgrounds, locale())}
                      selectedValue={characterPathfinder2Form.background}
                      onSelect={(value) => setCharacterPathfinder2Form({ ...characterPathfinder2Form, background: value })}
                    />
                    <Select
                      labelText={t('newCharacterPage.pathfinder2.mainClass')}
                      items={translate(pathfinder2Config.classes, locale())}
                      selectedValue={characterPathfinder2Form.main_class}
                      onSelect={(value) => setCharacterPathfinder2Form({ ...characterPathfinder2Form, main_class: value, main_ability: pathfinder2Config.classes[value].main_ability_options[0] })}
                    />
                    <Show when={pathfinder2Config.classes[characterPathfinder2Form.main_class]?.main_ability_options.length > 1}>
                      <Select
                        containerClassList="mt-2"
                        labelText={t('newCharacterPage.pathfinder2.mainAbility')}
                        items={Object.fromEntries(Object.entries(dict().dnd.abilities).filter(([key,]) => pathfinder2Config.classes[characterPathfinder2Form.main_class]?.main_ability_options.includes(key)))}
                        selectedValue={characterPathfinder2Form.main_ability}
                        onSelect={(value) => setCharacterPathfinder2Form({ ...characterPathfinder2Form, main_ability: value })}
                      />
                    </Show>
                  </Match>
                  <Match when={platform() === 'daggerheart'}>
                    <Input
                      containerClassList="mb-2"
                      labelText={t('newCharacterPage.name')}
                      value={characterDaggerheartForm.name}
                      onInput={(value) => setCharacterDaggerheartForm({ ...characterDaggerheartForm, name: value })}
                    />
                    <Checkbox
                      labelText={t('newCharacterPage.daggerheart.customHeritage')}
                      labelPosition="right"
                      labelClassList="ml-2"
                      checked={customHeritage()}
                      classList="mr-1"
                      onToggle={() => setCustomHeritage(!customHeritage())}
                    />
                    <Show
                      when={customHeritage()}
                      fallback={
                        <Select
                          containerClassList="mb-2"
                          labelText={t('newCharacterPage.daggerheart.heritage')}
                          items={translate(daggerheartConfig.heritages, locale())}
                          selectedValue={characterDaggerheartForm.heritage}
                          onSelect={(value) => setCharacterDaggerheartForm({ ...characterDaggerheartForm, heritage: value })}
                        />
                      }
                    >
                      <Input
                        containerClassList="mb-2"
                        labelText={t('newCharacterPage.daggerheart.heritageName')}
                        value={characterDaggerheartForm.heritage_name}
                        onInput={(value) => setCharacterDaggerheartForm({ ...characterDaggerheartForm, heritage_name: value })}
                      />
                      <Select
                        containerClassList="mb-2"
                        labelText={t('newCharacterPage.daggerheart.mainFeature')}
                        items={heritageFeatures()[0]}
                        selectedValue={characterDaggerheartForm.main_feature}
                        onSelect={(value) => setCharacterDaggerheartForm({ ...characterDaggerheartForm, main_feature: value })}
                      />
                      <Select
                        containerClassList="mb-2"
                        labelText={t('newCharacterPage.daggerheart.secondaryFeature')}
                        items={heritageFeatures()[0]}
                        selectedValue={characterDaggerheartForm.secondary_feature}
                        onSelect={(value) => setCharacterDaggerheartForm({ ...characterDaggerheartForm, secondary_feature: value })}
                      />
                    </Show>
                    <Select
                      containerClassList="mb-2"
                      labelText={t('newCharacterPage.daggerheart.community')}
                      items={translate(daggerheartConfig.communities, locale())}
                      selectedValue={characterDaggerheartForm.community}
                      onSelect={(value) => setCharacterDaggerheartForm({ ...characterDaggerheartForm, community: value })}
                    />
                    <Select
                      containerClassList="mb-2"
                      labelText={t('newCharacterPage.daggerheart.mainClass')}
                      items={translate(daggerheartConfig.classes, locale())}
                      selectedValue={characterDaggerheartForm.main_class}
                      onSelect={(value) => setCharacterDaggerheartForm({ ...characterDaggerheartForm, main_class: value, subclass: undefined })}
                    />
                    <Show when={daggerheartConfig.classes[characterDaggerheartForm.main_class]?.subclasses}>
                      <Select
                        containerClassList="mb-2"
                        labelText={t('newCharacterPage.daggerheart.subclass')}
                        items={translate(daggerheartConfig.classes[characterDaggerheartForm.main_class].subclasses, locale())}
                        selectedValue={characterDaggerheartForm.subclass}
                        onSelect={(value) => setCharacterDaggerheartForm({ ...characterDaggerheartForm, subclass: value })}
                      />
                    </Show>
                  </Match>
                </Switch>
              </div>
              <label class="text-sm/4 font-cascadia-light text-gray-400">{t('newCharacterPage.avatarFile')}</label>
              <input class="block mb-2" type="file" accept="image/jpeg, image/png" onChange={handleFileChange} />
              <Input
                labelText={t('newCharacterPage.avatarUrl')}
                value={avatarUrl()}
                onInput={(value) => setAvatarUrl(value)}
              />
              <label class="text-xs font-cascadia-light text-gray-400">{t('newCharacterPage.avatarTransform')}</label>
            </div>
            <div class="flex mt-4">
              <Button
                outlined
                size='default'
                classList='w-full mr-2'
                onClick={() => loading() ? null : setCurrentTab('characters')}
              >
                {t('back')}
              </Button>
              <Button
                default
                size='default'
                classList='w-full ml-2'
                onClick={() => loading() ? null : saveCharacter()}
              >
                {loading() ? t('saving') : t('save')}
              </Button>
            </div>
          </div>
        </Match>
      </Switch>
      <Modal>
        <p class="mb-3 text-xl">{t('charactersPage.deleteCharacterTitle')}</p>
        <p class="mb-3 font-cascadia-light">{t('deleteCharacterConfirm')}</p>
        <div class="flex w-full">
          <Button outlined classList='flex-1 mr-2' onClick={closeModal}>{t('cancel')}</Button>
          <Button default classList='flex-1 ml-2' onClick={confirmCharacterDeleting}>{t('delete')}</Button>
        </div>
      </Modal>
    </>
  );
}
