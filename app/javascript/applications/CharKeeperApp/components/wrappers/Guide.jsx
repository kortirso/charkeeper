import { Show } from 'solid-js';

import { Button } from '../../components';
import { useAppState, useAppLocale } from '../../context';
import { updateCharacterRequest } from '../../requests/updateCharacterRequest';

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
  }
}

export const GuideWrapper = (props) => {
  const [appState] = useAppState();
  const [locale] = useAppLocale();

  const clickNext = async (value) => {
    const result = await updateCharacterRequest(
      appState.accessToken, props.character.provider, props.character.id, { character: { guide_step: value }, only_head: true }
    );

    if (result.errors_list === undefined) props.onReloadCharacter();
  }

  return (
    <div
      classList={{
        'opacity-25': props.character.guide_step && props.guideStep !== props.character.guide_step
      }}
    >
      <Show when={props.guideStep === props.character.guide_step && props.helpMessage}>
        <div class="warning">
          <p class="text-sm">{props.helpMessage}</p>
          <div class="flex justify-end gap-x-4 mt-2">
            <Button default textable size="small" onClick={() => clickNext(null)}>{TRANSLATION[locale()]['skip']}</Button>
            <Show
              when={props.finishGuideStep}
              fallback={
                <Button default textable size="small" onClick={() => clickNext(props.character.guide_step + 1)}>
                  {TRANSLATION[locale()]['next']}
                </Button>
              }
            >
              <Button default textable size="small" onClick={() => clickNext(null)}>{TRANSLATION[locale()]['finish']}</Button>
            </Show>
          </div>
        </div>
      </Show>
      {props.children}
    </div>
  );
}
