import { createSignal, createMemo, Switch, Match, Show } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import {
  CosmereAbilities, CosmereSkills, CosmereDefenses, CosmereHealth, CosmereInfo, CosmereRest, CosmereLeveling, CosmereBonuses,
  CosmereGoals, CosmereSingerForm, CosmereEquipment
} from '../../../pages';
import { CharacterNavigation, Notes, Avatar, ContentWrapper, Combat, createRoll, Feats } from '../../../components';
import { useAppLocale } from '../../../context';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    radiantFilter: 'Invested Path',
    ancestry: 'Ancestry',
    path: 'Heroic Path',
    surge: 'Invested Art'
  },
  ru: {
    radiantFilter: 'Инвестированный путь',
    ancestry: 'Наследие',
    path: 'Путь',
    surge: 'Инвестированное искусство'
  }
}

export const Cosmere = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  const [activeMobileTab, setActiveMobileTab] = createSignal('abilities');
  const [activeTab, setActiveTab] = createSignal('combat');

  const { Roll, openCosmereTest, openD20Attack } = createRoll();
  const [locale] = useAppLocale();

  const ancestryFilter = (item) => item.origin === 'ancestry';
  const pathFilter = (item) => item.origin === 'path' || item.origin === 'specialization';
  const radiantFilter = (item) => item.origin === 'radiant_path';
  const surgeFilter = (item) => item.origin === 'surge';

  const featFilters = createMemo(() => {
    return [
      { title: 'ancestry', translation: localize(TRANSLATION, locale()).ancestry, callback: ancestryFilter },
      { title: 'path', translation: localize(TRANSLATION, locale()).path, callback: pathFilter },
      { title: 'radiant_path', translation: localize(TRANSLATION, locale()).radiantFilter, callback: radiantFilter },
      { title: 'surge', translation: localize(TRANSLATION, locale()).surge, callback: surgeFilter }
    ];
  });

  const characterTabs = createMemo(() => {
    return ['combat', 'equipment', 'goals', 'rest', 'classLevels', 'bonuses', 'notes', 'avatar'];
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
              <Show when={character().ancestry === 'singer'}>
                <div class="mt-4">
                  <CosmereSingerForm character={character()} onReplaceCharacter={props.onReplaceCharacter} />
                </div>
              </Show>
              <div class="mt-4">
                <CosmereSkills
                  character={character()}
                  openCosmereTest={openCosmereTest}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'combat'}>
              <CosmereDefenses character={character()} />
              <div class="mt-4">
                <CosmereHealth character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <Combat
                  character={character()}
                  openD20Test={openCosmereTest}
                  openD20Attack={openD20Attack}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
              <div class="mt-4">
                <Feats
                  directTranslation
                  character={character()}
                  filters={featFilters()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'equipment'}>
              <CosmereEquipment
                character={character()}
                onReloadCharacter={props.onReloadCharacter}
              />
            </Match>
            <Match when={activeMobileTab() === 'goals'}>
              <CosmereGoals character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'rest'}>
              <CosmereRest character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'classLevels'}>
              <CosmereLeveling
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              />
            </Match>
            <Match when={activeMobileTab() === 'bonuses'}>
              <CosmereBonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
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
        <Show when={character().ancestry === 'singer'}>
          <div class="mt-4">
            <CosmereSingerForm character={character()} onReplaceCharacter={props.onReplaceCharacter} />
          </div>
        </Show>
        <div class="mt-4">
          <CosmereSkills
            character={character()}
            openCosmereTest={openCosmereTest}
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
                <CosmereHealth character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <Combat
                  character={character()}
                  openD20Test={openCosmereTest}
                  openD20Attack={openD20Attack}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
              <div class="mt-4">
                <Feats
                  directTranslation
                  character={character()}
                  filters={featFilters()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
            </Match>
            <Match when={activeTab() === 'equipment'}>
              <CosmereEquipment
                character={character()}
                onReloadCharacter={props.onReloadCharacter}
              />
            </Match>
            <Match when={activeTab() === 'goals'}>
              <CosmereGoals character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeTab() === 'rest'}>
              <CosmereRest character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeTab() === 'classLevels'}>
              <CosmereLeveling
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              />
            </Match>
            <Match when={activeTab() === 'bonuses'}>
              <CosmereBonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
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
      <Roll provider="cosmere" characterId={character().id} />
    </>
  );
}
