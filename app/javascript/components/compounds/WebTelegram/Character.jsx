import { Switch, Match } from 'solid-js';

import { capitalize } from '../../../helpers';

import { useAppState } from '../../../context';

export const Character = (props) => {
  const character = () => props.character;

  const [_appState, { navigate }] = useAppState();

  const overallLevel = () =>
    Object.values(character().index_data.classes).reduce((acc, item) => acc + item, 0)

  return (
    <div
      class="mb-4 p-4 flex white-box cursor-pointer"
      onClick={() => navigate('characters', { id: character().id })}
    >
      <Switch>
        <Match when={props.currentRule === 'D&D 5'}>
          <div class="mr-2">
            <div class="w-16 h-16 border border-gray rounded"></div>
          </div>
          <div>
            <p class="mb-1 font-medium">{character().name}</p>
            <div class="mb-1">
              <p class="text-xs">Lvl {overallLevel()} | {capitalize(character().index_data.race)}</p>
            </div>
            <p class="text-xs">
              {Object.keys(character().index_data.classes).map((item) => capitalize(item)).join(' * ')}
            </p>
          </div>
        </Match>
      </Switch>
    </div>
  );
}
