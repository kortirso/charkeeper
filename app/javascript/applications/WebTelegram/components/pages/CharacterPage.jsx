import { createSignal, createEffect, Switch, Match } from 'solid-js';

import { Dnd5 } from '../../components';
import { useAppState } from '../../context';
import { fetchCharacterRequest } from '../../requests/fetchCharacterRequest';

export const CharacterPage = () => {
  const [character, setCharacter] = createSignal({});
  const [appState] = useAppState();

  createEffect(() => {
    if (appState.activePageParams.id === character().id) return;

    const fetchCharacter = async () => await fetchCharacterRequest(appState.accessToken, appState.activePageParams.id);

    Promise.all([fetchCharacter()]).then(
      ([characterData]) => {
        setCharacter(characterData.character);
      }
    );
  });

  const reloadCharacter = async () => {
    const characterData = await fetchCharacterRequest(appState.accessToken, appState.activePageParams.id);
    setCharacter(characterData.character);

    return characterData.character.decorated_data;
  }

  return (
    <Switch>
      <Match when={character().provider === 'dnd5'}>
        <Dnd5
          decoratedData={character().decorated_data}
          characterId={character().id}
          name={character().name}
          onReloadCharacter={reloadCharacter}
        />
      </Match>
    </Switch>
  );
}
