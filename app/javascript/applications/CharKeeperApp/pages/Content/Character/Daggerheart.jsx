import { createSignal, createMemo, Show, Switch, Match } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import {
  DaggerheartTraits, DaggerheartStatic, DaggerheartHealth, DaggerheartBeastform, DaggerheartCompanion,
  DaggerheartDomainCards, DaggerheartRest, DaggerheartLeveling, DaggerheartExperience, DaggerheartTransform,
  DaggerheartStances, DaggerheartBonuses, DaggerheartCraft, DaggerheartScars, DaggerheartInfo, DaggerheartLootTable,
  DaggerheartEquipment
} from '../../../pages';
import {
  CharacterNavigation, Notes, Avatar, ContentWrapper, Feats, createRoll, ConditionsV2, Combat, Gold
} from '../../../components';
import { useAppLocale } from '../../../context';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    domainHelpMessage: "To start, look at all the level 1 cards from your class's two domains and choose two cards. You can take one from each domain or two from a single domain.",
    levelingHelpMessage: "In the future on this tab you can level up your character."
  },
  ru: {
    domainHelpMessage: "В начале изучите все карты 1 уровня из двух доменов вашего класса и выберите 2 карты. Вы можете выбрать по карте из каждого домена или обе карты из одного домена.",
    levelingHelpMessage: "В будущем на этой вкладке вы сможете указывать уровень вашего персонажа."
  },
  es: {
    domainHelpMessage: "Para empezar, mira todas las cartas de nivel 1 de los dos dominios de tu clase y elige dos cartas. Puedes elegir una de cada dominio o dos del mismo dominio.",
    levelingHelpMessage: "En el futuro en esta pestaña podrás subir de nivel a tu personaje."
  }
}

export const Daggerheart = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  const [activeMobileTab, setActiveMobileTab] = createSignal('traits');
  const [activeTab, setActiveTab] = createSignal('combat');

  const { Roll, openDualityTest, openDualityAttack, openDices } = createRoll();
  const [locale] = useAppLocale();

  const ancestryFilter = (item) => item.origin === 'ancestry';
  const communityFilter = (item) => item.origin === 'community';
  const classFilter = (item) => item.origin === 'class';
  const subclassFilter = (item) => item.origin === 'subclass';
  const beastformFilter = (item) => item.origin === 'beastform';
  const personalFilter = (item) => item.origin === 'character';
  const transformationFilter = (item) => item.origin === 'transformation';
  const domainCardFilter = (item) => item.origin === 'domain_card' || item.origin === 'parent';
  const equipmentFilter = (item) => item.origin === 'equipment';
  const companionFilter = (item) => item.origin === 'companion';
  const mechanicFilter = (item) => item.origin === 'mechanic';

  const featFilters = createMemo(() => {
    const result = [
      { title: 'ancestry', callback: ancestryFilter },
      { title: 'community', callback: communityFilter },
      { title: 'class', callback: classFilter },
      { title: 'subclass', callback: subclassFilter },
      { title: 'domainCards', callback: domainCardFilter },
      { title: 'equipment', callback: equipmentFilter }
    ];

    if (Object.keys(character().mechanic_items).length > 0) result.push({ title: 'mechanic', callback: mechanicFilter });
    if (character().beastform !== null) result.push({ title: 'beastform', callback: beastformFilter });
    if (character().transformation !== null) result.push({ title: 'transformation', callback: transformationFilter });
    if (character().can_have_companion) result.push({ title: 'companion', callback: companionFilter });
    result.push({ title: 'personal', callback: personalFilter });
    return result;
  });

  const characterTabs = createMemo(() => {
    const result = ['combat', 'equipment', 'domainCards', 'states', 'craft', 'classLevels', 'rest', 'bonuses'];
    if (character().can_have_companion) result.push('companion');
    return result.concat(['notes', 'avatar']);
  });

  const mobileView = createMemo(() => {
    if (size.width >= 1152) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={['traits'].concat(characterTabs())}
          activeTab={activeMobileTab()}
          setActiveTab={setActiveMobileTab}
          currentGuideStep={character().guide_step}
          markedTabs={{ '3': 'equipment', '4': 'domainCards', '5': 'classLevels' }}
        />
        <div class="p-2 pb-16 flex-1 overflow-y-auto">
          <Switch>
            <Match when={activeMobileTab() === 'traits'}>
              <DaggerheartInfo character={character()} />
              <div class="mt-4">
                <DaggerheartTraits
                  character={character()}
                  openDualityTest={openDualityTest}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
              <div class="mt-4">
                <DaggerheartExperience
                  object={character()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                  onNextGuideStepClick={() => setActiveMobileTab('equipment')}
                />
              </div>
              <div class="mt-4">
                <ConditionsV2 character={character()} />
              </div>
              <Show when={character().can_have_beastform}>
                <div class="mt-4">
                  <DaggerheartBeastform character={character()} onReplaceCharacter={props.onReplaceCharacter} />
                </div>
              </Show>
              <Show when={Object.keys(character().mechanic_items).length > 0}>
                <div class="mt-4">
                  <DaggerheartStances character={character()} onReplaceCharacter={props.onReplaceCharacter} />
                </div>
              </Show>
            </Match>
            <Match when={activeMobileTab() === 'combat'}>
              <DaggerheartStatic character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <DaggerheartHealth character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <Combat
                  character={character()}
                  openD20Test={openDualityTest}
                  openD20Attack={openDualityAttack}
                  onReplaceCharacter={props.onReplaceCharacter}
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
            <Match when={activeMobileTab() === 'equipment'}>
              <DaggerheartEquipment
                upgrades={['primary weapon', 'secondary weapon', 'armor']}
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                currentGuideStep={character().guide_step}
                guideStep={3}
                onNextGuideStepClick={() => setActiveMobileTab('domainCards')}
                lootTableComponent={DaggerheartLootTable}
              >
                <Gold character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </DaggerheartEquipment>
            </Match>
            <Match when={activeMobileTab() === 'domainCards'}>
              <DaggerheartDomainCards
                character={character()}
                onReloadCharacter={props.onReloadCharacter}
                currentGuideStep={character().guide_step}
                guideStep={4}
                helpMessage={localize(TRANSLATION, locale())['domainHelpMessage']}
                onNextGuideStepClick={() => setActiveMobileTab('classLevels')}
                openDualityTest={openDualityTest}
              />
            </Match>
            <Match when={activeMobileTab() === 'states'}>
              <DaggerheartTransform character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <DaggerheartScars character={character()} onReloadCharacter={props.onReloadCharacter} />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'companion'}>
              <DaggerheartCompanion openDices={openDices} character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'bonuses'}>
              <DaggerheartBonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'rest'}>
              <DaggerheartRest character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeMobileTab() === 'classLevels'}>
              <DaggerheartLeveling
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                currentGuideStep={character().guide_step}
                guideStep={5}
                helpMessage={localize(TRANSLATION, locale())['levelingHelpMessage']}
                finishGuideStep={true}
              />
            </Match>
            <Match when={activeMobileTab() === 'craft'}>
              <DaggerheartCraft
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
        <DaggerheartInfo character={character()} />
        <div class="mt-4">
          <DaggerheartTraits
            character={character()}
            openDualityTest={openDualityTest}
            onReplaceCharacter={props.onReplaceCharacter}
            onReloadCharacter={props.onReloadCharacter}
          />
        </div>
        <div class="mt-4">
          <DaggerheartStatic character={character()} onReplaceCharacter={props.onReplaceCharacter} />
        </div>
        <div class="mt-4">
          <DaggerheartExperience
            object={character()}
            onReplaceCharacter={props.onReplaceCharacter}
            onReloadCharacter={props.onReloadCharacter}
            onNextGuideStepClick={() => setActiveTab('equipment')}
          />
        </div>
        <div class="mt-4">
          <ConditionsV2 character={character()} />
        </div>
        <Show when={character().can_have_beastform}>
          <div class="mt-4">
            <DaggerheartBeastform character={character()} onReplaceCharacter={props.onReplaceCharacter} />
          </div>
        </Show>
        <Show when={Object.keys(character().mechanic_items).length > 0}>
          <div class="mt-4">
            <DaggerheartStances character={character()} onReplaceCharacter={props.onReplaceCharacter} />
          </div>
        </Show>
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
          markedTabs={{ '3': 'equipment', '4': 'domainCards', '5': 'classLevels' }}
        />
        <div class="p-2 pb-16 flex-1">
          <Switch>
            <Match when={activeTab() === 'combat'}>
              <DaggerheartHealth character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <Combat
                  character={character()}
                  openD20Test={openDualityTest}
                  openD20Attack={openDualityAttack}
                  onReplaceCharacter={props.onReplaceCharacter}
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
            <Match when={activeTab() === 'equipment'}>
              <DaggerheartEquipment
                upgrades={['primary weapon', 'secondary weapon', 'armor']}
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                currentGuideStep={character().guide_step}
                guideStep={3}
                onNextGuideStepClick={() => setActiveMobileTab('domainCards')}
                lootTableComponent={DaggerheartLootTable}
              >
                <Gold character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </DaggerheartEquipment>
            </Match>
            <Match when={activeTab() === 'domainCards'}>
              <DaggerheartDomainCards
                character={character()}
                onReloadCharacter={props.onReloadCharacter}
                currentGuideStep={character().guide_step}
                guideStep={4}
                helpMessage={localize(TRANSLATION, locale())['domainHelpMessage']}
                onNextGuideStepClick={() => setActiveTab('classLevels')}
                openDualityTest={openDualityTest}
              />
            </Match>
            <Match when={activeTab() === 'states'}>
              <DaggerheartTransform character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <DaggerheartScars character={character()} onReloadCharacter={props.onReloadCharacter} />
              </div>
            </Match>
            <Match when={activeTab() === 'companion'}>
              <DaggerheartCompanion openDices={openDices} character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeTab() === 'bonuses'}>
              <DaggerheartBonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeTab() === 'rest'}>
              <DaggerheartRest character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeTab() === 'classLevels'}>
              <DaggerheartLeveling
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                currentGuideStep={character().guide_step}
                guideStep={5}
                helpMessage={localize(TRANSLATION, locale())['levelingHelpMessage']}
                finishGuideStep={true}
              />
            </Match>
            <Match when={activeTab() === 'craft'}>
              <DaggerheartCraft
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
      <Roll provider="daggerheart" characterId={character().id} advantageDice={character().advantage_dice} />
    </>
  );
}
