import { createMemo, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Select, ErrorWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

export const DaggerheartTransform = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const transformationsSelect = createMemo(() => {
    const result = Object.entries(character().transformations).map(([key, values]) => [key, values.name[locale()]])
    result.push(['none', t('daggerheart.transformation.naturalForm')]);

    return Object.fromEntries(result);
  });

  const changeTransformation = async (value) => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { transformation: (value === 'none' ? null : value) } }
    );

    if (result.errors_list === undefined) {
      props.onReplaceCharacter(result.character);
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartTransformation' }}>
      <Show when={Object.keys(character().transformations).length > 0}>
        <div class="blockable p-4">
          <h2 class="text-lg mb-2 dark:text-snow">{t('daggerheart.transformation.transformation')}</h2>
          <Select
            containerClassList="w-full"
            items={transformationsSelect()}
            selectedValue={character().transformation === null ? 'none' : character().transformation}
            onSelect={(value) => changeTransformation(value)}
          />
        </div>
      </Show>
    </ErrorWrapper>
  );
}
