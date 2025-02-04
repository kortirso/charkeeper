import { createSignal, createEffect, For, Switch, Match, Show, batch } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { PageHeader } from '../../molecules';
import { Select, Input } from '../../atoms';

import { useAppState, useAppLocale } from '../../../context';
import { fetchCharactersRequest } from '../../../requests/fetchCharactersRequest';
import { createCharacterRequest } from '../../../requests/createCharacterRequest';

export const CharactersPage = () => {
  const [currentTab, setCurrentTab] = createSignal('characters');
  const [characters, setCharacters] = createSignal(undefined);
  const [platform, setPlatform] = createSignal(undefined);
  const [characterForm, setCharacterForm] = createStore({
    name: '',
    race: undefined,
    subrace: undefined,
    main_class: undefined,
    alignment: 'neutral'
  });

  const [appState, { navigate }] = useAppState();
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
        setCurrentTab('characters');
      });
    }
  }

  // 453x750
  // 420x690
  return (
    <Switch>
      <Match when={currentTab() === 'characters'}>
        <PageHeader>
          {t('charactersPage.title')}
        </PageHeader>
        <div class="p-4 flex-1 overflow-y-scroll">
          <button
            class="btn mb-4 w-full uppercase"
            onClick={() => setCurrentTab('newCharacter')}
          >{t('charactersPage.new')}</button>
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
                      <div>
                        <p class="mb-1 font-medium">{character.name}</p>
                        <div class="mb-1">
                          <p class="text-xs">
                            {t('charactersPage.level')} {character.object_data.level} | {character.object_data.subrace ? t(`subraces.${character.object_data.race}.${character.object_data.subrace}`) : t(`races.${character.object_data.race}`)}
                          </p>
                        </div>
                        <p class="text-xs">
                          {Object.keys(character.object_data.classes).map((item) => t(`classes.${item}`)).join(' * ')}
                        </p>
                      </div>
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
                items={{ 'dnd5': 'D&D 5' }}
                selectedValue={platform()}
                onSelect={(value) => setPlatform(value)}
              />
              <Input
                classList="mb-2"
                labelText={t('newCharacterPage.name')}
                value={characterForm.name}
                onInput={(value) => setCharacterForm({ ...characterForm, name: value })}
              />
              <Switch>
                <Match when={platform() === 'dnd5'}>
                  <Select
                    classList="mb-2"
                    labelText={t('newCharacterPage.race')}
                    items={dict().races}
                    selectedValue={characterForm.race}
                    onSelect={(value) => setCharacterForm({ ...characterForm, race: value })}
                  />
                  <Show when={dict().subraces[characterForm.race]}>
                    <Select
                      classList="mb-2"
                      labelText={t('newCharacterPage.subrace')}
                      items={dict().subraces[characterForm.race]}
                      selectedValue={characterForm.subrace}
                      onSelect={(value) => setCharacterForm({ ...characterForm, subrace: value })}
                    />
                  </Show>
                  <Select
                    classList=""
                    labelText={t('newCharacterPage.mainClass')}
                    items={dict().classes}
                    selectedValue={characterForm.main_class}
                    onSelect={(value) => setCharacterForm({ ...characterForm, main_class: value })}
                  />
                </Match>
              </Switch>
            </div>
            <button class="btn mt-4" onClick={saveCharacter}>{t('save')}</button>
          </div>
        </div>
      </Match>
    </Switch>
  );
}
