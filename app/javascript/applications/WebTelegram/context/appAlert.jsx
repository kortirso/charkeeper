import { createSignal, createContext, useContext, Show, For } from 'solid-js';

const AppAlertContext = createContext();

export function AppAlertProvider(props) {
  const [alerts, setAlerts] = createSignal(undefined);

  const clearAlerts = () => setTimeout(() => setAlerts(undefined), 2500);

  const store = [
    {
      renderNotice(message) {
        setAlerts([{ type: 'notice', message: message }]);
        clearAlerts();
      },
      renderAlert(message) {
        setAlerts([{ type: 'alert', message: message }]);
        clearAlerts();
      },
      renderAlerts(messages) {
        setAlerts(messages.map((item) => { return { type: 'alert', message: item } }));
        clearAlerts();
      }
    }
  ];

  return (
    <AppAlertContext.Provider value={store}>
      <Show when={alerts() !== undefined}>
        <div class="fixed top-4 right-4 z-50">
          <For each={alerts()}>
            {(alert) =>
              <p
                class="relative py-2 px-4 mb-2 rounded text-sm"
                classList={{ 'bg-red-500 text-white': alert.type === 'alert', 'bg-green-500': alert.type === 'notice' }}
              >
                {alert.message}
              </p>
            }
          </For>
        </div>
      </Show>
      {props.children}
    </AppAlertContext.Provider>
  );
}

export function useAppAlert() { return useContext(AppAlertContext); }
