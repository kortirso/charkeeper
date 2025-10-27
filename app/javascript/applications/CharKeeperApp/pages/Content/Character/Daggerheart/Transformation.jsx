import { createMemo, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Select, ErrorWrapper, GuideWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

export const DaggerheartTransform = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const transformationsSelect = createMemo(() => {
    const result = Object.entries(character().transformations).map(([key, values]) => [key, values.name[locale()]]);
    return Object.fromEntries([['none', t('daggerheart.transformation.naturalForm')]].concat(result));
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
      <GuideWrapper character={character()}>
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
      </GuideWrapper>
    </ErrorWrapper>
  );
}
