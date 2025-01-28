import { Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { useAppState, useAppLocale } from '../../../context';

export const CharacterLink = (props) => {
  const character = () => props.character;

  const [, { navigate }] = useAppState();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  return (
    <div
      class="mb-4 p-4 flex white-box cursor-pointer"
      onClick={() => navigate('characters', { id: character().id })}
    >
      <Switch>
        <Match when={character().provider === 'dnd5'}>
          <div class="mr-2">
            <div class="w-16 h-16 border border-gray rounded" />
          </div>
          <div>
            <p class="mb-1 font-medium">{character().name}</p>
            <div class="mb-1">
              <p class="text-xs">
                {t('characters.level')} {character().object_data.level} | {character().object_data.subrace ? t(`subraces.${character().object_data.race}.${character().object_data.subrace}`) : t(`races.${character().object_data.race}`)}
              </p>
            </div>
            <p class="text-xs">
              {Object.keys(character().object_data.classes).map((item) => t(`classes.${item}`)).join(' * ')}
            </p>
          </div>
        </Match>
      </Switch>
    </div>
  );
}
