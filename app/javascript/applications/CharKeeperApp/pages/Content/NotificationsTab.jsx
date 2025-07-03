import { createEffect, createSignal, Show, For, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { PageHeader } from '../../components/molecules';
import { Toggle, IconButton } from '../../components/atoms';
import { Arrow } from '../../assets';

import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { fetchUserNotificationsRequest } from '../../requests/fetchUserNotificationsRequest';

export const NotificationsTab = (props) => {
  const size = createWindowSize();

  const [notifications, setNotifications] = createSignal(undefined);

  const [appState, { changeUnreadNotificationsCount }] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (appState.accessToken === undefined) return;
    if (notifications() !== undefined) return;

    const fetchUserNotifications = async () => await fetchUserNotificationsRequest(appState.accessToken);

    Promise.all([fetchUserNotifications()]).then(
      ([notificationsData]) => {
        if (notificationsData.errors === undefined) {
          batch(() => {
            setNotifications(notificationsData.notifications);
            changeUnreadNotificationsCount(0);
          });
        } else renderAlerts(notificationsData.errors);
      }
    );
  });

  return (
    <>
      <Show when={size.width < 768}>
        <PageHeader
          leftContent={
            <IconButton size="xl" onClick={props.onNavigate}>
              <Arrow back width={20} height={20} />
            </IconButton>
          }
        >
          <p>{t('settingsPage.notifications')}</p>
        </PageHeader>
      </Show>
      <div class="p-4">
        <Show when={notifications() !== undefined}>
          <For each={notifications()}>
            {(notification) =>
              <Toggle
                isOpen={!notification.read}
                title={
                  <div class="flex justify-between items-center">
                    <span>{notification.title}</span>
                    <span class="font-cascadia-light text-sm">{notification.created_at}</span>
                  </div>
                }
              >
                <p class="font-cascadia-light">{notification.value}</p>
              </Toggle>
            }
          </For>
        </Show>
      </div>
    </>
  );
}
