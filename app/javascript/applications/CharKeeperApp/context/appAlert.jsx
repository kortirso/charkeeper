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
        setAlerts(
          Object.entries(messages)
            .flatMap(([, values]) => { return values.map((value) => { return { type: 'alert', message: value } }) })
        );
        clearAlerts();
      }
    }
  ];

  return (
    <AppAlertContext.Provider value={store}>
      <Show when={alerts() !== undefined}>
        <div class="alert-box">
          <For each={alerts()}>
            {(alert) =>
              <p class={`alert-text ${alert.type}`}>
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
