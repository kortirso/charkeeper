import { createSignal, For, onMount } from 'solid-js';
import { createConsumer } from '@rails/actioncable';

import { ErrorWrapper } from '../../../components';
import { useAppState } from '../../../context';
import { readFromCache } from '../../../helpers';

const CHARKEEPER_HOST_CACHE_NAME = 'CharKeeperHost';

export const CampaignRolls = (props) => {
  const campaign = () => props.campaign;

  const [history, setHistory] = createSignal([]);

  const [appState] = useAppState();

  const readHostData = async () => {
    const cacheValue = await readFromCache(CHARKEEPER_HOST_CACHE_NAME);
    return cacheValue === null || cacheValue === undefined ? 'charkeeper.org' : cacheValue;
  }

  const connectToCable = async () => {
    const host = await readHostData();

    const protocol = appState.rootHost === 'localhost:5000' ? 'ws' : 'wss';
    const consumer = createConsumer(`${protocol}://${host}/cable`);
    consumer.subscriptions.create(
      { channel: 'CampaignChannel', campaign_id: campaign().id },
      {
        connected() {
          console.log('Connected to the channel:', this);
        },
        disconnected() {
          console.log('Disconnected');
        },
        received(data) {
          if (data.message) setHistory(history().concat([data.message.replace(/\n/g, '<br>')]));
        }
      }
    )
  }

  onMount(() => {
    connectToCable();
  });

  return (
    <ErrorWrapper payload={{ campaign_id: campaign().id, key: 'CampaignRolls' }}>
      <div class="flex-1 flex flex-col-reverse overflow-y-auto gap-2">
        <For each={history()}>
          {(item) =>
            <p
              class="py-1 dark:text-snow"
              innerHTML={item} // eslint-disable-line solid/no-innerhtml
            />
          }
        </For>
      </div>
    </ErrorWrapper>
  );
}
