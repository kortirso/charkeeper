import { createMemo, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Select, ErrorWrapper } from '../../../../components';
import config from '../../../../data/daggerheart.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

export const DaggerheartBeastform = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const beastformsSelect = createMemo(() => {
    const result = Object.entries(config.beastforms).map(([key, values]) => [key, values.name[locale()]])
    result.push(['none', t('daggerheart.beast.naturalForm')]);

    return Object.fromEntries(result);
  });

  const changeBeastform = async (value) => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { beastform: (value === 'none' ? null : value) } }
    );

    if (result.errors === undefined) {
      props.onReplaceCharacter(result.character);
    } else renderAlerts(result.errors);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartBeastform' }}>
      <Show when={character().beastforms.length > 0}>
        <div class="blockable p-4">
          <h2 class="text-lg mb-2 dark:text-snow">{t('daggerheart.beast.transformation')}</h2>
          <Select
            containerClassList="w-full"
            items={beastformsSelect()}
            selectedValue={character().beastform === null ? 'none' : character().beastform}
            onSelect={(value) => changeBeastform(value)}
          />
        </div>
      </Show>
    </ErrorWrapper>
  );
}
