import { Switch, Match } from 'solid-js';

import { capitalize } from '../../../helpers';

export const Character = (props) => {
  const character = () => props.character;

  return (
    <div class="mb-4 pb-4 px-4 border-b border-gray flex">
      <Switch>
        <Match when={props.currentRule === 'D&D 5'}>
          <div class="mr-2">
            <div class="w-16 h-16 border border-red rounded"></div>
          </div>
          <div>
            <p class="mb-1 font-medium">{character().name}</p>
            <div class="mb-1">
              <p class="text-xs">Lvl 1 | {capitalize(character().data.race)}</p>
            </div>
            <p class="text-xs">
              {Object.keys(character().data.classes).map((item) => capitalize(item)).join(' * ')}
            </p>
          </div>
        </Match>
      </Switch>
    </div>
  );
}
