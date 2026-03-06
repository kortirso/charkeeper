import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';

import { Button, ErrorWrapper, GuideWrapper, Toggle, Checkbox, Select } from '../../../../components';
import config from '../../../../data/fallout.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Arrow } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { fetchTalentsRequest } from '../../../../requests/fetchTalentsRequest';
import { createTalentRequest } from '../../../../requests/createTalentRequest';
import { localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    currentLevel: 'level',
    perks: 'Perks',
    existingPerkPoints: 'Available perks',
    selectedPerks: 'Selected perks',
    saveButton: 'Save',
    selectPerk: 'Select new perk',
    selectAdditionalPerk: 'Select additional perk (if you need)',
    updated: 'Character is updated',
    onlyAvailable: 'Only available perks',
    requirements: 'Requirements'
  },
  ru: {
    currentLevel: 'уровень',
    perks: 'Перки',
    existingPerkPoints: 'Доступно перков',
    selectedPerks: 'Выбранные перки',
    saveButton: 'Сохранить',
    selectPerk: 'Выберите новый перк',
    selectAdditionalPerk: 'Выберите дополнительный перк (если хотите)',
    updated: 'Персонаж обновлён',
    onlyAvailable: 'Только доступные перки',
    requirements: 'Требования'
  }
}

export const FalloutLeveling = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [selectedPerk, setSelectedPerk] = createSignal(null);

  const [perks, setPerks] = createSignal(undefined);
  const [onlyAvailable, setOnlyAvailable] = createSignal(true);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const fetchTalents = async () => await fetchTalentsRequest(appState.accessToken, character().provider, character().id);

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    Promise.all([fetchTalents()]).then(
      ([talentsData]) => {
        setPerks(talentsData.perks);
      }
    );

    setLastActiveCharacterId(character().id);
  });

  const refetchTalents = async () => {
    const result = await fetchTalents();
    performResponse(
      result,
      function() {
        setPerks(result.perks);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const defaultPerk = createMemo(() => character().perks_boosts > 0);

  const availablePerks = createMemo(() => {
    if (perks() === undefined) return {};
    return perks().filter((item) => {
      if (item.full_ranked) return false;
      if (!onlyAvailable()) return true;
      if (item.conditions.required_level > character().level) return false;
      if (Object.entries(item.conditions.attrs).filter(([slug, value]) => character().modified_abilities[slug] < value).length > 0) return false;

      return true;
    }).reduce((acc, item) => { acc[item.id] = item.title; return acc }, {});
  });

  const formatPerkRequirements = () => {
    if (!selectedPerk()) return '';

    const result = [];
    if (selectedPerk().conditions.required_level) result.push(`${localize(TRANSLATION, locale()).currentLevel} ${selectedPerk().conditions.required_level}`);
    Object.entries(selectedPerk().conditions.attrs).forEach(([slug, value]) => {
      result.push(`${localize(config.abilities[slug].shortName, locale()).toUpperCase()} ${value}`);
    });
    return result.join(', ')
  }

  const changeAvailable = () => {
    batch(() => {
      setOnlyAvailable(!onlyAvailable());
      setSelectedPerk(null);
    });
  }

  const modifySelectedPerk = async (value) => setSelectedPerk(perks().find((item) => item.id === value));

  const levelUp = async () => {
    await updateCharacter({ level: character().level + 1 });
    refetchTalents();
  }

  const savePerk = async () => {
    const result = await createTalentRequest(
      appState.accessToken, character().provider, character().id, { talent_id: selectedPerk().id, additional: !defaultPerk() }
    );
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReloadCharacter();
        setSelectedPerk(null);
        refetchTalents();
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload });
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReplaceCharacter(result.character);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'FalloutLeveling' }}>
      <GuideWrapper
        character={character()}
        guideStep={4}
        helpMessage={props.helpMessage}
        onReloadCharacter={props.onReloadCharacter}
        finishGuideStep={true}
      >
        <div class="blockable py-4 px-2 md:px-4 mb-2">
          <div class="flex items-center">
            <Button default classList="rounded mr-4" onClick={levelUp}><Arrow top /></Button>
            <p>{character().level} {localize(TRANSLATION, locale()).currentLevel}</p>
          </div>
        </div>
        <Toggle
          title={
            <div class="flex justify-between">
              <p>{localize(TRANSLATION, locale()).perks}</p>
              <p>{localize(TRANSLATION, locale()).existingPerkPoints} - {character().perks_boosts}</p>
            </div>
          }
        >
          <Show when={perks() && Object.keys(character().perks).length > 0}>
            <p class="text-sm mb-2">{localize(TRANSLATION, locale()).selectedPerks}</p>
            <For each={Object.entries(character().perks)}>
              {([id, amount]) =>
                <p class="text-lg">{perks().find((item) => item.id === id).title}{amount > 1 ? ` - ${amount}` : ''}</p>
              }
            </For>
            <div class="mb-2" />
          </Show>
          <Checkbox
            labelText={localize(TRANSLATION, locale()).onlyAvailable}
            labelPosition="right"
            labelClassList="ml-2"
            classList="mb-2"
            checked={onlyAvailable()}
            onToggle={changeAvailable}
          />
          <Select
            labelText={localize(TRANSLATION, locale())[defaultPerk() ? 'selectPerk' : 'selectAdditionalPerk']}
            containerClassList="flex-1"
            items={availablePerks()}
            selectedValue={selectedPerk()?.id}
            onSelect={modifySelectedPerk}
          />
          <Show when={selectedPerk()}>
            <p class="text-sm mt-2">
              <strong>{localize(TRANSLATION, locale()).requirements}:</strong> {formatPerkRequirements()}
            </p>
            <p
              class="feat-markdown text-xs mt-1"
              innerHTML={selectedPerk().description} // eslint-disable-line solid/no-innerhtml
            />
            <Button default textable size="small" classList="inline-block! mt-2" onClick={savePerk}>
              {localize(TRANSLATION, locale()).saveButton}
            </Button>
          </Show>
        </Toggle>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
