import { createMemo, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Select, ErrorWrapper, GuideWrapper } from '../../../../components';
import config from '../../../../data/daggerheart.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

const translation = {
  en: {
    desc: 'While in Beastform, you cannot use weapons or cast spells from Domain Cards. You can still use class features, abilities, and Beastform-specific actions.',
    examples: 'Examples: ',
    adv: 'Advantages on:'
  },
  ru: {
    desc: 'Во время трансформации вы не можете использовать оружие или заклинания из карт домена, но вы по-прежнему можете использовать другие функции или способности, к которым у вас есть доступ.',
    examples: 'Примеры:',
    adv: 'Преимущества при:'
  }
}

export const DaggerheartBeastform = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const beastformsSelect = createMemo(() => {
    const result = Object.entries(config.beastforms).filter(([, values]) => values.tier <= character().tier).map(([key, values]) => [key, `${values.name[locale()]} T${values.tier}`])
    return Object.fromEntries([['none', t('daggerheart.beast.naturalForm')]].concat(result));
  });

  const changeBeastform = async (value) => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { beastform: (value === 'none' ? null : value) } }
    );

    if (result.errors_list === undefined) {
      props.onReplaceCharacter(result.character);
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartBeastform' }}>
      <Show when={character().beastforms.length > 0}>
        <GuideWrapper character={character()}>
          <div class="blockable p-4 dark:text-snow">
            <h2 class="text-lg mb-2">{t('daggerheart.beast.transformation')}</h2>
            <Select
              containerClassList="w-full"
              items={beastformsSelect()}
              selectedValue={character().beastform === null ? 'none' : character().beastform}
              onSelect={(value) => changeBeastform(value)}
            />
            <Show when={character().beastform}>
              <p class="mt-2">{translation[locale()]['desc']}</p>
              <p class="mt-1">{translation[locale()]['examples']} {config.beastforms[character().beastform].examples[locale()]}</p>
              <p class="mt-1">{translation[locale()]['adv']} {config.beastforms[character().beastform].adv[locale()]}</p>
            </Show>
          </div>
        </GuideWrapper>
      </Show>
    </ErrorWrapper>
  );
}
