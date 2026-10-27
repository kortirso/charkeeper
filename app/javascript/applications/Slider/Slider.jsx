import { createMemo, createSignal, For } from 'solid-js';

export const Slider = (props) => {
  const [currentIndex, setCurrentIndex] = createSignal(0);

  const itemsSize = createMemo(() => props.items.length);
  const previousIndex = createMemo(() => (currentIndex() - 1 + itemsSize()) % itemsSize());
  const nextIndex = createMemo(() => (currentIndex() + 1) % itemsSize());

  const showPrevious = () => {
    if (itemsSize() > 1) setCurrentIndex(previousIndex());
  };

  const showNext = () => {
    if (itemsSize() > 1) setCurrentIndex(nextIndex());
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPrevious();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showNext();
    }
  };

  return (
    <div class="mx-auto w-full max-w-7xl">
      <div class="slider" role="region" aria-label="Slider" aria-roledescription="carousel" tabIndex="0" onKeyDown={handleKeyDown}>
        <For each={props.items}>
          {(item, index) =>
            <div
              class="slider-item"
              classList={{
                prev: itemsSize() > 2 && index() === previousIndex(),
                current: index() === currentIndex(),
                next: itemsSize() > 1 && index() === nextIndex()
              }}
              aria-hidden={index() !== currentIndex()}
            >
              <img src={item.image} alt={item.alt} width="400" height="783" />
              <p class="slider-text">{item.text}</p>
            </div>
          }
        </For>
        <button
          class="slider-button slider-button-prev"
          type="button"
          aria-label="Prev slide"
          disabled={itemsSize() < 2}
          onClick={showPrevious}
        >
          <span aria-hidden="true">&#8592;</span>
        </button>
        <button
          class="slider-button slider-button-next"
          type="button"
          aria-label="Next slide"
          disabled={itemsSize() < 2}
          onClick={showNext}
        >
          <span aria-hidden="true">&#8594;</span>
        </button>
      </div>
    </div>
  );
};
