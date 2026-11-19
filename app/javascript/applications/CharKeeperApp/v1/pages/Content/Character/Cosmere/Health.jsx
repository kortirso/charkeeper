import { For } from 'solid-js';

import { ErrorWrapper, GuideWrapper, Button } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, PlusSmall } from '../../../../assets';
import { localize } from '../../../../helpers';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

const TRANSLATION = {
  en: {
    health: 'Health',
    focus: 'Focus',
    investiture: 'Investiture',
  },
  ru: {
    health: 'Здоровье',
    focus: 'Фокус',
    investiture: 'Инвеститура',
  },
  es: {
    health: 'Salud',
    focus: 'Enfoque',
    investiture: 'Investidura',
  }
}

export const CosmereHealth = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const updateResource = async (attribute, value) => {
    if (character()[attribute] === 0 && value === -1) return;
    if (character()[attribute] === character()[`${attribute}_max`] && value === 1) return;

    const payload = { [attribute]: character()[attribute] + value };
    
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload, only_head: true }
    );

    if (result.errors_list === undefined) props.onReplaceCharacter(payload);
    else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'CosmereHealth' }}>
      <GuideWrapper character={character()}>
        <div class="blockable py-4">
          <div class="grid grid-cols-3 gap-2">
            <For each={['health', 'focus', 'investiture']}>
              {(item) =>
                <div>
                  <p class="stat-title px-4 emd:px-0">{localize(TRANSLATION, locale())[item]}</p>
                  <div class="dc20-stat-value-box">
                    <p class="dc20-stat-value text-xl! md:text-lg!">{character()[item]} / {character()[`${item}_max`]}</p>
                  </div>
                  <div class="flex gap-x-4 justify-center">
                    <Button default size="small" onClick={() => updateResource(item, -1)}>
                      <Minus />
                    </Button>
                    <Button default size="small" onClick={() => updateResource(item, 1)}>
                      <PlusSmall />
                    </Button>
                  </div>
                </div>
              }
            </For>
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
