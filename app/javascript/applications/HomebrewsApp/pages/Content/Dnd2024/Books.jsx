import { Show, For } from 'solid-js';

import { useAppState, useAppLocale } from '../../../context';
import { Button } from '../../../components';
import { Close } from '../../../assets';
import { SharedBookContent } from '../../../pages';
import { fetchBooksRequest } from '../../../requests_v2/books';
import { fetchBookRequest, removeBookRequest } from '../../../requests_v2/dnd2024/books';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    items: 'Items',
    spells: 'Spells',
    classes: 'Classes',
    feats: 'Feats',
    backgrounds: 'Backgrounds',
    official: 'Approved',
    races: 'Species'
  },
  ru: {
    items: 'Предметы',
    spells: 'Заклинания',
    classes: 'Классы',
    feats: 'Черты',
    backgrounds: 'Предыстории',
    official: 'Одобренная',
    races: 'Виды'
  },
  es: {
    items: 'Objetos',
    spells: 'Hechizos',
    classes: 'Clases',
    feats: 'Proesas',
    backgrounds: 'Trasfondos',
    official: 'Aprobado',
    races: 'Species'
  }
}

export const Dnd2024Books = () => {
  const [locale] = useAppLocale();
  const [appState] = useAppState();

  const fetchList = async () => await fetchBooksRequest(appState.accessToken, 'dnd2024');

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <Show when={props.info.shared}>
        <p class="font-medium!">{localize(TRANSLATION, locale()).official}</p>
      </Show>
      <For each={['items', 'races', 'classes', 'backgrounds', 'feats', 'spells']}>
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
                          {([id, value]) =>
                            <p class="flex items-center">
                              {value}
                              <Show when={props.editMode}>
                                <Button default classList="ml-2 rounded min-w-4 min-h-4" onClick={() => props.onRemove(props.id, id)}>
                                  <Close width="20" height="20" />
                                </Button>
                              </Show>
                              ,
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
              </div>
            </Show>
          </Show>
        }
      </For>
    </div>
  );

  return (
    <SharedBookContent
      provider="dnd2024"
      onFetchRequest={fetchList}
      onShowRequest={fetchBookRequest}
      onRemoveRequest={removeBookRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
