import { createSignal, createEffect, Show } from 'solid-js';

import { Button } from '../../components';
import { useAppState, useAppLocale } from '../../context';
import { updateCharacterRequest } from '../../requests/updateCharacterRequest';
import { localize } from '../../helpers';

const TRANSLATION = {
  en: {
    skip: 'Skip',
    next: 'Next step',
    finish: 'Finish'
  },
  ru: {
    skip: 'Пропустить',
    next: 'Дальше',
    finish: 'Закончить'
  },
  es: {
    skip: 'Saltar',
    next: 'Siguiente paso',
    finish: 'Finalizar'
  }
}

export const GuideWrapper = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    setLastActiveCharacterId(character().id);
  });

  const clickNext = async (value) => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { guide_step: value }, only_head: true }
    );

    if (result.errors_list === undefined) {
      props.onReloadCharacter();
      if (props.onNextClick) props.onNextClick();
    }
  }

  return (
    <div
      classList={{
        'opacity-25': character().guide_step && props.guideStep !== character().guide_step
      }}
    >
      <Show when={props.guideStep === character().guide_step && props.helpMessage}>
        <div class="warning">
          <p class="text-sm">{props.helpMessage}</p>
          <div class="flex justify-end gap-x-4 mt-2">
            <Button default textable size="small" onClick={() => clickNext(null)}>{localize(TRANSLATION, locale()).skip}</Button>
            <Show
              when={props.finishGuideStep}
              fallback={
                <Button default textable size="small" onClick={() => clickNext(character().guide_step + 1)}>
                  {localize(TRANSLATION, locale()).next}
                </Button>
              }
            >
              <Button default textable size="small" onClick={() => clickNext(null)}>{localize(TRANSLATION, locale()).finish}</Button>
            </Show>
          </div>
        </div>
      </Show>
      {props.children}
    </div>
  );
}
