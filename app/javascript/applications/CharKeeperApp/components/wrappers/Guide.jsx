import { createSignal, createEffect, Show } from 'solid-js';

import { Button } from '../../components';
import { useAppState, useAppLocale } from '../../context';
import { updateCharacterRequest } from '../../requests/updateCharacterRequest';
import { readFromCache, writeToCache, localize } from '../../helpers';

const RENDER_GUIDE_CACHE_NAME = 'RenderGuideSettings';
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
  const character = () => props.character;

  const [settings, setSettings] = createSignal(undefined);
  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  const readGuideSettings = async () => {
    const cacheValue = await readFromCache(RENDER_GUIDE_CACHE_NAME);
    setSettings(cacheValue === null || cacheValue === undefined ? {} : JSON.parse(cacheValue));
  }

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    setLastActiveCharacterId(character().id);
    readGuideSettings();
  });

  const clickSkip = async () => {
    const newValue = { ...settings(), [character().provider]: false }
    await writeToCache(RENDER_GUIDE_CACHE_NAME, JSON.stringify(newValue))

    clickNext(null);
  }

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
        'opacity-25': character().guide_step && props.guideStep !== character().guide_step && !(settings() && settings()[character().provider] === false)
      }}
    >
      <Show when={settings() && settings()[character().provider] !== false}>
        <Show when={props.guideStep === character().guide_step && props.helpMessage}>
          <div class="warning">
            <p class="text-sm">{props.helpMessage}</p>
            <div class="flex justify-end gap-x-4 mt-2">
              <Button default textable size="small" onClick={clickSkip}>{localize(TRANSLATION, locale()).skip}</Button>
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
      </Show>
      {props.children}
    </div>
  );
}
