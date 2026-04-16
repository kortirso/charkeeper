import { createSignal, createEffect, For, Show, batch } from 'solid-js';

import { ErrorWrapper, GuideWrapper, Button, Select } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus, Edit } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize, readFromCache, writeToCache } from '../../../../helpers';

const TRANSLATION = {
  en: {
    proficiency: 'Proficiency',
    evasion: 'Evasion',
    armor_score: 'Armor Score',
    rallyDice: 'Rally Dice',
    settings: 'Settings',
    showRallyDice: 'Show Rally Dice'
  },
  ru: {
    proficiency: 'Мастерство',
    evasion: 'Уклонение',
    armor_score: 'Очки Доспеха',
    rallyDice: 'Кость сплочения',
    settings: 'Настройки',
    showRallyDice: 'Показывать кости сплочения'
  },
  es: {
    proficiency: 'Competencia',
    evasion: 'Evasión',
    armor_score: 'Puntuación de armadura',
    rallyDice: 'Rally Dice',
    settings: 'Configuración',
    showRallyDice: 'Mostrar Rally Dice'
  }
}
const SETTINGS_CACHE_NAME = 'DaggerheartStaticSettings';

export const DaggerheartStatic = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);

  const [rallyDice, setRallyDice] = createSignal(character().rally_dice || 6);

  const [showSettings, setShowSettings] = createSignal(false);
  const [settings, setSettings] = createSignal([]);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const readSettings = async () => {
    const cacheValue = await readFromCache(SETTINGS_CACHE_NAME);
    setSettings(cacheValue === null || cacheValue === undefined ? ['showRallyDice'] : cacheValue.split(','));
  }

  const updateSettings = (value) => {
    const newValue = settings().includes(value) ? settings().filter((item) => item !== value) : settings().concat([value]);
    batch(() => {
      writeToCache(SETTINGS_CACHE_NAME, newValue.join(','));
      setSettings(newValue);
    })
  }

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    setLastActiveCharacterId(character().id);
    readSettings();
  });

  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload, only_head: true });
    if (result.errors_list === undefined) props.onReplaceCharacter(payload);
    else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartStatic' }}>
      <GuideWrapper character={character()}>
        <div class="blockable py-4 relative">
          <Show when={showSettings()}>
            <Select
              multi
              containerClassList="w-full md:w-1/2 mb-4"
              labelText={localize(TRANSLATION, locale()).settings}
              items={{
                'showRallyDice': localize(TRANSLATION, locale()).showRallyDice
              }}
              selectedValues={settings()}
              onSelect={updateSettings}
            />
          </Show>
          <div class="dh-static-box" classList={{ 'four-columns': settings().includes('showRallyDice') }}>
            <Show when={settings().includes('showRallyDice')}>
              <div>
                <p class="dh-static-title">{localize(TRANSLATION, locale()).rallyDice}</p>
                <div class="flex justify-center items-center gap-x-4">
                  <Button default size="small" onClick={() => rallyDice() === 6 ? null : setRallyDice(rallyDice() - 2)}>
                    <Minus />
                  </Button>
                  <p
                    class="text-center uppercase text-lg cursor-pointer"
                    classList={{ 'opacity-50': character().rally_dice === null }}
                    onClick={() => updateCharacter({ rally_dice: (character().rally_dice ? null : rallyDice()) })}
                  >
                    D{character().rally_dice || rallyDice()}
                  </p>
                  <Button default size="small" onClick={() => rallyDice() === 8 ? null : setRallyDice(rallyDice() + 2)}>
                    <Plus />
                  </Button>
                </div>
              </div>
            </Show>
            <For each={['proficiency', 'evasion', 'armor_score']}>
              {(slug) =>
                <div>
                  <p class="dh-static-title">{localize(TRANSLATION, locale())[slug]}</p>
                  <p class="dh-static-value">{character()[slug]}</p>
                </div>
              }
            </For>
          </div>
          <Button default classList="weapon-settings min-w-6 min-h-6" onClick={() => setShowSettings(!showSettings())}><Edit /></Button>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
