import { createSignal, For, batch } from 'solid-js';
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
    await createBotRequest(appState.accessToken, { value: currentCommand() });

    batch(() => {
      setHistory([{ text: currentCommand(), author: 'user' }].concat(history()));
      setCurrentCommand('');
    });
  }

  return (
    <>
      <PageHeader>
        {t('pages.botPage.title')}
      </PageHeader>
      <div class="p-4 flex-1 flex flex-col overflow-hidden">
        <div class="flex-1 flex flex-col-reverse overflow-y-scroll mb-4">
          <For each={history()}>
            {(item) =>
              <p class="dark:text-snow">{item.text}</p>
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
