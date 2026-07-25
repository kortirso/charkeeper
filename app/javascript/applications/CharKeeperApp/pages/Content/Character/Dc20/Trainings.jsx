import { For } from 'solid-js';

import { ErrorWrapper, GuideWrapper, Text } from '../../../../components';
import config from '../../../../data/dc20.json';
import { useAppLocale } from '../../../../context';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    title: 'Training',
    trained: 'Trained',
    notTrained: {
      weapon: "You can't use its weapon enhancement.",
      others: 'You have DisADV on Attack Checks and Spell Checks.',
      focuses: 'You do not benefit from its properties.'
    }
  },
  ru: {
    title: 'Обученность',
    trained: 'Тренировано',
    notTrained: {
      weapon: 'Вы не можете использовать улучшения оружия.',
      others: 'Вы получаете помеху на проверки атаки и заклинаний.',
      focuses: 'Вы не получаете преимуществ от свойств фокусов.'
    }
  },
  es: {
    title: 'Training',
    trained: 'Trained',
    notTrained: {
      weapon: "You can't use its weapon enhancement.",
      others: 'You have DisADV on Attack Checks and Spell Checks.',
      focuses: 'You do not benefit from its properties.'
    }
  }
}

const CUSTOM = ['weapon', 'focuses'];

export const Dc20Trainings = (props) => {
  const character = () => props.character;

  const [locale] = useAppLocale();

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20Trainings' }}>
      <GuideWrapper character={character()}>
        <div class="character-info-block">
          <p class="character-info-title">{localize(TRANSLATION, locale()).title}</p>
          <div class="flex flex-col gap-2">
            <For each={Object.entries(config.combatExpertise)}>
              {([slug, values]) =>
                <Text
                  labelText={localize(values.name, locale())}
                  labelClassList="character-info-text"
                  text={character().combat_expertise.includes(slug) ? localize(TRANSLATION, locale()).trained : (CUSTOM.includes(slug) ? localize(TRANSLATION, locale()).notTrained[slug] : localize(TRANSLATION, locale()).notTrained.others)}
                />
              }
            </For>
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
