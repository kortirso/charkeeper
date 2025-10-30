import { For } from 'solid-js';

import { ErrorWrapper, GuideWrapper } from '../../../../components';
import { useAppLocale } from '../../../../context';

const TRANSLATION = {
  en: {
    title: 'Wild shape features'
  },
  ru: {
    title: 'Способности облика'
  }
}

export const BeastFeatures = (props) => {
  const character = () => props.character;

  const [locale] = useAppLocale();

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'BeastFeatures' }}>
      <GuideWrapper character={character()}>
        <div class="p-4 blockable mb-2">
          <h2 class="text-lg font-normal! mb-2 dark:text-snow">{TRANSLATION[locale()]['title']}</h2>
          <table class="w-full table first-column-full-width table-top">
            <thead>
              <tr>
                <td />
              </tr>
            </thead>
            <tbody>
              <For each={character().attacks}>
                {(attack) =>
                  <tr class="dark:text-snow">
                    <td class="p-1">
                      <p>{attack.name[locale()]}</p>
                      <p class="text-sm mt-1">{attack.description[locale()]}</p>
                    </td>
                  </tr>
                }
              </For>
            </tbody>
          </table>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
