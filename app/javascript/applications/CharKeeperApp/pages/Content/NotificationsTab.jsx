import { createEffect, createSignal, Show, For, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { PageHeader, Toggle, IconButton } from '../../components';
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
        if (notificationsData.errors_list === undefined) {
          batch(() => {
            setNotifications(notificationsData.notifications);
            changeUnreadNotificationsCount(0);
          });
        } else renderAlerts(notificationsData.errors_list);
      }
    );
  });

  return (
    <>
      <Show when={size.width < 768}>
        <PageHeader
          leftContent={
            <IconButton onClick={props.onNavigate}>
              <Arrow back width={20} height={20} />
            </IconButton>
          }
        >
          <p>{t('settingsPage.notifications')}</p>
        </PageHeader>
      </Show>
      <div class="p-4 overflow-y-auto">
        <Show when={notifications() !== undefined}>
          <For each={notifications()}>
            {(notification) =>
              <Toggle
                isOpen={!notification.read}
                title={
                  <div class="flex justify-between items-center">
                    <span class="dark:text-snow">{notification.title}</span>
                    <span class="text-sm dark:text-snow">{notification.created_at}</span>
                  </div>
                }
              >
                <p class="dark:text-snow">{notification.value}</p>
              </Toggle>
            }
          </For>
        </Show>
      </div>
    </>
  );
}
