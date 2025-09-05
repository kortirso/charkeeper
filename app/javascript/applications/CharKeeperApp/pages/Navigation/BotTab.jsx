import { createSignal, For, batch, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { PageHeader, Input } from '../../components';
import { useAppLocale, useAppState } from '../../context';
import { createBotRequest } from '../../requests/createBotRequest';

export const BotTab = () => {
  const [currentCommand, setCurrentCommand] = createSignal('');
  const [history, setHistory] = createSignal([]);

  const [appState] = useAppState();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const runBotCommand = async () => {
    const result = await createBotRequest(appState.accessToken, { value: currentCommand() });

    if (result.result) {
      batch(() => {
        setHistory([{ text: result.result }, { text: currentCommand(), author: 'user' }].concat(history()));
        setCurrentCommand('');
      });
    }
  }

  return (
    <>
      <PageHeader>
        {t('pages.botPage.title')}
      </PageHeader>
      {console.log(history())}
      <div class="p-4 flex-1 flex flex-col overflow-hidden">
        <div class="flex-1 flex flex-col-reverse overflow-y-scroll mb-4">
          <For each={history()}>
            {(item) =>
              <Show
                when={item.author}
                fallback={
                  <p
                    class="pl-4 py-1 dark:text-snow"
                    innerHTML={item.text} // eslint-disable-line solid/no-innerhtml
                  />
                }
              >
                <p class="dark:text-snow opacity-75">{item.text}</p>
              </Show>
            }
          </For>
        </div>
        <Input
          value={currentCommand()}
          onInput={(value) => setCurrentCommand(value)}
          onKeyDown={runBotCommand}
        />
      </div>
    </>
  );
}
