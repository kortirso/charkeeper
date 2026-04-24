import { createSignal, createMemo, Switch, Match } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { CosmereAbilities, CosmereSkills, CosmereDefenses, CosmereHealth, CosmereInfo } from '../../../pages';
import { CharacterNavigation, Notes, Avatar, ContentWrapper, Equipment } from '../../../components';
import { useAppLocale } from '../../../context';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    weapons: 'Weapons',
    armor: 'Armor',
    items: 'Items'
  },
  ru: {
    weapons: 'Оружие',
    armor: 'Доспехи',
    items: 'Предметы'
  },
  es: {
    weapons: 'Weapons',
    armor: 'Armor',
    items: 'Items'
  }
}

export const Cosmere = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  const [activeMobileTab, setActiveMobileTab] = createSignal('abilities');
  const [activeTab, setActiveTab] = createSignal('combat');

  const [locale] = useAppLocale();

  const weaponFilter = (item) => item.kind === 'weapon';
  const armorFilter = (item) => item.kind === 'armor';
  const itemFilter = (item) => item.kind === 'item';

  const characterTabs = createMemo(() => {
    return ['combat', 'equipment', 'notes', 'avatar'];
  });

  const mobileView = createMemo(() => {
    if (size.width >= 1152) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={['abilities'].concat(characterTabs())}
          activeTab={activeMobileTab()}
          setActiveTab={setActiveMobileTab}
        />
        <div class="p-2 pb-20 flex-1 overflow-y-auto">
          <Switch>
            <Match when={activeMobileTab() === 'abilities'}>
              <CosmereInfo character={character()} />
              <div class="mt-4">
                <CosmereAbilities
                  character={character()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
              <div class="mt-4">
                <CosmereSkills
                  character={character()}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'combat'}>
              <CosmereDefenses character={character()} />
              <div class="mt-4">
                <CosmereHealth character={character()} />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'equipment'}>
              <Equipment
                character={character()}
                itemFilters={[
                  { title: localize(TRANSLATION, locale()).weapons, callback: weaponFilter },
                  { title: localize(TRANSLATION, locale()).armor, callback: armorFilter },
                  { title: localize(TRANSLATION, locale()).items, callback: itemFilter }
                ]}
                onReloadCharacter={props.onReloadCharacter}
              />
            </Match>
            <Match when={activeMobileTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeMobileTab() === 'avatar'}>
              <Avatar character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
          </Switch>
        </div>
      </>
    )
  });

  const leftView = createMemo(() => {
    if (size.width <= 1151) return <></>;

    return (
      <>
        <CosmereInfo character={character()} />
        <div class="mt-4">
          <CosmereAbilities
            character={character()}
            onReplaceCharacter={props.onReplaceCharacter}
            onReloadCharacter={props.onReloadCharacter}
          />
        </div>
        <div class="mt-4">
          <CosmereSkills
            character={character()}
            onReplaceCharacter={props.onReplaceCharacter}
          />
        </div>
      </>
    );
  });

  const rightView = createMemo(() => {
    if (size.width <= 1151) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={characterTabs()}
          activeTab={activeTab()}
          setActiveTab={setActiveTab}
        />
        <div class="p-2 pb-20 flex-1">
          <Switch>
            <Match when={activeTab() === 'combat'}>
              <CosmereDefenses character={character()} />
              <div class="mt-4">
                <CosmereHealth character={character()} />
              </div>
            </Match>
            <Match when={activeTab() === 'equipment'}>
              <Equipment
                character={character()}
                itemFilters={[
                  { title: localize(TRANSLATION, locale()).weapons, callback: weaponFilter },
                  { title: localize(TRANSLATION, locale()).armor, callback: armorFilter },
                  { title: localize(TRANSLATION, locale()).items, callback: itemFilter }
                ]}
                onReloadCharacter={props.onReloadCharacter}
              />
            </Match>
            <Match when={activeTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeTab() === 'avatar'}>
              <Avatar character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
          </Switch>
        </div>
      </>
    );
  });

  return (
    <>
      <ContentWrapper mobileView={mobileView()} leftView={leftView()} rightView={rightView()} />
    </>
  );
}
