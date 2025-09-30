import { createSignal, For, batch, Show } from 'solid-js';

import { PageHeader, Input } from '../../components';
import { useAppI18n, useAppState } from '../../context';
import { createBotRequest } from '../../requests/createBotRequest';

export const BotTab = () => {
  const [currentCommand, setCurrentCommand] = createSignal('');
  const [history, setHistory] = createSignal([]);

  const [appState] = useAppState();
  const [,, { t }] = useAppI18n();

  const runBotCommand = async () => {
    const result = await createBotRequest(appState.accessToken, { value: currentCommand() });

    batch(() => {
      setHistory(
        [
          { text: (result.result ? result.result : result.errors_list[0]) }, { text: currentCommand(), author: 'user' }
        ].concat(history())
      );
      setCurrentCommand('');
    });
  }

  return (
    <>
      <PageHeader>
        {t('pages.botPage.title')}
      </PageHeader>
      <div class="p-4 flex-1 flex flex-col overflow-hidden">
        <div class="flex-1 flex flex-col-reverse overflow-y-auto mb-4">
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
        <Input value={currentCommand()} onInput={(value) => setCurrentCommand(value)} onKeyDown={runBotCommand} />
        <p
          class="mt-2 dark:text-snow text-xs"
          innerHTML={t('pages.botPage.link')} // eslint-disable-line solid/no-innerhtml
        />
      </div>
    </>
  );
}

