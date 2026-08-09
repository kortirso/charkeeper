import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';

import { Button, ErrorWrapper, Toggle, Checkbox, Select } from '../../../../components';
import config from '../../../../data/dc20.json';
import { Plus, Minus } from '../../../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { fetchDc20AncestriesRequest } from '../../../../requests/fetchDc20AncestriesRequest';
import { fetchDc20CharacterAncestriesRequest } from '../../../../requests/fetchDc20CharacterAncestriesRequest';
import { localize, translate } from '../../../../helpers';

const TRANSLATION = {
  en: {
    saveButton: 'Save',
    ancestries: 'Ancestries',
    ancestryPoints: 'Points',
    minorTraitsAlert: 'Maximum 1 minor trait',
    negativeTraitsAlert: 'Maximum 2 negative traits',
    showDescription: 'Show description',
    defaultRace: 'Use default races',
    groups: {
      'Senses': 'Senses',
      'Mobility': 'Mobility',
      'Jumping': 'Jumping',
      'Flying': 'Flying',
      'Body': 'Body',
      'Natural Weapon': 'Natural Weapon',
      'Miscellaneous': 'Miscellaneous'
    }
  },
  ru: {
    saveButton: 'Сохранить',
    ancestries: 'Родословные',
    ancestryPoints: 'Очков',
    minorTraitsAlert: 'Максимум 1 малая черта',
    negativeTraitsAlert: 'Максимум 2 отрицательные черты',
    showDescription: 'Показывать описание',
    defaultRace: 'Стандартные расы',
    groups: {
      'Senses': 'Чувства',
      'Mobility': 'Подвижность',
      'Jumping': 'Прыгучесть',
      'Flying': 'Полёт',
      'Body': 'Тело',
      'Natural Weapon': 'Оружие',
      'Miscellaneous': 'Разное'
    }
  },
  es: {
    saveButton: 'Guardar',
    ancestries: 'Ancestrías',
    ancestryPoints: 'Puntos',
    minorTraitsAlert: 'Máximo 1 rasgo menor',
    negativeTraitsAlert: 'Máximo 2 rasgos negativos',
    showDescription: 'Mostrar descripción',
    defaultRace: 'Use default races',
    groups: {
      'Senses': 'Senses',
      'Mobility': 'Mobility',
      'Jumping': 'Jumping',
      'Flying': 'Flying',
      'Body': 'Body',
      'Natural Weapon': 'Natural Weapon',
      'Miscellaneous': 'Miscellaneous'
    }
  }
}

export const Dc20Ancestries = (props) => {
  const character = () => props.character;

  const [ancestries, setAncestries] = createSignal(undefined);
  const [availableAncestries, setAvailableAncestries] = createSignal([]);
  const [showDescription, setShowDescription] = createSignal(false);
  const [defaultRace, setDefaultRace] = createSignal(true);

  const [ancestriesForm, setAncestriesForm] = createSignal({ ancestry_feats: {}, ancestry_points: 5, default_ancestry: null });
  const [validations, setValidations] = createSignal({ negativeTraits: 0, minorTraits: 0 });

  const [appState] = useAppState();
  const [{ renderAlert }] = useAppAlert();
  const [locale] = useAppLocale();

  const fetchAncestries = async () => await fetchDc20AncestriesRequest(appState.accessToken);
  const fetchCharacterAncestries = async () => await fetchDc20CharacterAncestriesRequest(appState.accessToken, character().id);

  createEffect(() => {
    if (ancestries() !== undefined) return;

    if (props.character) {
      Promise.all([fetchAncestries(), fetchCharacterAncestries()]).then(
        ([ancestriesData, characterAncestriesData]) => {
          let validations = { negativeTraits: 0, minorTraits: 0 };

          Object.entries(characterAncestriesData).forEach(([race, features]) => {
            features.forEach((feature) => {
              const current = ancestriesData.ancestries.find((item) => item.origin_value === race && item.slug === feature);
              if (current) {
                if (current.price === 0) validations = { ...validations, minorTraits: validations.minorTraits + 1 };
                if (current.price < 0) validations = { ...validations, negativeTraits: validations.negativeTraits + 1 };
              }
            });
          });

          batch(() => {
            setAncestries(ancestriesData.ancestries);
            setAvailableAncestries([...new Set(ancestriesData.ancestries.map((item) => item.origin_value))]);
            setAncestriesForm({ ancestry_feats: characterAncestriesData, ancestry_points: character().ancestry_points });
            setValidations(validations);
          });
        }
      );
    } else {
      Promise.all([fetchAncestries()]).then(
        ([ancestriesData]) => {
          batch(() => {
            setAncestries(ancestriesData.ancestries);
            setAvailableAncestries([...new Set(ancestriesData.ancestries.map((item) => item.origin_value))]);
          });
        }
      );
    }
  });

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const selectDc20Ancestry = (ancestry, slug, featPoints) => {
    let newValue;
    let newTraitsValue;
    let newFeatPoints;
    const traitPointsName = featPoints === 0 ? 'minorTraits' : (featPoints < 0 ? 'negativeTraits' : null);

    if (ancestriesForm().ancestry_feats[ancestry]) {
      if (ancestriesForm().ancestry_feats[ancestry].includes(slug)) {
        const leftFeats = ancestriesForm().ancestry_feats[ancestry].filter((item) => item !== slug);

        if (leftFeats.length === 0) {
          newValue = Object.fromEntries(Object.entries(ancestriesForm().ancestry_feats).filter(([item,]) => item !== ancestry));
        } else newValue = { ...ancestriesForm().ancestry_feats, [ancestry]: leftFeats };

        if (traitPointsName) newTraitsValue = validations()[traitPointsName] - 1;
        newFeatPoints = -featPoints;
      } else {
        newValue = { ...ancestriesForm().ancestry_feats, [ancestry]: ancestriesForm().ancestry_feats[ancestry].concat([slug]) };
        if (traitPointsName) newTraitsValue = validations()[traitPointsName] + 1;
        newFeatPoints = featPoints;
      }
    } else {
      newValue = { ...ancestriesForm().ancestry_feats, [ancestry]: [slug] };
      if (traitPointsName) newTraitsValue = validations()[traitPointsName] + 1;
      newFeatPoints = featPoints;
    }

    batch(() => {
      setAncestriesForm({ ...ancestriesForm(), ancestry_points: ancestriesForm().ancestry_points - newFeatPoints, ancestry_feats: newValue });
      if (traitPointsName) setValidations({ ...validations(), [traitPointsName]: newTraitsValue });
    });

    if (props.forNewCharacter) props.onUpdateForm(ancestriesForm(), validations());
  }

  const changeMultiple = (ancestry, slug, featPoints, coef) => {
    let newValue;
    const current = ancestriesForm().ancestry_feats[ancestry] || [];

    if (coef === -1) {
      if (current.includes(slug)) {
        const index = current.indexOf(slug);
        current.splice(index, 1);
        newValue = { ...ancestriesForm().ancestry_feats, [ancestry]: current };
      } else {
        newValue = { ...ancestriesForm().ancestry_feats, [ancestry]: current };
      }
    } else {
      current.push(slug);
      newValue = { ...ancestriesForm().ancestry_feats, [ancestry]: current };
    }

    setAncestriesForm({ ...ancestriesForm(), ancestry_points: ancestriesForm().ancestry_points - featPoints, ancestry_feats: newValue });

    if (props.forNewCharacter) props.onUpdateForm(ancestriesForm(), validations());
  }

  const selectAncestry = (ancestry) => {
    setAncestriesForm({ ...ancestriesForm(), default_ancestry: ancestry });
    props.onUpdateForm(ancestriesForm(), validations());
  }

  const saveAncestry = async () => {
    if (validations().negativeTraits > 2) return renderAlert(i18n().negativeTraitsAlert);
    if (validations().minorTraits > 1) return renderAlert(i18n().minorTraitsAlert);

    props.onSave(ancestriesForm());
  }

  const renderFeature = (ancestry, item) => (
    <div class="ancestry-item">
      <Show
        when={item.info.multiple}
        fallback={
          <Checkbox
            labelText={`${item.title} (${item.price})`}
            labelPosition="right"
            labelClassList="ml-2"
            checked={ancestriesForm().ancestry_feats[ancestry]?.includes(item.slug)}
            onToggle={() => selectDc20Ancestry(ancestry, item.slug, item.price)}
          />
        }
      >
        <div class="flex items-center gap-2">
          <Button default size="small" classList="opacity-75" disable={[undefined, 0].includes(ancestriesForm().ancestry_feats[ancestry]?.filter((el) => el === item.slug)?.length)} onClick={() => changeMultiple(ancestry, item.slug, item.price * -1, -1)}>
            <Minus />
          </Button>
          <p class="text-center">{ancestriesForm().ancestry_feats[ancestry]?.filter((el) => el === item.slug)?.length || 0}</p>
          <Button default size="small" classList="opacity-75" onClick={() => changeMultiple(ancestry, item.slug, item.price * 1, 1)}>
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
  )

  return (
    <ErrorWrapper payload={{ character_id: character()?.id, key: 'Dc20Ancestries' }}>
      <Show when={ancestries()}>
        <Show when={props.forNewCharacter}>
          <Checkbox
            labelText={i18n().defaultRace}
            labelPosition="right"
            labelClassList="ml-2"
            checked={defaultRace()}
            classList="mb-2"
            onToggle={() => setDefaultRace(!defaultRace())}
          />
        </Show>
        <Show
          when={props.character || (props.forNewCharacter && !defaultRace())}
          fallback={
            <Select
              containerClassList="mb-4"
              labelText={i18n().defaultRace}
              items={translate(Object.fromEntries(Object.entries(config.ancestries).filter(([, values]) => values.default !== false)), locale(), true)}
              selectedValue={ancestriesForm().default_ancestry}
              onSelect={selectAncestry}
            />
          }
        >
          <Toggle
            innerClassList="p-2!"
            title={
              <div class="flex justify-between">
                <p>{i18n().ancestries}</p>
                <p>{i18n().ancestryPoints} - {ancestriesForm().ancestry_points}</p>
              </div>
            }
          >
            <>
              <Checkbox
                labelText={i18n().showDescription}
                labelPosition="right"
                labelClassList="ml-2"
                checked={showDescription()}
                classList="mb-2"
                onToggle={() => setShowDescription(!showDescription())}
              />
              <For each={Object.entries(config.ancestries).filter(([ancestry]) => availableAncestries().includes(ancestry))}>
                {([ancestry, values]) =>
                  <Toggle
                    innerClassList="p-2!"
                    title={<p>{localize(values.name, locale())}{ancestriesForm().ancestry_feats[ancestry] ? ` (${ancestriesForm().ancestry_feats[ancestry].length})` : ''}</p>}
                  >
                    <Show
                      when={values.default !== false}
                      fallback={
                        <div class="flex flex-col gap-2">
                          <For each={Object.entries(i18n().groups)}>
                            {/* Зверорожденные */}
                            {([group, name]) =>
                              <div>
                                <p class="mb-2">{name}</p>
                                <For each={ancestries().filter((item) => item.origin_value === ancestry && item.info.group === group).sort((a, b) => a.price < b.price)}>
                                  {(item) =>
                                    renderFeature(ancestry, item)
                                  }
                                </For>
                              </div>
                            }
                          </For>
                        </div>
                      }
                    >
                      {/* обычные расы с одноразовым селектом */}
                      <For each={ancestries().filter((item) => item.origin_value === ancestry).sort((a, b) => a.price < b.price)}>
                        {(item) =>
                          renderFeature(ancestry, item)
                        }
                      </For>
                    </Show>
                  </Toggle>
                }
              </For>
              <Show when={character()}>
                <Button default textable size="small" classList="inline-block mt-2" onClick={saveAncestry}>
                  {i18n().saveButton}
                </Button>
              </Show>
            </>
          </Toggle>
        </Show>
      </Show>
    </ErrorWrapper>
  );
}
