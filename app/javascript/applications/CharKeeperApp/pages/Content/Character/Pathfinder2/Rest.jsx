import { ErrorWrapper, Button, GuideWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { createCharacterRestRequest } from '../../../../requests/createCharacterRestRequest';
import { localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    description: 'You can take a period of rest (typically 8 hours), during which you heal naturally, regaining Hit Points. Spellcasters regain spell slots. Abilities that refresh during preparations, and abilities that can be used only a certain number of times per day, including magic item uses, are reset.',
    perform: 'Perform rest',
    restIsFinished: 'Rest is completed'
  },
  ru: {
    description: 'Вы можете полноценно отдохнуть (обычно на протяжении 8 часов) и после этого благодаря естественному исцелению восстанавливаете ПЗ. Заклинатели восстанавливают ячейки заклинаний. Вы восстанавливаете способности, обновляемые во время подготовки, а также ежедневное количество использований способностей и магических предметов.',
    perform: 'Отдохнуть',
    restIsFinished: 'Отдых выполнен'
  }
}

export const Pathfinder2Rest = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [{ renderNotice, renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const performRest = async () => {
    const result = await createCharacterRestRequest(appState.accessToken, character().provider, character().id, { constitution: character().abilities.con, health_limit: character().health.max });
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReloadCharacter();
        renderNotice(localize(TRANSLATION, locale()).restIsFinished);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Pathfinder2Rest' }}>
      <GuideWrapper character={character()}>
        <div class="blockable py-4 px-2 md:px-4">
          <p class="mb-4">{localize(TRANSLATION, locale()).description}</p>
          <Button default textable onClick={performRest}>
            <span>{localize(TRANSLATION, locale()).perform}</span>
          </Button>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
