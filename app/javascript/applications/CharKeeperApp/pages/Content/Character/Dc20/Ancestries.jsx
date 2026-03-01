import { createSignal, createEffect, Show, For, batch } from 'solid-js';

import { Button, ErrorWrapper, Toggle, Checkbox } from '../../../../components';
import config from '../../../../data/dc20.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { fetchDc20AncestriesRequest } from '../../../../requests/fetchDc20AncestriesRequest';
import { fetchDc20CharacterAncestriesRequest } from '../../../../requests/fetchDc20CharacterAncestriesRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    saveButton: 'Save',
    ancestries: 'Ancestries',
    ancestryPoints: 'Points',
    manyAncestriesAlert: 'Maximum 2 ancestries',
    minorTraitsAlert: 'Maximum 1 minor trait',
    negativeTraitsAlert: 'Maximum 2 negative traits'
  },
  ru: {
    saveButton: 'Сохранить',
    ancestries: 'Родословные',
    ancestryPoints: 'Очков',
    manyAncestriesAlert: 'Максимум только 2 родословные',
    minorTraitsAlert: 'Максимум 1 малая черта',
    negativeTraitsAlert: 'Максимум 2 отрицательные черты'
  }
}

export const Dc20Ancestries = (props) => {
  const character = () => props.character;

  const [ancestries, setAncestries] = createSignal(undefined);
  const [availableAncestries, setAvailableAncestries] = createSignal([]);

  const [ancestriesForm, setAncestriesForm] = createSignal({ ancestry_feats: {}, ancestry_points: 5 });
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

  const saveAncestry = async () => {
    if (Object.keys(ancestriesForm().ancestry_feats).length > 2) return renderAlert(localize(TRANSLATION, locale()).manyAncestriesAlert);
    if (validations().negativeTraits > 2) return renderAlert(localize(TRANSLATION, locale()).negativeTraitsAlert);
    if (validations().minorTraits > 1) return renderAlert(localize(TRANSLATION, locale()).minorTraitsAlert);

    props.onSave(ancestriesForm());
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20Ancestries' }}>
      <Show when={ancestries()}>
        <Toggle
          title={
            <div class="flex justify-between">
              <p>{localize(TRANSLATION, locale()).ancestries}</p>
              <p>{localize(TRANSLATION, locale()).ancestryPoints} - {ancestriesForm().ancestry_points}</p>
            </div>
          }
        >
          <>
            <For each={Object.entries(config.ancestries).filter(([ancestry]) => availableAncestries().includes(ancestry))}>
              {([ancestry, values]) =>
                <Show when={Object.keys(ancestriesForm().ancestry_feats).length < 2 || ancestriesForm().ancestry_feats[ancestry]}>
                  <Toggle
                    title={<p>{values.name[locale()]}{ancestriesForm().ancestry_feats[ancestry] ? ` (${ancestriesForm().ancestry_feats[ancestry].length})` : ''}</p>}
                  >
                    <For each={ancestries().filter((item) => item.origin_value === ancestry).sort((a, b) => a.price < b.price)}>
                      {(item) =>
                        <Checkbox
                          labelText={`${item.title} (${item.price})`}
                          labelPosition="right"
                          labelClassList="ml-2"
                          checked={ancestriesForm().ancestry_feats[ancestry]?.includes(item.slug)}
                          classList="mr-1 mb-1"
                          onToggle={() => selectDc20Ancestry(ancestry, item.slug, item.price)}
                        />
                      }
                    </For>
                  </Toggle>
                </Show>
              }
            </For>
            <Show when={character()}>
              <Button default textable size="small" classList="inline-block mt-2" onClick={saveAncestry}>
                {localize(TRANSLATION, locale()).saveButton}
              </Button>
            </Show>
          </>
        </Toggle>
      </Show>
    </ErrorWrapper>
  );
}
