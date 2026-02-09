import { createSignal, createEffect, Switch, Match, batch } from 'solid-js';

import { FateCoreVitals } from './Vitals/Core';

import { ErrorWrapper } from '../../../../components';
import { useAppState, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

export const FateVitals = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setLastActiveCharacterId(character().id);
    });
  });

  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload, only_head: true }
    );

    if (result.errors_list === undefined) props.onReplaceCharacter(payload);
    else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'FateVitals' }}>
      <Switch>
        <Match when={character().stress_system === 'core'}>
          <FateCoreVitals
            maxStress={character().max_stress}
            selectedStress={character().selected_stress}
            updateCharacter={updateCharacter}
          />
        </Match>
      </Switch>
    </ErrorWrapper>
  );
}
