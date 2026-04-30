import { createSignal, createEffect, For, Show, batch } from 'solid-js';
import { Key } from '@solid-primitives/keyed';

import { Button, ErrorWrapper, Toggle, Checkbox, Input, TextArea, Text } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import config from '../../../../data/cosmere.json';
import { Upgrade, Close } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { fetchItemsRequest } from '../../../../requests/fetchItemsRequest';
import { fetchTalentsRequest } from '../../../../requests/fetchTalentsRequest';
import { createTalentRequest } from '../../../../requests/createTalentRequest';
import { removeTalentRequest } from '../../../../requests/removeTalentRequest';
import { localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    currentLevel: 'level',
    updated: 'Character is updated',
    expertises: 'Expertises',
    add: 'Add expertise',
    expName: 'Expertise name',
    expDesc: 'Expertise description',
    expertisesList: {
      weapon: 'Weapon',
      armor: 'Armor',
      culture: 'Culture',
      utility: 'General'
    },
    heroicTalents: 'Talents',
    showDescription: 'Show description',
    talentPoints: 'Talent points',
    nested: 'There are nested selected talents'
  },
  ru: {
    currentLevel: 'уровень',
    updated: 'Персонаж обновлён',
    expertises: 'Компетенции',
    add: 'Добавить компетенцию',
    expName: 'Название',
    expDesc: 'Описание',
    expertisesList: {
      weapon: 'Оружие',
      armor: 'Доспехи',
      culture: 'Культура',
      utility: 'Общие'
    },
    heroicTalents: 'Таланты',
    showDescription: 'Показывать описание',
    talentPoints: 'Очки талантов',
    nested: 'Сперва удалите вложенные таланты'
  },
  es: {
    currentLevel: 'nivel',
    updated: 'Personaje actualizado',
    expertises: 'Expertises',
    add: 'Add expertise',
    expName: 'Expertise name',
    expDesc: 'Expertise description',
    expertisesList: {
      weapon: 'Weapon',
      armor: 'Armor',
      culture: 'Culture',
      utility: 'General'
    },
    heroicTalents: 'Talents',
    showDescription: 'Mostrar descripción',
    talentPoints: 'Talent points',
    nested: 'There are nested selected talents'
  }
}
const ITEM_EXPERTISES = ['weapon', 'armor'];
const PADDING_MAP = { 0: 'pl-0', 1: 'pl-2', 2: 'pl-4' };

export const CosmereLeveling = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [showDescription, setShowDescription] = createSignal(false);

  const [items, setItems] = createSignal(undefined);
  const [feats, setFeats] = createSignal(undefined);
  const [featsCount, setFeatsCount] = createSignal(0);
  const [expName, setExpName] = createSignal('');
  const [expDesc, setExpDesc] = createSignal('');

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice, renderAlert }] = useAppAlert();
  const [locale] = useAppLocale();

  const fetchTalents = async () => await fetchTalentsRequest(appState.accessToken, character().provider, character().id);

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    const fetchItems = async () => await fetchItemsRequest(appState.accessToken, character().provider);

    Promise.all([fetchItems(), fetchTalents()]).then(
      ([itemsData, talentsData]) => {
        batch(() => {
          setItems(itemsData.items.filter((item) => ITEM_EXPERTISES.includes(item.kind)).sort((a, b) => a.name > b.name));
          setFeats(talentsData.feats);
          setFeatsCount(talentsData.selected_talents_count);
        });
      }
    );

    setLastActiveCharacterId(character().id);
  });

  const toggleExpertise = (kind, slug) => {
    const expertises = character().expertises[kind];
    const newValue = expertises.includes(slug) ? expertises.filter((item) => item !== slug) : expertises.concat([slug]);
    const payload = { ...character().expertises, [kind]: newValue };
    updateCharacter({ expertises: payload });
  }

  const saveNewSkill = () => {
    if (expName().length === 0 || expName().length > 50) return;
    if (expDesc().length === 0 || expDesc().length > 500) return;

    const payload = character().custom_expertises.concat([{ name: expName(), desc: expDesc() }]);
    updateCharacter({ custom_expertises: payload }, true);
  }

  const removeExpertise = (value) => {
    const payload = character().custom_expertises.filter((item) => item !== value);
    updateCharacter({ custom_expertises: payload }, true);
  }

  const updateCharacter = async (payload, onlyHead = false) => {
    const requestPayload = { character: payload, only_head: onlyHead }
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, requestPayload);
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReplaceCharacter(onlyHead ? payload : result.character);
        renderNotice(localize(TRANSLATION, locale()).updated);
        setEditMode(false);
        setExpName('');
        setExpDesc('');
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const renderFeat = (feat, index) => {
    const className = PADDING_MAP[index];

    return (
      <div class={className}>
        <Checkbox
          labelText={feat.title}
          labelPosition="right"
          labelClassList="ml-2"
          classList="p-1"
          checked={feat.selected}
          onToggle={() => feat.selected ? removeFeat(feat) : selectFeat(feat.id)}
        />
        <Show when={showDescription()}>
          <p
            class="cosmere-feat feat-markdown-small mt-1 mb-2"
            innerHTML={feat.description} // eslint-disable-line solid/no-innerhtml
          />
        </Show>
        <Show when={feat.feats}>
          <For each={feat.feats}>
            {(item) => renderFeat(item, index + 1)}
          </For>
        </Show>
      </div>
    );
  }

  const removeFeat = async (feat) => {
    if (feat.feats && feat.feats.find((item) => item.selected)) return renderAlert(localize(TRANSLATION, locale()).nested);

    const result = await removeTalentRequest(appState.accessToken, character().provider, character().id, feat.id);
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReloadCharacter();
        refetchSelectedFeats();
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const selectFeat = async (id) => {
    const result = await createTalentRequest(appState.accessToken, character().provider, character().id, { feat_id: id });
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReloadCharacter();
        refetchSelectedFeats();
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const refetchSelectedFeats = async () => {
    const result = await fetchTalents();
    performResponse(
      result,
      function() {
        batch(() => {
          setFeats(result.feats);
          setFeatsCount(result.selected_talents_count);
        });
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'CosmereLeveling' }}>
      <div class="blockable py-4 px-2 mb-2">
        <div class="flex items-center">
          <Button default classList="rounded mr-4" onClick={() => updateCharacter({ level: character().level + 1 })}>
            <Upgrade width="24" height="24" />
          </Button>
          <p>{character().level} {localize(TRANSLATION, locale()).currentLevel}</p>
        </div>
      </div>
      <Show when={items()}>
        <Toggle
          innerClassList="p-2! flex flex-col gap-2"
          title={<p>{localize(TRANSLATION, locale()).expertises}</p>}
        >
          <For each={['weapon', 'armor']}>
            {(kind) =>
              <Toggle containerClassList="mb-0!" innerClassList="p-2!" title={localize(TRANSLATION, locale()).expertisesList[kind]}>
                <For each={items().filter((item) => item.kind === kind)}>
                  {(item) =>
                    <div class="ancestry-item">
                      <Checkbox
                        labelText={item.name}
                        labelPosition="right"
                        labelClassList="ml-2"
                        checked={character().expertises[kind].includes(item.slug)}
                        onToggle={() => toggleExpertise(kind, item.slug)}
                      />
                    </div>
                  }
                </For>
              </Toggle>
            }
          </For>
          <Toggle containerClassList="mb-0!" innerClassList="p-2!" title={localize(TRANSLATION, locale()).expertisesList.culture}>
            <For each={Object.entries(config.cultures)}>
              {([slug, values]) =>
                <div class="ancestry-item">
                  <Checkbox
                    labelText={values.name[locale()]}
                    labelPosition="right"
                    labelClassList="ml-2"
                    checked={character().expertises.culture.includes(slug)}
                    onToggle={() => toggleExpertise('culture', slug)}
                  />
                </div>
              }
            </For>
          </Toggle>
          <Toggle containerClassList="mb-0!" innerClassList="p-2!" title={localize(TRANSLATION, locale()).expertisesList.utility}>
            <div class="flex flex-col gap-4">
              <div>
                <Key each={character().custom_expertises} by={item => item.name}>
                  {(expertise) =>
                    <div class="ancestry-item flex justify-beetween items-start">
                      <Text containerClassList="flex-1" labelText={expertise().name} text={expertise().desc} />
                      <Button default size="small" classList="ml-4 opacity-75" onClick={() => removeExpertise(expertise())}>
                        <Close />
                      </Button>
                    </div>
                  }
                </Key>
              </div>
              <Show
                when={editMode()}
                fallback={<Button default textable onClick={() => setEditMode(true)}>{localize(TRANSLATION, locale()).add}</Button>}
              >
                <div>
                  <Input labelText={localize(TRANSLATION, locale()).expName} value={expName()} onInput={setExpName} />
                  <TextArea rows="3" containerClassList="mt-2" labelText={localize(TRANSLATION, locale()).expDesc} value={expDesc()} onChange={setExpDesc} />
                  <Button default textable classList="mt-2" onClick={saveNewSkill}>{localize(TRANSLATION, locale()).add}</Button>
                </div>
              </Show>
            </div>
          </Toggle>
        </Toggle>
      </Show>
      <Show when={feats()}>
        <Toggle
          innerClassList="p-2! flex flex-col gap-2"
          title={
            <div class="flex justify-between items-center">
              <p>{localize(TRANSLATION, locale()).heroicTalents}</p>
              <p>{localize(TRANSLATION, locale()).talentPoints} - {featsCount()}/{character().talent_points}</p>
            </div>
          }
        >
          <Checkbox
            labelText={localize(TRANSLATION, locale()).showDescription}
            labelPosition="right"
            labelClassList="ml-2"
            checked={showDescription()}
            classList="mb-2"
            onToggle={() => setShowDescription(!showDescription())}
          />
          <For each={Object.entries(config.paths)}>
            {([kind, values]) =>
              <Toggle containerClassList="mb-0!" innerClassList="p-2!" title={localize(values.name, locale())}>
                {renderFeat(feats().heroic[kind], 0)}
              </Toggle>
            }
          </For>
        </Toggle>
      </Show>
    </ErrorWrapper>
  );
}
