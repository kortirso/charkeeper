import { createSignal, For, Show, batch } from 'solid-js';

import { ErrorWrapper, Dice, GuideWrapper, createModal } from '../../components';
import { useAppState, useAppLocale } from '../../context';
import { modifier } from '../../helpers';
import { fetchTagInfoRequest } from '../../requests/fetchTagInfoRequest';

const TRANSLATION = {
  en: {
    attack: 'Attack',
    damage: 'Damage',
    distance: 'Range',
    primary: 'Primary',
    additional: 'Reserve'
  },
  ru: {
    attack: 'Атака',
    damage: 'Урон',
    distance: 'Дист',
    primary: 'Основное',
    additional: 'Запасное'
  }
}

export const Combat = (props) => {
  const character = () => props.character;

  const [tagInfo, setTagInfo] = createSignal([]);

  const { Modal, openModal } = createModal();
  const [appState] = useAppState();
  const [locale] = useAppLocale();

  const showTagInfo = async (tag, value) => {
    const provider = character().provider === 'dnd5' || character().provider === 'dnd2024' ? 'dnd' : character().provider;
    const result = await fetchTagInfoRequest(appState.accessToken, provider, 'weapon', tag);
    batch(() => {
      openModal();
      setTagInfo([value, result.value]);
    });
  }

  const renderAttacksBox = (title, values) => {
    if (values.length === 0) return <></>;

    return (
      <div class="p-4 blockable mb-2">
        <h2 class="text-lg font-normal! mb-2 dark:text-snow">{title}</h2>
        <table class="w-full table first-column-full-width table-top">
          <thead>
            <tr>
              <td />
              <td class="text-center dark:text-snow">{TRANSLATION[locale()]['attack']}</td>
              <td class="text-center dark:text-snow px-1">{TRANSLATION[locale()]['damage']}</td>
              <td class="text-center dark:text-snow px-1">{TRANSLATION[locale()]['distance']}</td>
            </tr>
          </thead>
          <tbody>
            <For each={values}>
              {(attack) =>
                <tr class="dark:text-snow">
                  <td class="py-1 pl-1">
                    <p>{attack.name}</p>
                    <Show when={attack.tags && Object.keys(attack.tags).length > 0}>
                      <div class="mt-1 flex flex-wrap gap-x-2 gap-y-1">
                        <For each={Object.entries(attack.tags)}>
                          {([tag, value]) =>
                            <p class="tag" onClick={() => showTagInfo(tag, value)}>{value}</p>
                          }
                        </For>
                      </div>
                    </Show>
                    <Show when={attack.tags === undefined && attack.features && Object.keys(attack.features).length > 0}>
                      <p class="mt-1 text-xs">
                        {typeof variable === 'string' ? attack.features.join(', ') : attack.features.map((item) => item[locale()]).join(', ')}
                      </p>
                    </Show>
                    <Show when={attack.notes}>
                      <p class="text-xs mt-1">{attack.notes}</p>
                    </Show>
                  </td>
                  <td class="py-1 text-center">
                    <Dice
                      width="28"
                      height="28"
                      text={modifier(attack.attack_bonus)}
                      onClick={() => props.openDiceRoll(`/check attack ${attack.name}`, attack.attack_bonus)}
                    />
                  </td>
                  <td class="p-1 text-center">
                    <p>{attack.damage}{attack.damage_bonus > 0 ? modifier(attack.damage_bonus) : ''}</p>
                  </td>
                  <td class="p-1 text-center">
                    <p>{attack.distance || attack.range}</p>
                  </td>
                </tr>
              }
            </For>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Combat' }}>
      <GuideWrapper character={character()}>
        {renderAttacksBox(TRANSLATION[locale()]['primary'], character().attacks.filter((item) => item.ready_to_use))}
        {renderAttacksBox(TRANSLATION[locale()]['additional'], character().attacks.filter((item) => !item.ready_to_use))}
        <Modal classList="md:max-w-md!">
          <p class="mb-3 text-xl">{tagInfo()[0]}</p>
          <p>{tagInfo()[1]}</p>
        </Modal>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
