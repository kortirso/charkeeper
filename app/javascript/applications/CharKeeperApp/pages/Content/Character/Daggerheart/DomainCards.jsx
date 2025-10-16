import { createSignal, createEffect, For, Show, createMemo, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { DomainCardsTable } from './DomainCardsTable';
import { createModal, StatsBlock, ErrorWrapper, Button, Toggle, TextArea, Checkbox } from '../../../../components';
import config from '../../../../data/daggerheart.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall } from '../../../../assets';
import { fetchSpellsRequest } from '../../../../requests/fetchSpellsRequest';
import { fetchCharacterSpellsRequest } from '../../../../requests/fetchCharacterSpellsRequest';
import { createCharacterSpellRequest } from '../../../../requests/createCharacterSpellRequest';
import { updateCharacterSpellRequest } from '../../../../requests/updateCharacterSpellRequest';
import { removeCharacterSpellRequest } from '../../../../requests/removeCharacterSpellRequest';
import { modifier } from '../../../../helpers';

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

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
  const [{ renderNotice }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

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

    setLastActiveCharacterId(character().id);
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
        renderNotice(t('alerts.domainCardIsAdded'));
      });
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

  const renderSpellcastTraits = (spellcastTraits) => (
    <For each={spellcastTraits}>
      {(trait) =>
        <p class="text-sm dark:text-snow">{traits()[trait].name[locale()]} {modifier(character().modified_traits[trait])}</p>
      }
    </For>
  );

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartDomainCards' }}>
      <Show
        when={!spellsSelectingMode()}
        fallback={
          <>
            <div class="flex justify-between items-center mb-2">
              <Checkbox
                labelText={t('character.onlyAvailableSpells')}
                labelPosition="right"
                labelClassList="ml-2"
                checked={availableDomainsFilter()}
                onToggle={() => setAvailableDomainsFilter(!availableDomainsFilter())}
              />
            </div>
            <For each={renderingDomains()}>
              {(domain) =>
                <Toggle title={daggerheartDomains()[domain].name[locale()]}>
                  <table class="w-full table table-top first-column-full-width">
                    <thead>
                      <tr>
                        <td />
                        <td />
                      </tr>
                    </thead>
                    <tbody>
                      <For each={spells().filter((spell) => spell.origin_value === domain)}>
                        {(spell) =>
                          <tr>
                            <td class="py-1 pl-1">
                              <div classList={{ 'opacity-50': learnedSpells().includes(spell.slug) }}>
                                <p class="dark:text-snow mb-1">{spell.title}</p>
                                <p class="text-xs dark:text-snow">{spell.description}</p>
                              </div>
                            </td>
                            <td class="py-1">
                              <span>
                                <Show when={!learnedSpells().includes(spell.slug)}>
                                  <Button default size="small" onClick={() => selectDomainCard(spell.id)}>
                                    <PlusSmall />
                                  </Button>
                                </Show>
                              </span>
                            </td>
                          </tr>
                        }
                      </For>
                    </tbody>
                  </table>
                </Toggle>
              }
            </For>
            <Button default textable onClick={() => setSpellsSelectingMode(false)}>{t('back')}</Button>
          </>
        }
      >
        <Show when={characterSpells() !== undefined}>
          <StatsBlock
            items={[
              { title: t('daggerheart.domainCards.limit'), value: character().domain_cards_max },
              { title: t('daggerheart.domainCards.spellcastTraits'), value: renderSpellcastTraits(character().spellcast_traits) }
            ]}
          />
          <Button default textable classList="mb-2" onClick={() => setSpellsSelectingMode(true)}>
            {t('daggerheart.domainCards.select')}
          </Button>
          <DomainCardsTable
            title={t('daggerheart.domainCards.loadout')}
            spells={characterSpells().filter((spell) => spell.ready_to_use)}
            onChangeSpell={changeSpell}
            onUpdateCharacterSpell={updateCharacterSpell}
            onRemoveCharacterSpell={removeCharacterSpell}
          />
          <DomainCardsTable
            title={t('daggerheart.domainCards.vault')}
            spells={characterSpells().filter((spell) => !spell.ready_to_use)}
            onChangeSpell={changeSpell}
            onUpdateCharacterSpell={updateCharacterSpell}
            onRemoveCharacterSpell={removeCharacterSpell}
          />
        </Show>
      </Show>
      <Modal>
        <Show when={changingSpell()}>
          <TextArea
            rows="2"
            labelText={t('daggerheart.domainCards.cardNote')}
            value={changingSpell().notes}
            onChange={(value) => setChangingSpell({ ...changingSpell(), notes: value })}
          />
          <Button default textable classList="mt-2" onClick={updateSpell}>{t('save')}</Button>
        </Show>
      </Modal>
    </ErrorWrapper>
  );
}
