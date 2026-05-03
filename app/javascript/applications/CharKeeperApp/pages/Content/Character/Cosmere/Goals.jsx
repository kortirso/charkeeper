import { createSignal, createEffect, For, Show, batch } from 'solid-js';
import { Key } from '@solid-primitives/keyed';

import { ErrorWrapper, EditWrapper, Text, Input, Button, Checkbox } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall, Close } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    title: 'Goals',
    purpose: 'Purpose',
    obstacle: 'Obstacle',
    goals: 'Goals',
    connections: 'Connections'
  },
  ru: {
    title: 'Цели',
    purpose: 'Намерение',
    obstacle: 'Препятствие',
    goals: 'Цели',
    connections: 'Отношения'
  },
  es: {
    title: 'Goals',
    purpose: 'Purpose',
    obstacle: 'Obstacle',
    goals: 'Goals',
    connections: 'Connections'
  }
}

export const CosmereGoals = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);

  const [purpose, setPurpose] = createSignal('');
  const [obstacle, setObstacle] = createSignal('');
  const [goals, setGoals] = createSignal([]);
  const [connections, setConnections] = createSignal([]);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setPurpose(character().purpose);
      setObstacle(character().obstacle);
      setGoals(character().goals);
      setConnections(character().connections);
    });

    setLastActiveCharacterId(character().id);
  });

  const cancelEditing = () => {
    batch(() => {
      setPurpose(character().purpose);
      setObstacle(character().obstacle);
      setGoals(character().goals);
      setConnections(character().connections);
      setEditMode(false);
    });
  }

  const addGoal = () => {
    setGoals(goals().concat({ id: Math.floor(Math.random() * 1000), text: '', counter: 0 }));
  }

  const changeGoal = (value, id) => {
    setGoals(
      goals().map((item) => {
        if (item.id !== id) return item;

        return { ...item, text: value };
      })
    );
  }

  const changeGoalCounter = (index, id) => {
    setGoals(
      goals().map((item) => {
        if (item.id !== id) return item;

        const newValue = item.counter === index ? (index - 1) : index;
        return { ...item, counter: newValue };
      })
    );
    updateCharacter();
  }

  const removeGoal = (id) => {
    setGoals(goals().filter((item) => item.id !== id));
    updateCharacter();
  }

  const addConnection = () => {
    setConnections(connections().concat({ id: Math.floor(Math.random() * 1000), text: '' }));
  }

  const changeConnection = (value, id) => {
    setConnections(
      connections().map((item) => {
        if (item.id !== id) return item;

        return { ...item, text: value };
      })
    );
  }

  const removeConnection = (id) => {
    setConnections(connections().filter((item) => item.id !== id));
    updateCharacter();
  }

  const updateCharacter = async () => {
    const payload = { purpose: purpose(), obstacle: obstacle(), goals: goals(), connections: connections() };
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload, only_head: true });

    if (result.errors_list === undefined) {
      batch(() => {
        setEditMode(false);
        props.onReplaceCharacter(payload)
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'CosmereGoals' }}>
      <EditWrapper
        position="right"
        editMode={editMode()}
        onSetEditMode={setEditMode}
        onCancelEditing={cancelEditing}
        onSaveChanges={updateCharacter}
      >
        <div class="blockable px-2 md:px-4 pt-4 pb-10">
          <h2 class="text-lg mb-4">{localize(TRANSLATION, locale()).title}</h2>
          <div class="flex flex-col gap-4">
            <Show
              when={editMode()}
              fallback={
                <>
                  <Text
                    labelClassList="uppercase text-xs!"
                    labelText={localize(TRANSLATION, locale()).purpose}
                    text={character().purpose && character().purpose.length > 0 ? character().purpose : '-'}
                    textClassList="text-xl"
                  />
                  <Text
                    labelClassList="uppercase text-xs!"
                    labelText={localize(TRANSLATION, locale()).obstacle}
                    text={character().obstacle && character().obstacle.length > 0 ? character().obstacle : '-'}
                    textClassList="text-xl"
                  />
                  <Show when={character().goals.length > 0}>
                    <div class="flex flex-col">
                      <h3 class="mb-2">{localize(TRANSLATION, locale()).goals}</h3>
                      <For each={character().goals}>
                        {(goal) =>
                          <div class="dc20-skill">
                            <p class="flex-1 line-clamp-1">{goal.text}</p>
                            <div class="flex gap-0.5">
                              <For each={Array.from([...Array(3).keys()], (x) => x + 1)}>
                                {(index) =>
                                  <Checkbox filled checked={goal.counter >= index} onToggle={() => changeGoalCounter(index, goal.id)} />
                                }
                              </For>
                            </div>
                            <Button default size="small" classList="ml-4 opacity-50" onClick={() => removeGoal(goal.id)}>
                              <Close />
                            </Button>
                          </div>
                        }
                      </For>
                    </div>
                  </Show>
                  <Show when={character().connections.length > 0}>
                    <div class="flex flex-col">
                      <h3 class="mb-2">{localize(TRANSLATION, locale()).connections}</h3>
                      <For each={character().connections}>
                        {(connection) =>
                          <div class="dc20-skill">
                            <p class="flex-1 line-clamp-1">{connection.text}</p>
                            <Button default size="small" classList="opacity-50" onClick={() => removeConnection(connection.id)}>
                              <Close />
                            </Button>
                          </div>
                        }
                      </For>
                    </div>
                  </Show>
                </>
              }
            >
              <Input labelText={localize(TRANSLATION, locale()).purpose} labelClassList="uppercase text-xs!" value={purpose()} onInput={setPurpose} />
              <Input labelText={localize(TRANSLATION, locale()).obstacle} labelClassList="uppercase text-xs!" value={obstacle()} onInput={setObstacle} />
              <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center">
                  <h3>{localize(TRANSLATION, locale()).goals}</h3>
                  <Button default size="small" onClick={addGoal}><PlusSmall /></Button>
                </div>
                <Key each={goals()} by={item => item.id}>
                  {(item) =>
                    <Input value={item().text} onInput={(value) => changeGoal(value, item().id)} />
                  }
                </Key>
              </div>
              <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center">
                  <h3>{localize(TRANSLATION, locale()).connections}</h3>
                  <Button default size="small" onClick={addConnection}><PlusSmall /></Button>
                </div>
                <Key each={connections()} by={item => item.id}>
                  {(item) =>
                    <Input value={item().text} onInput={(value) => changeConnection(value, item().id)} />
                  }
                </Key>
              </div>
            </Show>
          </div>
        </div>
      </EditWrapper>
    </ErrorWrapper>
  );
}
