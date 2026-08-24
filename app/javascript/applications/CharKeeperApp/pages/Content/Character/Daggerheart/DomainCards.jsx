import { createSignal, createEffect, For, Show, createMemo, batch } from 'solid-js';

import { DomainCardsTable } from './DomainCardsTable';
import {
  createModal, StatsBlock, ErrorWrapper, Button, Toggle, TextArea, Checkbox, GuideWrapper, Dice, EditWrapper, Select
} from '../../../../components';
import config from '../../../../data/daggerheart.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall } from '../../../../assets';
import { fetchSpellsRequest } from '../../../../requests/fetchSpellsRequest';
import { fetchCharacterSpellsRequest } from '../../../../requests/fetchCharacterSpellsRequest';
import { createCharacterSpellRequest } from '../../../../requests/createCharacterSpellRequest';
import { updateCharacterSpellRequest } from '../../../../requests/updateCharacterSpellRequest';
import { removeCharacterSpellRequest } from '../../../../requests/removeCharacterSpellRequest';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier, localize, translate, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    loadoutLimit: 'Loadout limit',
    domainCardIsAdded: 'Domain card is added',
    onlyAvailableSpells: 'Only available',
    spell: 'Spell',
    ability: 'Ability',
    grimoire: 'Grimoire',
    level: 'Level',
    selectTrait: 'Select custom spellcast trait',
    limit: 'Cards limit',
    spellcastTraits: 'Spellcast traits',
    loadout: 'Loadout',
    vault: 'Vault',
    select: 'Add domain cards',
    cardNote: 'Domain card note',
    save: 'Save',
    cancel: 'Cancel'
  },
  ru: {
    loadoutLimit: 'Лимит инвентаря',
    domainCardIsAdded: 'Карта домена добавлена',
    onlyAvailableSpells: 'Доступные',
    spell: 'Заклинание',
    ability: 'Способность',
    grimoire: 'Гримуар',
    level: 'Уровень',
    selectTrait: 'Выбрать альтернативную характеристику заклинателя.',
    limit: 'Лимит карт',
    spellcastTraits: 'Способности',
    loadout: 'Инвентарь',
    vault: 'Хранилище',
    select: 'Добавить карты',
    cardNote: 'Заметка',
    save: 'Сохранить',
    cancel: 'Отменить'
  },
  es:{
    loadoutLimit: 'Límite de equipamiento',
    domainCardIsAdded: 'La carta de dominio se ha añadido',
    onlyAvailableSpells: 'Solo disponibles',
    spell: 'Hechizo',
    ability: 'Habilidad',
    grimoire: 'Grimorio',
    level: 'Nivel',
    selectTrait: 'Select custom spellcast trait',
    limit: 'Límite de cartas',
    spellcastTraits: 'Atributos de conjuro',
    loadout: 'Carga',
    vault: 'Baúl',
    select: 'Añadir cartas de Dominio',
    cardNote: 'Nota de carta de Dominio',
    save: 'Guardar',
    cancel: 'Copiar'
  }
}

export const DaggerheartDomainCards = (props) => {
  const character = () => props.character;
  const domains = () => config.domains;
  const traits = () => config.traits;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [characterSpells, setCharacterSpells] = createSignal(undefined);
  const [spells, setSpells] = createSignal(undefined);
  const [spellsSelectingMode, setSpellsSelectingMode] = createSignal(false);
  const [changingSpell, setChangingSpell] = createSignal(null);
  const [availableDomainsFilter, setAvailableDomainsFilter] = createSignal(true);

  const [editMode, setEditMode] = createSignal(false);
  const [spellcastTrait, setSpellcastTrait] = createSignal(null);

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
  const [{ renderNotice, renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    const fetchSpells = async () => await fetchSpellsRequest(
      appState.accessToken,
      character().provider,
      { max_level: character().level }
    );
    const fetchCharacterSpells = async () => await fetchCharacterSpellsRequest(appState.accessToken, character().provider, character().id);

    Promise.all([fetchCharacterSpells(), fetchSpells()]).then(
      ([characterSpellsData, spellsData]) => {
        batch(() => {
          setCharacterSpells(characterSpellsData.spells);
          setSpells(spellsData.spells.sort((a, b) => a.name > b.name));
        });
      }
    );

    batch(() => {
      setLastActiveCharacterId(character().id);
      setSpellcastTrait(character().spellcast_trait);
    });
  });

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const currentLocale = createMemo(() => {
    const providerLocale = appState.providerLocales['daggerheart'];
    if (providerLocale && providerLocale.includes(`${locale()}-`)) return providerLocale;
    return locale();
  });

  const daggerheartDomains = createMemo(() => {
    if (domains() === undefined) return {};

    return { ...domains(), ...character().homebrew_domains };
  });

  const renderingDomains = createMemo(() => {
    if (availableDomainsFilter()) return character().selected_domains;

    return Object.keys(daggerheartDomains());
  });

  const learnedSpells = createMemo(() => {
    if (characterSpells() === undefined) return 0;

    return characterSpells().map((item) => item.slug);
  });

  const selectDomainCard = async (spellId) => {
    const result = await createCharacterSpellRequest(
      appState.accessToken,
      character().provider,
      character().id,
      { spell_id: spellId }
    );

    if (result.errors_list === undefined) {
      batch(() => {
        setCharacterSpells([result.spell].concat(characterSpells()));
        renderNotice(i18n().domainCardIsAdded);
      });
      props.onReloadCharacter();
    }
  }

  const changeSpell = (spell) => {
    batch(() => {
      setChangingSpell(spell);
      openModal();
    });
  }

  const updateSpell = async () => await updateCharacterSpell(
    changingSpell(),
    { character_spell: { notes: changingSpell().notes } }
  );

  const updateCharacterSpell = async (spell, payload) => {
    const result = await updateCharacterSpellRequest(
      appState.accessToken, character().provider, character().id, spell.id, payload
    );

    if (result.errors_list === undefined) {
      batch(() => {
        const newValue = characterSpells().slice().map((element) => {
          if (element.id !== spell.id) return element;
          return { ...element, ...payload.character_spell }
        });
        setCharacterSpells(newValue);
        closeModal();
      });
      props.onReloadCharacter();
    }
  }

  const removeCharacterSpell = async (spell) => {
    const result = await removeCharacterSpellRequest(
      appState.accessToken, character().provider, character().id, spell.id
    );
    if (result.errors_list === undefined) {
      setCharacterSpells(characterSpells().filter((item) => item.id !== spell.id));
      props.onReloadCharacter();
    }
  }

  const renderSpellcastTraits = (spellcastTraits) => {
    const trait = spellcastTraits[0];
    if (!trait) return;

    return (
      <p class="text-base dark:text-snow flex items-center">
        <span class="text-sm mr-2 uppercase">{localize(traits()[trait].shortName, currentLocale())}</span>
        <Dice
          width="28"
          height="28"
          text={modifier(character().modified_traits[trait] + character().spell_bonus)}
          onClick={() => props.openDualityTest(`/check attack ${trait}`, null, character().modified_traits[trait] + character().spell_bonus)}
        />
      </p>
    );
  };

  const submit = async () => {
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: { spellcast_trait: spellcastTrait() } });
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        batch(() => {
          props.onReloadCharacter();
          setEditMode(false)
        });
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartDomainCards' }}>
      <GuideWrapper
        character={character()}
        guideStep={props.guideStep}
        helpMessage={props.helpMessage}
        onReloadCharacter={props.onReloadCharacter}
        onNextClick={props.onNextGuideStepClick}
      >
        <Show
          when={!spellsSelectingMode()}
          fallback={
            <>
              <div class="flex justify-between items-center mb-2">
                <Checkbox
                  labelText={i18n().onlyAvailableSpells}
                  labelPosition="right"
                  labelClassList="ml-2"
                  checked={availableDomainsFilter()}
                  onToggle={() => setAvailableDomainsFilter(!availableDomainsFilter())}
                />
              </div>
              <For each={renderingDomains()}>
                {(domain) =>
                  <Toggle title={localize(daggerheartDomains()[domain].name, currentLocale())}>
                    <div>
                      <For each={spells().filter((spell) => spell.origin_value === domain).sort((a, b) => a.conditions.level - b.conditions.level)}>
                        {(spell) =>
                          <div class="domain-card reverse" classList={{ 'opacity-50': learnedSpells().includes(spell.slug) }}>
                            <div class="domain-card-title">
                              <p class="font-normal! text-lg">{spell.title}</p>
                              <Show when={spell.info.type}>
                                {i18n()[spell.info.type]} ({spell.conditions.level} {i18n().level})
                              </Show>
                            </div>
                            <p
                              class="feat-markdown domain-card-desc"
                              innerHTML={spell.description} // eslint-disable-line solid/no-innerhtml
                            />
                            <Show when={!learnedSpells().includes(spell.slug)}>
                              <div class="domain-card-actions">
                                <Button default size="small" onClick={() => selectDomainCard(spell.id)}>
                                  <PlusSmall />
                                </Button>
                              </div>
                            </Show>
                          </div>
                        }
                      </For>
                    </div>
                  </Toggle>
                }
              </For>
              <Button default textable onClick={() => setSpellsSelectingMode(false)}><span>{i18n().back}</span></Button>
            </>
          }
        >
          <Show when={characterSpells() !== undefined}>
            <EditWrapper position="right" editMode={editMode()} onSetEditMode={setEditMode} onCancelEditing={() => setEditMode(false)} onSaveChanges={submit}>
              <Show
                when={!editMode()}
                fallback={
                  <div class="blockable blockable-padding mb-2">
                    <Select
                      withNull
                      labelText={i18n().selectTrait}
                      items={translate(config.traits, locale())}
                      selectedValue={spellcastTrait()}
                      onSelect={setSpellcastTrait}
                    />
                  </div>
                }
              >
                <StatsBlock
                  items={[
                    { title: i18n().limit, value: character().domain_cards_max },
                    { title: i18n().spellcastTraits, value: renderSpellcastTraits(character().spellcast_traits) }
                  ]}
                />
              </Show>
            </EditWrapper>
            <Button default textable classList="mb-2" onClick={() => setSpellsSelectingMode(true)}>
              <span>{i18n().select}</span>
            </Button>
            <DomainCardsTable
              countCards
              title={i18n().loadout}
              subtitle={`${i18n().loadoutLimit} - ${character().loadout}`}
              spells={characterSpells().filter((spell) => spell.ready_to_use)}
              domains={daggerheartDomains()}
              onChangeSpell={changeSpell}
              onUpdateCharacterSpell={updateCharacterSpell}
              onRemoveCharacterSpell={removeCharacterSpell}
            />
            <DomainCardsTable
              title={i18n().vault}
              spells={characterSpells().filter((spell) => !spell.ready_to_use)}
              domains={daggerheartDomains()}
              onChangeSpell={changeSpell}
              onUpdateCharacterSpell={updateCharacterSpell}
              onRemoveCharacterSpell={removeCharacterSpell}
            />
          </Show>
        </Show>
      </GuideWrapper>
      <Modal>
        <Show when={changingSpell()}>
          <TextArea
            rows="2"
            labelText={i18n().cardNote}
            value={changingSpell().notes}
            onChange={(value) => setChangingSpell({ ...changingSpell(), notes: value })}
          />
          <Button default textable classList="mt-2" onClick={updateSpell}><span>{i18n().save}</span></Button>
        </Show>
      </Modal>
    </ErrorWrapper>
  );
}
