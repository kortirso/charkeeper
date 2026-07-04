import { Show, For } from 'solid-js';

import { useAppState, useAppLocale } from '../../../context';
import { SharedBookContent } from '../../../pages';
import { fetchBooksRequest } from '../../../requests_v2/books';
import { fetchBookRequest, removeBookRequest } from '../../../requests_v2/daggerheart/books';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    races: 'Ancestries',
    communities: 'Communities',
    classes: 'Classes',
    items: 'Items',
    transformations: 'Transformations',
    domains: 'Domains',
    official: 'Approved'
  },
  ru: {
    races: 'Расы',
    communities: 'Общества',
    classes: 'Классы',
    items: 'Предметы',
    transformations: 'Трансформации',
    domains: 'Домены',
    official: 'Одобренная'
  },
  es: {
    races: 'Ancestrías',
    communities: 'Comunidades',
    classes: 'Clases',
    items: 'Objetos',
    transformations: 'Transformaciones',
    domains: 'Dominios',
    official: 'Aprobado'
  }
}

export const DaggerheartBooksV2 = () => {
  const [locale] = useAppLocale();
  const [appState] = useAppState();

  const fetchList = async () => await fetchBooksRequest(appState.accessToken, 'daggerheart');

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <Show when={props.info.shared}>
        <p class="font-medium!">{localize(TRANSLATION, locale()).official}</p>
      </Show>
      <For each={['races', 'communities', 'classes', 'items', 'transformations', 'domains']}>
        {(kind) =>
          <Show
            when={kind !== 'classes'}
            fallback={
              <Show when={Object.keys(props.info.items.classes).length > 0}>
                <div>
                  <p class="font-medium! mb-2">{localize(TRANSLATION, locale())[kind]}</p>
                  <For each={Object.entries(props.info.items.classes)}>
                    {([className, subclasses]) =>
                      <p>{className} - {subclasses.join(', ')}</p>
                    }
                  </For>
                </div>
              </Show>
            }
          >
            <Show when={props.info.items[kind].length > 0}>
              <div>
                <p class="font-medium! mb-2">{localize(TRANSLATION, locale())[kind]}</p>
                <p>{props.info.items[kind].join(', ')}</p>
              </div>
            </Show>
          </Show>
        }
      </For>
    </div>
  );

  return (
    <SharedBookContent
      provider="daggerheart"
      onFetchRequest={fetchList}
      onShowRequest={fetchBookRequest}
      onRemoveRequest={removeBookRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
