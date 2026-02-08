import { createSignal, createEffect, Switch, Match, batch } from 'solid-js';

import { FateCoreSkills } from './Skills/Core';

import { ErrorWrapper } from '../../../../components';
import { useAppState, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

export const FateSkills = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [selectedSkills, setSelectedSkills] = createSignal({})

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setSelectedSkills(character().selected_skills);
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
    <ErrorWrapper payload={{ character_id: character().id, key: 'FateSkills' }}>
    <Switch>
      <Match when={character().skills_system === 'core'}>
        <FateCoreSkills
          character={character()}
          openDiceRoll={props.openDiceRoll}
          selectedSkills={selectedSkills()}
          setSelectedSkills={setSelectedSkills}
          updateCharacter={updateCharacter}
        />
      </Match>
    </Switch>
    </ErrorWrapper>
  );
}
