import { createSignal, createEffect, Switch, Match } from 'solid-js';

import { Dnd5, Pathfinder2, Daggerheart } from '../../components';
import { PageHeader } from '../molecules';
import { IconButton } from '../atoms';

import { Hamburger } from '../../assets';
import { useAppState } from '../../context';
import { fetchCharacterRequest } from '../../requests/fetchCharacterRequest';

export const CharacterPage = (props) => {
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

    return characterData.character;
  }

  const replaceCharacter = (data) => setCharacter({ ...character(), ...data });

  return (
    <>
      <PageHeader rightContent={<IconButton onClick={props.onNavigate}><Hamburger /></IconButton>}>
        <p>{character().name}</p>
      </PageHeader>
      <Switch>
        <Match when={character().provider === 'dnd5' || character().provider === 'dnd2024'}>
          <Dnd5
            character={character()}
            onReloadCharacter={reloadCharacter}
            onReplaceCharacter={replaceCharacter}
          />
        </Match>
        <Match when={character().provider === 'pathfinder2'}>
          <Pathfinder2
            character={character()}
            onReplaceCharacter={replaceCharacter}
          />
        </Match>
        <Match when={character().provider === 'daggerheart'}>
          <Daggerheart
            character={character()}
            onReloadCharacter={reloadCharacter}
            onReplaceCharacter={replaceCharacter}
          />
        </Match>
      </Switch>
    </>
  );
}
