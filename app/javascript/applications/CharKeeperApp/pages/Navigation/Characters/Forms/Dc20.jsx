import { createSignal, createEffect, For, Show, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { CharacterForm } from '../../../../pages';
import { Select, Input, Checkbox, Toggle } from '../../../../components';
import config from '../../../../data/dc20.json';
import { useAppLocale, useAppState } from '../../../../context';
import { translate } from '../../../../helpers';
import { fetchDc20AncestriesRequest } from '../../../../requests/fetchDc20AncestriesRequest';

const TRANSLATION = {
  en: {
    name: 'Name',
    ancestry: 'Ancestry',
    pointsLeft: 'Points left',
    class: 'Class',
    manyAncestriesAlert: 'Maximum 2 ancestries',
    minorTraitsAlert: 'Maximum 1 minor trait',
    negativeTraitsAlert: 'Maximum 2 negative traits'
  },
  ru: {
    name: 'Имя',
    ancestry: 'Родословная',
    pointsLeft: 'Очков осталось',
    class: 'Класс',
    manyAncestriesAlert: 'Максимум только 2 родословные',
    minorTraitsAlert: 'Максимум 1 малая черта',
    negativeTraitsAlert: 'Максимум 2 отрицательные черты'
  }
}

const DC20_DEFAULT_FORM = { name: '', main_class: undefined, ancestry_feats: {}, ancestryPoints: 5 }

export const Dc20CharacterForm = (props) => {
  const [characterDc20Form, setCharacterDc20Form] = createStore(DC20_DEFAULT_FORM);
  const [validations, setValidations] = createStore({ negativeTraits: 0, minorTraits: 0 });
  const [ancestries, setAncestries] = createSignal(undefined);

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (ancestries() !== undefined) return;

    const fetchAncestries = async () => await fetchDc20AncestriesRequest(appState.accessToken);

    Promise.all([fetchAncestries()]).then(
      ([ancestriesData]) => {
        setAncestries(ancestriesData.ancestries);
      }
    );
  });

  const selectDc20Ancestry = (ancestry, slug, featPoints) => {
    let newValue;
    let newTraitsValue;
    let newFeatPoints;
    const traitPointsName = featPoints === 0 ? 'minorTraits' : (featPoints < 0 ? 'negativeTraits' : null);

    if (characterDc20Form.ancestry_feats[ancestry]) {
      if (characterDc20Form.ancestry_feats[ancestry].includes(slug)) {
        const leftFeats = characterDc20Form.ancestry_feats[ancestry].filter((item) => item !== slug);

        if (leftFeats.length === 0) {
          newValue = Object.fromEntries(Object.entries(characterDc20Form.ancestry_feats).filter(([item,]) => item !== ancestry));
        } else newValue = { ...characterDc20Form.ancestry_feats, [ancestry]: leftFeats };

        if (traitPointsName) newTraitsValue = validations[traitPointsName] - 1;
        newFeatPoints = -featPoints;
      } else {
        newValue = { ...characterDc20Form.ancestry_feats, [ancestry]: characterDc20Form.ancestry_feats[ancestry].concat([slug]) };
        if (traitPointsName) newTraitsValue = validations[traitPointsName] + 1;
        newFeatPoints = featPoints;
      }
    } else {
      newValue = { ...characterDc20Form.ancestry_feats, [ancestry]: [slug] };
      if (traitPointsName) newTraitsValue = validations[traitPointsName] + 1;
      newFeatPoints = featPoints;
    }

    batch(() => {
      setCharacterDc20Form({ ...characterDc20Form, ancestryPoints: characterDc20Form.ancestryPoints - newFeatPoints, ancestry_feats: newValue });
      if (traitPointsName) setValidations({ ...validations, [traitPointsName]: newTraitsValue });
    });
  }

  const saveCharacter = async () => {
    const result = await props.onCreateCharacter(characterDc20Form);

    if (result === null) {
      batch(() => {
        setCharacterDc20Form({
          name: '', main_class: undefined, ancestryPoints: 5, ancestry_feats: {}
        });
        setValidations({ negativeTraits: 0, minorTraits: 0 });
      });
    }
  }

  return (
    <CharacterForm loading={props.loading} setCurrentTab={props.setCurrentTab} onSaveCharacter={saveCharacter}>
      <Input
        containerClassList="mb-2"
        labelText={TRANSLATION[locale()]['name']}
        value={characterDc20Form.name}
        onInput={(value) => setCharacterDc20Form({ ...characterDc20Form, name: value })}
      />
      <Select
        containerClassList="mb-4"
        labelText={TRANSLATION[locale()]['class']}
        items={translate(config.classes, locale())}
        selectedValue={characterDc20Form.main_class}
        onSelect={(value) => setCharacterDc20Form({ ...characterDc20Form, main_class: value })}
      />
      <Show when={ancestries()}>
        <Toggle
          noInnerPadding
          title={
            <div class="flex items-center justify-between">
              <p>{TRANSLATION[locale()]['ancestry']}</p>
              <p>{`${TRANSLATION[locale()]['pointsLeft']} - ${characterDc20Form.ancestryPoints}`}</p>
            </div>
          }
        >
          <For each={Object.entries(config.ancestries)}>
            {([ancestry, values]) =>
              <Show when={Object.keys(characterDc20Form.ancestry_feats).length < 2 || characterDc20Form.ancestry_feats[ancestry]}>
                <Toggle title={<p>{values.name[locale()]}</p>}>
                  <For each={ancestries().filter((item) => item.origin_value === ancestry)}>
                    {(item) =>
                      <Checkbox
                        labelText={`${item.title} (${item.price})`}
                        labelPosition="right"
                        labelClassList="ml-2"
                        checked={characterDc20Form.ancestry_feats[ancestry]?.includes(item.slug)}
                        classList="mr-1 mb-1"
                        onToggle={() => selectDc20Ancestry(ancestry, item.slug, item.price)}
                      />
                    }
                  </For>
                </Toggle>
              </Show>
            }
          </For>
        </Toggle>
      </Show>
      <Show when={Object.keys(characterDc20Form.ancestry_feats).length > 2}>
        <p class="warning">{TRANSLATION[locale()]['manyAncestriesAlert']}</p>
      </Show>
      <Show when={validations.minorTraits > 1}>
        <p class="warning">{TRANSLATION[locale()]['minorTraitsAlert']}</p>
      </Show>
      <Show when={validations.negativeTraits > 2}>
        <p class="warning">{TRANSLATION[locale()]['negativeTraitsAlert']}</p>
      </Show>
    </CharacterForm>
  );
}
