import { createSignal, Show, For } from 'solid-js';

import { useAppState, useAppLocale } from '../../../context';
import { Button } from '../../../components';
import { Close } from '../../../assets';
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
    mechanics: 'Mechanics',
    official: 'Approved',
    showItems: 'Show items'
  },
  ru: {
    races: 'Расы',
    communities: 'Общества',
    classes: 'Классы',
    items: 'Предметы',
    transformations: 'Трансформации',
    domains: 'Домены',
    mechanics: 'Механики',
    official: 'Одобренная',
    showItems: 'Показать предметы'
  },
  es: {
    races: 'Ancestrías',
    communities: 'Comunidades',
    classes: 'Clases',
    items: 'Objetos',
    transformations: 'Transformaciones',
    domains: 'Dominios',
    mechanics: 'Mechanics',
    official: 'Aprobado',
    showItems: 'Show items'
  }
}

export const DaggerheartBooksV2 = () => {
  const [locale] = useAppLocale();
  const [appState] = useAppState();

  const [showItems, setShowItems] = createSignal(false);

  const fetchList = async () => await fetchBooksRequest(appState.accessToken, 'daggerheart');

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <Show when={props.info.shared}>
        <p class="font-medium!">{localize(TRANSLATION, locale()).official}</p>
      </Show>
      <For each={['races', 'communities', 'classes', 'transformations', 'domains', 'mechanics', 'items']}>
        {(kind) =>
          <Show
            when={kind !== 'classes'}
            fallback={
              <Show when={Object.keys(props.info.items.classes).length > 0}>
                <div>
                  <p class="font-medium! mb-2">{localize(TRANSLATION, locale())[kind]}</p>
                  <For each={Object.entries(props.info.items.classes)}>
                    {([className, subclasses]) =>
                      <p class="flex flex-wrap gap-2">{className}:
                        <For each={Object.entries(subclasses)}>
                          {([id, value], index) =>
                            <p class="flex items-center">
                              {value}
                              <Show when={props.editMode}>
                                <Button default classList="ml-2 rounded min-w-4 min-h-4" onClick={() => props.onRemove(props.id, id)}>
                                  <Close width="20" height="20" />
                                </Button>
                              </Show>
                              <Show when={index() < Object.keys(subclasses).length - 1}>,</Show>
                            </p>
                          }
                        </For>
                      </p>
                    }
                  </For>
                </div>
              </Show>
            }
          >
            <Show when={Object.keys(props.info.items[kind]).length > 0}>
              <div>
                <p class="font-medium! mb-2">{localize(TRANSLATION, locale())[kind]}</p>
                <Show when={kind === 'items'}>
                  <Button default active={showItems()} classList="px-2 py-1 mb-2" onClick={() => setShowItems(!showItems())}>{localize(TRANSLATION, locale()).showItems} ({Object.keys(props.info.items.items).length})</Button>
                </Show>
                <Show when={kind !== 'items' || showItems()}>
                  <div class="flex flex-wrap gap-2">
                    <For each={Object.entries(props.info.items[kind])}>
                      {([id, value], index) =>
                        <p class="flex items-center">
                          {value}
                          <Show when={props.editMode}>
                            <Button default classList="ml-2 rounded min-w-4 min-h-4" onClick={() => props.onRemove(props.id, id)}>
                              <Close width="20" height="20" />
                            </Button>
                          </Show>
                          <Show when={index() < Object.keys(props.info.items[kind]).length - 1}>,</Show>
                        </p>
                      }
                    </For>
                  </div>
                </Show>
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
