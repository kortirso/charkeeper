import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { ErrorWrapper, GuideWrapper, Toggle, Button, Input, IconButton, Checkbox } from '../../../../components';
import { Close, Plus, Minus } from '../../../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { localize, apiRequest, options, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    newForm: 'Add Wild Form',
    name: 'Name',
    save: 'Save',
    cancel: 'Cancel',
    groups: {
      'Senses': 'Senses',
      'Mobility': 'Mobility',
      'Jumping': 'Jumping',
      'Flying': 'Flying',
      'Body': 'Body',
      'Natural Weapon': 'Natural Weapon',
      'Miscellaneous': 'Miscellaneous'
    },
    showDescription: 'Show description',
    showSelected: 'Show only selected features',
    wildTraits: 'Wild Form traits',
    update: 'Update',
    updated: 'Updated'
  },
  ru: {
    newForm: 'Добавить дикую форму',
    name: 'Название',
    save: 'Сохранить',
    cancel: 'Отменить',
    groups: {
      'Senses': 'Чувства',
      'Mobility': 'Подвижность',
      'Jumping': 'Прыгучесть',
      'Flying': 'Полёт',
      'Body': 'Тело',
      'Natural Weapon': 'Оружие',
      'Miscellaneous': 'Разное'
    },
    showDescription: 'Показывать описание',
    showSelected: 'Показывать только выбранные способности',
    wildTraits: 'Способности дикой формы',
    update: 'Обновить',
    updated: 'Дикая форма обновлена'
  }
}

const fetchFeatsRequest = async (accessToken) => {
  return await apiRequest({
    url: '/frontend/dc20/wild_forms.json',
    options: options('GET', accessToken)
  });
}

const fetchWildFormsRequest = async (accessToken, characterId) => {
  return await apiRequest({
    url: `/frontend/dc20/characters/${characterId}/wild_forms.json`,
    options: options('GET', accessToken)
  });
}

const createWildFormRequest = async (accessToken, characterId, payload) => {
  return await apiRequest({
    url: `/frontend/dc20/characters/${characterId}/wild_forms.json`,
    options: options('POST', accessToken, payload)
  });
}

const updateWildFormRequest = async (accessToken, characterId, payload, id) => {
  return await apiRequest({
    url: `/frontend/dc20/characters/${characterId}/wild_forms/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}

const removeWildFormRequest = async (accessToken, characterId, id) => {
  return await apiRequest({
    url: `/frontend/dc20/characters/${characterId}/wild_forms/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

export const Dc20WildForms = (props) => {
  const character = () => props.character;

  const [lastCharacterId, setLastCharacterId] = createSignal(undefined);
  const [createMode, setCreateMode] = createSignal(false);
  const [showDescription, setShowDescription] = createSignal(false);
  const [showSelected, setShowSelected] = createSignal(false);

  const [feats, setFeats] = createSignal(undefined);
  const [wildForms, setWildForms] = createSignal(undefined);
  const [wildFormsData, setWildFormsData] = createSignal(undefined);

  const [form, setForm] = createStore({ name: '' });

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastCharacterId() === character().id) return;

    const fetchFeats = async () => await fetchFeatsRequest(appState.accessToken);
    const fetchWildForms = async () => await fetchWildFormsRequest(appState.accessToken, character().id);

    Promise.all([fetchFeats(), fetchWildForms()]).then(
      ([featsData, wildFormsData]) => {
        batch(() => {
          setFeats(featsData.features.filter((item) => item.price >= 0 && item.slug !== 'natural_weapon'));
          setWildForms(wildFormsData.wild_forms);
          setWildFormsData(
            wildFormsData.wild_forms.reduce((acc, element) => {
              acc[element.id] = element.data.ancestry_features;
              return acc;
            }, {})
          );
        });
      }
    );

    setLastCharacterId(character().id);
  });

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const refreshCharacter = () => {
    const current = wildForms().reduce((acc, element) => {
      acc[element.id] = element.name;
      return acc;
    }, {})
    props.onReplaceCharacter({ wild_forms: current });
  }

  const createWildForm = async () => {
    const result = await createWildFormRequest(appState.accessToken, character().id, { wild_form: form });
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        batch(() => {
          setWildForms([result.wild_form].concat(wildForms()));
          setWildFormsData({ ...wildFormsData(), [result.wild_form.id]: {} })
          setCreateMode(false);
        });
        refreshCharacter();
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const changeWildForm = async (id) => {
    const result = await updateWildFormRequest(appState.accessToken, character().id, { wild_form: { ancestry_features: wildFormsData()[id] }, only_head: true }, id);
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        renderNotice(i18n().updated);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const removeWildForm = async (event, id) => {
    event.stopPropagation();
    if (character().wild_form === id) return;

    const result = await removeWildFormRequest(appState.accessToken, character().id, id);
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        setWildForms(wildForms().filter((item) => item.id !== id));
        refreshCharacter();
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const changeMultiple = (wildFormId, slug, coef) => {
    let newValue;
    const current = wildFormsData()[wildFormId] || {};

    if (coef === -1) {
      newValue = { ...wildFormsData()[wildFormId], [slug]: current[slug] - 1 };
    } else {
      if (current[slug]) {
        newValue = { ...wildFormsData()[wildFormId], [slug]: current[slug] + 1 };
      } else {
        newValue = { ...wildFormsData()[wildFormId], [slug]: 1 };
      }
    }
    setWildFormsData({ ...wildFormsData(), [wildFormId]: newValue });
  }

  const renderFeature = (wildFormId, item) => (
    <Show when={!showSelected() || (wildFormsData()[wildFormId][item.slug] && wildFormsData()[wildFormId][item.slug] > 0)}>
      <div class="ancestry-item">
        <Show
          when={item.info.multiple}
          fallback={
            <Checkbox
              labelText={`${item.title} (${item.price})`}
              labelPosition="right"
              labelClassList="ml-2"
              checked={wildFormsData()[wildFormId][item.slug]}
              onToggle={() => wildFormsData()[wildFormId][item.slug] ? changeMultiple(wildFormId, item.slug, -1) : changeMultiple(wildFormId, item.slug, 1)}
            />
          }
        >
          <div class="flex items-center gap-2">
            <Button default size="small" classList="opacity-75" disable={wildFormsData()[wildFormId][item.slug] || 0} onClick={() => changeMultiple(wildFormId, item.slug, -1)}>
              <Minus />
            </Button>
            <p class="text-center">{wildFormsData()[wildFormId][item.slug] || 0}</p>
            <Button default size="small" classList="opacity-75" onClick={() => changeMultiple(wildFormId, item.slug, 1)}>
              <Plus />
            </Button>
            <p class="text-sm ">{item.title} ({item.price})</p>
          </div>
        </Show>
        <Show when={showDescription()}>
          <p
            class="feat-markdown text-xs! mt-1"
            innerHTML={item.description} // eslint-disable-line solid/no-innerhtml
          />
        </Show>
      </div>
    </Show>
  );

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20WildForms' }}>
      <GuideWrapper character={character()}>
        <Show
          when={!createMode()}
          fallback={
            <div class="blockable blockable-padding">
              <Input labelText={i18n().name} value={form.name} onInput={(value) => setForm({ ...form, name: value })} />
              <div class="flex justify-end mt-4 gap-4">
                <Button outlined textable size="small" onClick={() => setCreateMode(false)}><span>{i18n().cancel}</span></Button>
                <Button default textable size="small" onClick={createWildForm}><span>{i18n().save}</span></Button>
              </div>
            </div>
          }
        >
          <Button default textable classList="mb-2 uppercase" onClick={() => setCreateMode(true)}><span>{i18n().newForm}</span></Button>
          <Show when={wildForms() !== undefined}>
            <Checkbox
              labelText={i18n().showDescription}
              labelPosition="right"
              labelClassList="ml-2"
              checked={showDescription()}
              classList="mb-2"
              onToggle={() => setShowDescription(!showDescription())}
            />
            <Checkbox
              labelText={i18n().showSelected}
              labelPosition="right"
              labelClassList="ml-2"
              checked={showSelected()}
              classList="mb-2"
              onToggle={() => setShowSelected(!showSelected())}
            />
            <For each={wildForms()}>
              {(wildForm) =>
                <Toggle title={
                  <div class="flex items-center">
                    <p class="flex-1">{wildForm.name}</p>
                    <Show when={wildForm.id !== character().wild_form}>
                      <IconButton onClick={(e) => removeWildForm(e, wildForm.id)}><Close /></IconButton>
                    </Show>
                  </div>
                }>
                  <div class="flex flex-col gap-2">
                    <div>
                      <p class="mb-2">{i18n().wildTraits}</p>
                      <For each={feats().filter((item) => item.origin_value !== 'beastborn').sort((a, b) => a.price < b.price)}>
                        {(item) =>
                          renderFeature(wildForm.id, item)
                        }
                      </For>
                    </div>
                    <For each={Object.entries(i18n().groups)}>
                      {([group, name]) =>
                        <div>
                          <p class="mb-2">{name}</p>
                          <For each={feats().filter((item) => item.origin_value === 'beastborn' && item.info.group === group).sort((a, b) => a.price < b.price)}>
                            {(item) =>
                              renderFeature(wildForm.id, item)
                            }
                          </For>
                        </div>
                      }
                    </For>
                    <div class="flex justify-end mt-2">
                      <Button default textable size="small" onClick={() => changeWildForm(wildForm.id)}><span>{i18n().update}</span></Button>
                    </div>
                  </div>
                </Toggle>
              }
            </For>
          </Show>
        </Show>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
