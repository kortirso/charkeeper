import { createSignal, createMemo, Switch, Match, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { createWindowSize } from '@solid-primitives/resize-observer';

import {
  Dnd5Abilities, Dnd5Combat, Dnd5Rest, Dnd5ClassLevels, Dnd5Professions, Dnd5Spells, Dnd5Skills, Dnd5SavingThrows,
  Dnd5Proficiency, Dnd2024WildShapes, BeastFeatures, Dnd5Craft, Dnd5Bonuses
} from '../../../pages';
import {
  CharacterNavigation, Equipment, Notes, Avatar, ContentWrapper, Feats, createDiceRoll, Conditions, Combat, Gold
} from '../../../components';
import { useAppState, useAppLocale } from '../../../context';
import { updateCharacterRequest } from '../../../requests/updateCharacterRequest';

const TRANSLATION = {
  en: {
    equipmentHelpMessage: 'Here you can select equipment for your character.',
    levelingHelpMessage: 'In the future on this tab you can level up your character.'
  },
  ru: {
    equipmentHelpMessage: 'На этой вкладке вы можете выбрать снаряжение для вашего персонажа.',
    levelingHelpMessage: 'В будущем на этой вкладке вы сможете указывать уровень вашего персонажа.'
  }
}

export const Dnd5 = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  // page state
  const [activeMobileTab, setActiveMobileTab] = createSignal('abilities');
  const [activeTab, setActiveTab] = createSignal('combat');

  const { DiceRoll, openDiceRoll, openSimpleDiceRoll } = createDiceRoll();
  const [appState] = useAppState();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  // only sends request
  const refreshCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, props.character.provider, props.character.id, { character: payload });

    return result;
  }

  // sends request and reload character data
  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, props.character.provider, props.character.id, { character: payload });

    if (result.errors_list === undefined) await props.onReloadCharacter();
    return result;
  }

  const itemFilter = (item) => item.kind === 'item';
  const weaponFilter = (item) => item.kind.includes('weapon');
  const armorFilter = (item) => item.kind.includes('armor') || item.kind.includes('shield');
  const ammoFilter = (item) => item.kind === 'ammo';
  const focusFilter = (item) => item.kind === 'focus';
  const toolsFilter = (item) => item.kind === 'tools';
  const musicFilter = (item) => item.kind === 'music';
  const potionFilter = (item) => item.kind === 'potion';

  const raceFilter = (item) => item.origin === 'race';
  const subraceFilter = (item) => item.origin === 'subrace';
  const speciesFilter = (item) => item.origin === 'species';
  const legacyFilter = (item) => item.origin === 'legacy';
  const classFilter = (item) => item.origin === 'class';
  const subclassFilter = (item) => item.origin === 'subclass';
  const featFilter = (item) => item.origin === 'feat';

  const featDnd5Filters = createMemo(() => {
    const result = [{ title: 'race', callback: raceFilter }];

    if (character().subrace) result.push({ title: 'subrace', callback: subraceFilter });
    result.push({ title: 'class', callback: classFilter });
    if (Object.values(character().subclasses).filter((item) => item !== null).length > 0) result.push({ title: 'subclass', callback: subclassFilter });

    return result;
  });

  const featDnd2024Filters = createMemo(() => {
    const result = [{ title: 'species', callback: speciesFilter }];

    if (character().legacy) result.push({ title: 'legacy', callback: legacyFilter });
    result.push({ title: 'class', callback: classFilter });
    if (Object.values(character().subclasses).filter((item) => item !== null).length > 0) result.push({ title: 'subclass', callback: subclassFilter });
    result.push({ title: 'feat', callback: featFilter });

    return result;
  });

  const featFilters = createMemo(() => character().provider === 'dnd5' ? featDnd5Filters() : featDnd2024Filters());

  const characterTabs = createMemo(() => {
    const result = ['combat', 'equipment', 'spells', 'professions'];
    if (character().provider === 'dnd2024') result.push('craft');
    return result.concat(['classLevels', 'rest', 'bonuses', 'notes', 'avatar']);
  });

  const mobileView = createMemo(() => {
    if (size.width >= 1152) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={['abilities'].concat(characterTabs())}
          activeTab={activeMobileTab()}
          setActiveTab={setActiveMobileTab}
          currentGuideStep={character().guide_step}
          markedTabs={{ '3': 'equipment', '4': 'classLevels' }}
        />
        <div class="p-2 pb-16 flex-1 overflow-y-auto">
          <Switch>
            <Match when={activeMobileTab() === 'abilities'}>
              <Dnd5Abilities
                character={character()}
                openDiceRoll={openDiceRoll}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              />
              <div class="mt-4">
                <Dnd5Proficiency character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <Dnd5SavingThrows character={character()} openDiceRoll={openDiceRoll} />
              </div>
              <div class="mt-4">
                <Conditions character={character()} />
              </div>
              <Show when={character().provider === 'dnd2024' && Object.keys(character().classes).includes('druid')}>
                <div class="mt-4">
                  <Dnd2024WildShapes character={character()} onReplaceCharacter={props.onReplaceCharacter} />
                </div>
              </Show>
              <div class="mt-4">
                <Dnd5Skills
                  character={character()}
                  openDiceRoll={openDiceRoll}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                  onNextGuideStepClick={() => setActiveMobileTab('equipment')}
                />
              </div>
              <div class="mt-4">
                <Feats
                  character={character()}
                  filters={featFilters()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'combat'}>
              <Dnd5Combat
                character={character()}
                openDiceRoll={openDiceRoll}
                onReloadCharacter={updateCharacter}
                onRefreshCharacter={refreshCharacter}
                onReplaceCharacter={props.onReplaceCharacter}
              />
              <div class="mt-4">
                <Show when={character().beastform === null} fallback={<BeastFeatures character={character()} />}>
                  <Combat
                    character={character()}
                    openDiceRoll={openDiceRoll}
                    openSimpleDiceRoll={openSimpleDiceRoll}
                    onReplaceCharacter={props.onReplaceCharacter}
                  />
                </Show>
              </div>
            </Match>
            <Match when={activeMobileTab() === 'rest'}>
              <Dnd5Rest character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'bonuses'}>
              <Dnd5Bonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'equipment'}>
              <Equipment
                withWeight
                withPrice
                character={character()}
                itemFilters={[
                  { title: t('equipment.itemsList'), callback: itemFilter },
                  { title: t('equipment.weaponsList'), callback: weaponFilter },
                  { title: t('equipment.armorList'), callback: armorFilter },
                  { title: t('equipment.consumables'), callback: potionFilter},
                  { title: t('equipment.ammoList'), callback: ammoFilter },
                  { title: t('equipment.focusList'), callback: focusFilter },
                  { title: t('equipment.toolsList'), callback: toolsFilter },
                  { title: t('equipment.musicList'), callback: musicFilter}
                ]}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                guideStep={3}
                helpMessage={TRANSLATION[locale()]['equipmentHelpMessage']}
                onNextGuideStepClick={() => setActiveMobileTab('classLevels')}
              >
                <Gold character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </Equipment>
            </Match>
            <Match when={activeMobileTab() === 'spells'}>
              <Dnd5Spells character={character()} openDiceRoll={openDiceRoll} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeMobileTab() === 'classLevels'}>
              <Dnd5ClassLevels
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                currentGuideStep={character().guide_step}
                helpMessage={TRANSLATION[locale()]['levelingHelpMessage']}
              />
            </Match>
            <Match when={activeMobileTab() === 'professions'}>
              <Dnd5Professions
                character={character()}
                onRefreshCharacter={refreshCharacter}
                onReloadCharacter={updateCharacter}
              />
            </Match>
            <Match when={activeMobileTab() === 'craft'}>
              <Dnd5Craft
                character={character()}
                onReloadCharacter={props.onReloadCharacter}
              />
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
        <Dnd5Abilities
          character={character()}
          openDiceRoll={openDiceRoll}
          onReplaceCharacter={props.onReplaceCharacter}
          onReloadCharacter={props.onReloadCharacter}
        />
        <div class="mt-4">
          <Dnd5SavingThrows character={character()} openDiceRoll={openDiceRoll} />
        </div>
        <div class="mt-4">
          <Dnd5Proficiency character={character()} onReplaceCharacter={props.onReplaceCharacter} />
        </div>
        <div class="emd:gap-4 emd:mt-4 grid grid-cols-1 emd:grid-cols-2">
          <div class="mt-4 emd:mt-0">
            <Conditions character={character()} />
            <Show when={character().provider === 'dnd2024' && Object.keys(character().classes).includes('druid')}>
              <div class="mt-4">
                <Dnd2024WildShapes character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
            </Show>
          </div>
          <div class="mt-4 emd:mt-0">
            <Dnd5Skills
              character={character()}
              openDiceRoll={openDiceRoll}
              onReplaceCharacter={props.onReplaceCharacter}
              onReloadCharacter={props.onReloadCharacter}
              onNextGuideStepClick={() => setActiveTab('equipment')}
            />
          </div>
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
          currentGuideStep={character().guide_step}
          markedTabs={{ '3': 'equipment', '4': 'classLevels' }}
        />
        <div class="p-2 pb-16 flex-1">
          <Switch>
            <Match when={activeTab() === 'combat'}>
              <Dnd5Combat
                character={character()}
                openDiceRoll={openDiceRoll}
                onReloadCharacter={updateCharacter}
                onRefreshCharacter={refreshCharacter}
                onReplaceCharacter={props.onReplaceCharacter}
              />
              <div class="mt-4">
                <Show when={character().beastform === null} fallback={<BeastFeatures character={character()} />}>
                  <Combat
                    character={character()}
                    openDiceRoll={openDiceRoll}
                    openSimpleDiceRoll={openSimpleDiceRoll}
                    onReplaceCharacter={props.onReplaceCharacter}
                  />
                </Show>
              </div>
              <div class="mt-4">
                <Feats
                  character={character()}
                  filters={featFilters()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
            </Match>
            <Match when={activeTab() === 'rest'}>
              <Dnd5Rest character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeTab() === 'equipment'}>
              <Equipment
                withWeight
                withPrice
                character={character()}
                itemFilters={[
                  { title: t('equipment.itemsList'), callback: itemFilter },
                  { title: t('equipment.weaponsList'), callback: weaponFilter },
                  { title: t('equipment.armorList'), callback: armorFilter },
                  { title: t('equipment.consumables'), callback: potionFilter},
                  { title: t('equipment.ammoList'), callback: ammoFilter },
                  { title: t('equipment.focusList'), callback: focusFilter },
                  { title: t('equipment.toolsList'), callback: toolsFilter },
                  { title: t('equipment.musicList'), callback: musicFilter}
                ]}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                guideStep={3}
                helpMessage={TRANSLATION[locale()]['equipmentHelpMessage']}
                onNextGuideStepClick={() => setActiveTab('classLevels')}
              >
                <Gold character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </Equipment>
            </Match>
            <Match when={activeTab() === 'spells'}>
              <Dnd5Spells character={character()} openDiceRoll={openDiceRoll} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeTab() === 'bonuses'}>
              <Dnd5Bonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeTab() === 'classLevels'}>
              <Dnd5ClassLevels
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                currentGuideStep={character().guide_step}
                helpMessage={TRANSLATION[locale()]['levelingHelpMessage']}
              />
            </Match>
            <Match when={activeTab() === 'professions'}>
              <Dnd5Professions
                character={character()}
                onRefreshCharacter={refreshCharacter}
                onReloadCharacter={updateCharacter}
              />
            </Match>
            <Match when={activeTab() === 'craft'}>
              <Dnd5Craft
                character={character()}
                onReloadCharacter={props.onReloadCharacter}
              />
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
      <DiceRoll provider="dnd" characterId={character().id} />
    </>
  );
}
