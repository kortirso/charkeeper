import { For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { ErrorWrapper } from '../../../../components';
import config from '../../../../data/dnd2024.json';
import { useAppLocale } from '../../../../context';

import { modifier } from '../../../../helpers';

export const Dnd5SavingThrows = (props) => {
  const character = () => props.character;

  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd5SavingThrows' }}>
      <div class="blockable p-4">
        <h2 class="text-lg dark:text-snow mb-2">{t('dndV2.savings.title')}</h2>
        <div class="grid grid-cols-3 emd:grid-cols-2 gap-4">
          <For each={Object.entries(config.abilities)}>
            {([slug, ability]) =>
              <div class="flex flex-col items-center">
                <p class="uppercase text-sm elg:text-[10px] mb-1 dark:text-snow">
                  {ability.name[locale()]}
                </p>
                <div class="flex items-center">
                  <p class="font-cascadia text-2xl dark:text-snow">{modifier(character().save_dc[slug])}</p>
                </div>
              </div>
            }
          </For>
        </div>
      </div>
    </ErrorWrapper>
  );
}
