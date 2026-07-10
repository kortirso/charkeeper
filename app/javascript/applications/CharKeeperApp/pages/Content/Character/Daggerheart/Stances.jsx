import { createEffect, createSignal, Show, For, batch } from 'solid-js';

import { Select, ErrorWrapper, GuideWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    available: 'Select available mechanics',
    active: 'Active mechanics'
  },
  ru: {
    available: 'Выберите доступные механики',
    active: 'Активные механики'
  },
  es: {
    available: 'Select available mechanics',
    active: 'Active mechanics'
  }
}

export const DaggerheartStances = (props) => {
  const character = () => props.character;

  const [lastActiveObjectId, setLastActiveObjectId] = createSignal(undefined);
  const [availableMechanics, setAvailableMechanics] = createSignal(character().available_mechanic_items);
  const [selectedMechanics, setSelectedMechanics] = createSignal(character().selected_mechanic_items);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveObjectId() === character().id) return;

    batch(() => {
      setAvailableMechanics(character().available_mechanic_items);
      setSelectedMechanics(character().selected_mechanic_items);
      setLastActiveObjectId(character().id);
    });
  });

  const updateAvailableMechanics = (id, value) => {
    const currentValues = availableMechanics()[id] || [];
    const newValue = currentValues.includes(value) ? currentValues.filter((item) => item !== value) : currentValues.concat([value]);

    setAvailableMechanics({ ...availableMechanics(), [id]: newValue });
    updateCharacter({ available_mechanic_items: availableMechanics() }, true);
  }

  const updateSelectedMechanics = (id, value) => {
    const currentValues = selectedMechanics()[id] || [];
    const newValue = currentValues.includes(value) ? currentValues.filter((item) => item !== value) : currentValues.concat([value]);

    setSelectedMechanics({ ...selectedMechanics(), [id]: newValue });
    updateCharacter({ selected_mechanic_items: selectedMechanics() });
  }

  const updateCharacter = async (payload, onlyHead=false) => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload, only_head: onlyHead }
    );

    if (result.errors_list === undefined) {
      if (!onlyHead) props.onReplaceCharacter(result.character);
    } else renderAlerts(result.errors_list);
  }

  const renderMechanic = (items, mechId) => {
    const mech = items.find((item) => item.id === mechId);
    return (
      <div>
        <p class="text-lg">{mech.title}</p>
        <p
          class="feat-markdown text-xs!"
          innerHTML={mech.description} // eslint-disable-line solid/no-innerhtml
        />
      </div>
    )
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartStances' }}>
      <GuideWrapper character={character()}>
        <div class="blockable p-4 flex flex-col gap-4">
          <Show when={lastActiveObjectId() === character().id}>
            <For each={Object.entries(character().mechanic_items)}>
              {([id, values]) =>
                <div class="flex flex-col gap-2">
                  <h2 class="text-lg">{values.title}</h2>
                  <p
                    class="feat-markdown text-xs!"
                    innerHTML={values.description} // eslint-disable-line solid/no-innerhtml
                  />
                  <Select
                    multi
                    searchable
                    containerClassList="w-full"
                    labelText={localize(TRANSLATION, locale()).available}
                    items={values.items.reduce((acc, item) => { acc[item.id] = `${item.title} T${item.tier}`; return acc; }, {})}
                    selectedValues={availableMechanics()[id] || []}
                    onSelect={(value) => updateAvailableMechanics(id, value)}
                  />
                  <Select
                    multi
                    containerClassList="w-full"
                    labelText={localize(TRANSLATION, locale()).active}
                    items={values.items.filter((item) => (availableMechanics()[id] || []).includes(item.id)).reduce((acc, item) => { acc[item.id] = `${item.title} T${item.tier}`; return acc; }, {})}
                    selectedValues={selectedMechanics()[id] || []}
                    onSelect={(value) => updateSelectedMechanics(id, value)}
                  />
                  <Show when={(selectedMechanics()[id] || []).length > 0}>
                    <For each={selectedMechanics()[id]}>
                      {(mechId) =>
                        renderMechanic(values.items, mechId)
                      }
                    </For>
                  </Show>
                </div>
              }
            </For>
          </Show>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
