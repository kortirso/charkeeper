import { createEffect, createSignal, onCleanup, Show, children } from 'solid-js';
import { Portal } from 'solid-js/web';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

export const createSheet = () => {
  const [isOpen, setIsOpen] = createSignal(false);

  let opener;

  const closeSheet = () => {
    setIsOpen(false);
    queueMicrotask(() => opener?.focus());
  };

  const openSheet = () => {
    opener = document.activeElement;
    setIsOpen(true);
  };

  const Sheet = (props) => {
    const safeChildren = children(() => props.children);

    let panel;

    const onBackdropPointerDown = (event) => {
      if (event.target === event.currentTarget && props.closeOnBackdrop !== false) closeSheet();
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && props.closeOnEscape !== false) {
        event.preventDefault();
        closeSheet();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = [...panel.querySelectorAll(FOCUSABLE_SELECTOR)];

      if (focusableElements.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (event.shiftKey && [panel, firstElement].includes(document.activeElement)) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    createEffect(() => {
      if (!isOpen()) return;

      const previousOverflow = document.body.style.overflow;

      document.body.style.overflow = 'hidden';
      queueMicrotask(() => panel?.focus());

      onCleanup(() => {
        document.body.style.overflow = previousOverflow;
      });
    });

    return (
      <Portal mount={document.querySelector('.ck-v2') || document.body}>
        <Show when={isOpen()}>
          <div class="sheet-backdrop" onPointerDown={onBackdropPointerDown}>
            <section
              ref={panel}
              class={['sheet', props.class || ''].join(' ')}
              role="dialog"
              aria-modal="true"
              aria-label={props.label || props.title}
              tabindex="-1"
              onKeyDown={onKeyDown}
            >
              <div class="sheet-header">
                <Show when={props.title}>
                  <h2 class="sheet-title">{props.title}</h2>
                </Show>
                <button class="sheet-close-button" type="button" aria-label={props.closeLabel || 'Close'} onClick={closeSheet}>
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div class="sheet-content">{safeChildren()}</div>
            </section>
          </div>
        </Show>
      </Portal>
    );
  };

  return { isOpen, openSheet, closeSheet, Sheet };
};
