import { render } from 'solid-js/web';

import { CharKeeperApp, HomebrewsApp } from './applications';

const components = { CharKeeperApp, HomebrewsApp }

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-js-component]').forEach((mountPoint) => {
    const dataset = mountPoint.dataset;
    const componentName = dataset['jsComponent'];
    const Component = components[componentName];

    if (Component) {
      const props = dataset['props'] ? JSON.parse(dataset['props']) : {};
      const childrenData = dataset['children'] ? JSON.parse(dataset['children']) : null;

      render(() => (
        <Component {...props}>
          {childrenData}
        </Component>
      ), mountPoint);
    }
  });

  document.querySelectorAll('[data-slider]').forEach((slider) => {
    const items = [...slider.querySelectorAll('[data-slider-item]')];
    const previousButton = slider.querySelector('[data-slider-prev]');
    const nextButton = slider.querySelector('[data-slider-next]');

    let currentIndex = 0;

    const render = () => {
      const previousIndex = (currentIndex - 1 + items.length) % items.length;
      const nextIndex = (currentIndex + 1) % items.length;

      items.forEach((item, index) => {
        item.classList.toggle('current', index === currentIndex);
        item.classList.toggle('prev', items.length > 2 && index === previousIndex);
        item.classList.toggle('next', items.length > 1 && index === nextIndex);
        item.setAttribute('aria-hidden', index !== currentIndex);
      });
    };

    previousButton.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + items.length) % items.length;
      render();
    });

    nextButton.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % items.length;
      render();
    });

    slider.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') previousButton.click();
      if (event.key === 'ArrowRight') nextButton.click();
    });

    render();
  });
});

