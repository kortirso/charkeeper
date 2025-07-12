import { For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { ErrorWrapper } from '../../../../components';
import { useAppLocale } from '../../../../context';

export const DaggerheartStatic = (props) => {
  const character = () => props.character;

  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartStatic' }}>
      <div class="flex flex-wrap justify-center gap-2">
        <For each={['proficiency', 'evasion', 'armor_score']}>
          {(slug) =>
            <div class="flex-1 emd:w-1/4">
              <div class="blockable py-4">
                <p class="text-sm elg:text-[10px] uppercase text-center mb-4 dark:text-snow">{t(`daggerheart.static.${slug}`)}</p>
                <div class="mx-auto flex items-center justify-center">
                  <p class="text-2xl font-cascadia dark:text-snow">{character()[slug]}</p>
                </div>
              </div>
            </div>
          }
        </For>
      </div>
    </ErrorWrapper>
  );
}
