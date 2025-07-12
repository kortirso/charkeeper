import { createSignal, createEffect, For, Show, createMemo, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { DomainCardsTable } from './DomainCardsTable';
import { createModal, StatsBlock, ErrorWrapper, Button, Toggle, TextArea } from '../../../../components';
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

  const [characterSpells, setCharacterSpells] = createSignal(undefined);
  const [spells, setSpells] = createSignal(undefined);
  const [spellsSelectingMode, setSpellsSelectingMode] = createSignal(false);
  const [changingSpell, setChangingSpell] = createSignal(null);

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
  const [{ renderNotice }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const fetchCharacterSpells = async () => await fetchCharacterSpellsRequest(appState.accessToken, character().provider, character().id);

  createEffect(() => {
    if (characterSpells() !== undefined) return;
    if (spells() !== undefined) return;

    const fetchSpells = async () => await fetchSpellsRequest(
      appState.accessToken,
      character().provider,
      { domains: character().selected_domains.join(','), max_level: character().level }
    );

    Promise.all([fetchCharacterSpells(), fetchSpells()]).then(
      ([characterSpellsData, spellsData]) => {
        batch(() => {
          setCharacterSpells(characterSpellsData.spells);
          setSpells(spellsData.spells.sort((a, b) => a.name > b.name));
        });
      }
    );
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

    if (result.errors === undefined) {
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

    if (result.errors === undefined) {
      batch(() => {
        const newValue = characterSpells().slice().map((element) => {
          if (element.id !== spell.id) return element;
          return { ...element, ...payload.character_spell }
        });
        setCharacterSpells(newValue);
        closeModal();
      });
    }
  }

  const removeCharacterSpell = async (spell) => {
    const result = await removeCharacterSpellRequest(
      appState.accessToken, character().provider, character().id, spell.id
    );
    if (result.errors === undefined) {
      setCharacterSpells(characterSpells().filter((item) => item.id !== spell.id));
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
            <For each={character().selected_domains}>
              {(domain) =>
                <Toggle title={domains()[domain].name[locale()]}>
                  <table class="w-full table first-column-full-width">
                    <thead>
                      <tr>
                        <td />
                        <td />
                      </tr>
                    </thead>
                    <tbody>
                      <For each={spells().filter((spell) => spell.domain === domain)}>
                        {(spell) =>
                          <Show
                            when={learnedSpells().includes(spell.slug)}
                            fallback={
                              <tr>
                                <td class="py-1 pl-1">
                                  <p class="dark:text-snow">{spell.name}</p>
                                </td>
                                <td>
                                  <Button default size="small" onClick={() => selectDomainCard(spell.id)}>
                                    <PlusSmall />
                                  </Button>
                                </td>
                              </tr>
                            }
                          >
                            <tr>
                              <td class="py-1 pl-1">
                                <p class="dark:text-snow opacity-50">{spell.name}</p>
                              </td>
                              <td />
                            </tr>
                          </Show>
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
