import { Portal } from 'solid-js/web';
import { createSignal, Show, children } from 'solid-js';

import { useAppState } from '../../context';
import { clickOutside } from '../../helpers';

export const createModal = () => {
  const [isOpen, setIsOpen] = createSignal(false);

  const [appState] = useAppState();

  return {
    openModal() {
      setIsOpen(true);
    },
    closeModal() {
      setIsOpen(false);
    },
    Modal(props) {
      const safeChildren = children(() => props.children);

      return (
        <Portal>
          <Show when={isOpen()}>
            <div
              class="fixed top-0 left-0 w-full h-full z-40 bg-black/75 flex items-center justify-center"
              classList={{ 'dark': appState.colorSchema === 'dark' }}
            >
              <div class="modal" use:clickOutside={() => setIsOpen(false)}>
                {safeChildren()}
              </div>
            </div>
          </Show>
        </Portal>
      );
    }
  }
}
