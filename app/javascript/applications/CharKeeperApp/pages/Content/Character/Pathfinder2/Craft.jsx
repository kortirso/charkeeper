import { createSignal, createEffect, createMemo, For, Show } from 'solid-js';

import { Pathfinder2CraftPlace } from '../../../../pages';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { ErrorWrapper, GuideWrapper, Toggle, Button, createModal } from '../../../../components';
import { localize } from '../../../../helpers';
import { Close, Craft } from '../../../../assets';
import { fetchCharacterFormulasRequest } from '../../../../requests/fetchCharacterFormulasRequest';
import { removeCharacterFormulaRequest } from '../../../../requests/removeCharacterFormulaRequest';

import { itemFilters } from './Shared/ItemFilters';

const TRANSLATION = {
  en: {
    title: 'Formulas book',
    description: 'In this section you can see all the formulas that can be learned when choosing Equipment.'
  },
  ru: {
    title: 'Книга формул',
    description: 'В этом разделе вы можете увидеть все формулы, которые можно изучить при выборе Снаряжения.'
  },
  es: {
    title: 'Libro de fórmulas',
    description: 'En esta sección podrá ver todas las fórmulas que se pueden aprender al elegir el equipo.'
  }
}

export const Pathfinder2Craft = (props) => {
  const character = () => props.character;

  const [characterFormulas, setCharacterFormulas] = createSignal(undefined);
  const [craft, setCraft] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  const fetchCharacterFormulas = async () => await fetchCharacterFormulasRequest(
    appState.accessToken, character().provider, character().id
  );

  createEffect(() => {
    if (characterFormulas()) return;

    Promise.all([fetchCharacterFormulas()]).then(
      ([formulasData]) => {
        setCharacterFormulas(formulasData.formulas);
      }
    );
  });

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const removeFormula = async (item) => {
    const result = await removeCharacterFormulaRequest(appState.accessToken, character().provider, character().id, item.formula_id);

    if (result.errors_list === undefined) {
      setCharacterFormulas(characterFormulas().filter((element) => element.formula_id !== item.formula_id))
    } else renderAlerts(result.errors_list);
  }

  const startCraft = (item) => {
    setCraft(item);
    openModal();
  }

  const onCompleteCraft = () => {
    setCraft(undefined);
    closeModal();
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Pathfinder2Craft' }}>
      <GuideWrapper character={character()}>
        <div class="blockable px-2 md:px-4 py-4 flex flex-col gap-2">
          <h2 class="text-lg">{i18n().title}</h2>
          <p>{i18n().description}</p>
          <Show when={characterFormulas()}>
            <For each={itemFilters()}>
              {(itemFilter) =>
                <Show when={characterFormulas().filter(itemFilter.callback).length > 0}>
                  <Toggle title={itemFilter.title}>
                    <table class="w-full table first-column-full-width">
                      <thead>
                        <tr>
                          <td /><td />
                        </tr>
                      </thead>
                      <tbody>
                        <For each={characterFormulas().filter(itemFilter.callback)}>
                          {(item) =>
                            <tr>
                              <td class="py-1 pl-1">
                                <p>
                                  {item.name}
                                  <Show when={item.homebrew}>
                                    <span title="Homebrew" class="text-xs ml-2">HB</span>
                                  </Show>
                                </p>
                              </td>
                              <td>
                                <div class="flex justify-end gap-x-2">
                                  <Button default size="small" onClick={() => startCraft(item)}>
                                    <Craft width="20" height="20" />
                                  </Button>
                                  <Button default size="small" onClick={() => removeFormula(item)}>
                                    <Close />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          }
                        </For>
                      </tbody>
                    </table>
                  </Toggle>
                </Show>
              }
            </For>
          </Show>
        </div>
        <Modal>
          <Pathfinder2CraftPlace
            characterId={character().id}
            craft={craft()}
            formula={true}
            skill={character().skills.find((item) => item.slug === 'crafting').level}
            level={character().level}
            completeCraft={onCompleteCraft}
          />
        </Modal>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
