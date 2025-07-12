import { batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Button, ErrorWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { fetchCharacterRequest } from '../../../../requests/fetchCharacterRequest';
import { createCharacterRestRequest } from '../../../../requests/createCharacterRestRequest';
import { replace } from '../../../../helpers';

export const DaggerheartRest = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [{ renderNotice }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const restCharacter = async (payload) => {
    const result = await createCharacterRestRequest(appState.accessToken, character().provider, character().id, payload);
    if (result.errors === undefined) {
      const characterData = await fetchCharacterRequest(appState.accessToken, character().id, { only: 'features' });
      batch(() => {
        props.onReplaceCharacter(characterData.character);
        renderNotice(t('alerts.restIsFinished'));
      });
    }
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartRest' }}>
      <div class="blockable p-4">
        <p class="mb-4 dark:text-snow">{replace(t('daggerheart.rest.shortRestDescription'), { tier: character().tier })}</p>
        <p class="mb-4 dark:text-snow">{t('daggerheart.rest.longRestDescription')}</p>
        <div class="grid grid-cols-1 lg:grid-cols-3 lg:gap-4">
          <Button default textable classList="mb-2 lg:mb-0" onClick={() => restCharacter({ rest: 'short' })}>
            <span class="font-cascadia-light">{t('rest.shortRest')}</span>
          </Button>
          <Button default textable classList="mb-2 lg:mb-0" onClick={() => restCharacter({ rest: 'long' })}>
            <span class="font-cascadia-light">{t('rest.longRest')}</span>
          </Button>
          <Button default textable classList="" onClick={() => restCharacter({ rest: 'session' })}>
            <span class="font-cascadia-light">{t('rest.sessionRest')}</span>
          </Button>
        </div>
      </div>
    </ErrorWrapper>
  );
}
