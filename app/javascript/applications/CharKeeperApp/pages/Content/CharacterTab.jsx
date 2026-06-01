import { createSignal, createEffect, createMemo, Show } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { Dnd5, Pathfinder2, Daggerheart, Dc20, Fate, Fallout, Cosmere, Cthulhu7 } from '../../pages';
import { PageHeader, IconButton } from '../../components';
import { Arrow } from '../../assets';
import { useAppState } from '../../context';
import { fetchCharacterRequest } from '../../requests/fetchCharacterRequest';

export const CharacterTab = (props) => {
  const size = createWindowSize();
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

  const characterComponent = createMemo(() => {
    if (!character().provider) return <></>;

    const COMPONENTS = {
      dnd5: Dnd5, dnd2024: Dnd5, pathfinder2: Pathfinder2, daggerheart: Daggerheart, dc20: Dc20, fate: Fate,
      fallout: Fallout, cosmere: Cosmere, cthulhu7: Cthulhu7
    }
    const Component = COMPONENTS[character().provider];
    return <Component character={character()} onReloadCharacter={reloadCharacter} onReplaceCharacter={replaceCharacter} />
  });

  return (
    <>
      <Show when={size.width < 768}>
        <PageHeader
          leftContent={
            <IconButton onClick={props.onNavigate}>
              <Arrow back width={20} height={20} />
            </IconButton>
          }
        >
          <p>{character().name}</p>
        </PageHeader>
      </Show>
      {characterComponent()}
    </>
  );
}
