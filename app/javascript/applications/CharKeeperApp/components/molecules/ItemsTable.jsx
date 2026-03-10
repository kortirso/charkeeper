import { createSignal, For, Show, Switch, Match } from 'solid-js';
import { createStore } from 'solid-js/store';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { ItemsTableItem } from './ItemsTableItem';
import { IconButton, createModal, DaggerheartItemUpgrade } from '../../components';
import { useAppLocale } from '../../context';
import { Hands, Equipment, Backpack, Storage, Dots } from '../../assets';
import { clickOutside, localize } from '../../helpers';

const STATE_ICONS = { 'hands': Hands, 'equipment': Equipment, 'backpack': Backpack, 'storage': Storage }

const TRANSLATION = {
  en: {
    change: 'Edit',
    delete: 'Remove',
    info: 'Info'
  },
  ru: {
    change: 'Изменить',
    delete: 'Убрать',
    info: 'Информация'
  }
}
const ITEMS_INFO = ['daggerheart'];

export const ItemsTable = (props) => {
  const size = createWindowSize();

  const items = () => props.items;
  const IconComponent = STATE_ICONS[props.state]; // eslint-disable-line solid/reactivity

  const [isOpen, setIsOpen] = createSignal(null);
  const [upgradingItem, setUpgradingItem] = createStore({ item: null, state: null });

  const { Modal, openModal, closeModal } = createModal();
  const [locale] = useAppLocale();

  const toggleMenu = (item) => setIsOpen(isOpen() ? null : item);

  const upgradeItem = (item, state) => {
    setUpgradingItem({ item: item, state: state });
    openModal();
  }

  const completeUpgrade = (value) => {
    closeModal();
    props.completeUpgrade(value);
  }

  return (
    <>
      <div class="equipment">
        <h2 class="equipment-title">
          <IconComponent width={20} height={20} />
          {props.title}
        </h2>
        <p class="equipment-subtitle">{props.subtitle}</p>
        <div class="equipment-items">
          <Show when={items().length > 0}>
            <For each={items()}>
              {(item) =>
                <div class="equipment-item">
                  <div class="flex-1">
                    <p class="equipment-item-name">{item.name} ({item.states[props.state]})</p>
                    <Show when={item.notes}>
                      <p class="equipment-item-notes">{item.notes}</p>
                    </Show>
                    <Show when={item.info?.features && item.info.features.length > 0}>
                      <For each={item.info.features}>
                        {(item) =>
                          <p class="equipment-item-notes">{item[locale()]}</p>
                        }
                      </For>
                    </Show>
                  </div>
                  <div class="flex">
                    <Show when={size.width >= 1024}>
                      <div class="flex items-start gap-x-1 mr-2">
                        <ItemsTableItem
                          state={props.state}
                          item={item}
                          upgrades={props.upgrades}
                          onMoveCharacterItem={props.onMoveCharacterItem}
                          onConsumeItem={props.onConsumeItem}
                          onConsumeCharacterItem={props.onConsumeCharacterItem}
                          upgradeItem={upgradeItem}
                        />
                      </div>
                    </Show>
                    <div class="relative h-6" use:clickOutside={() => setIsOpen(false)}>
                      <IconButton onClick={() => toggleMenu(item)}>
                        <Dots />
                      </IconButton>
                      <Show when={isOpen() === item}>
                        <div class="dots">
                          <Show when={size.width < 1024}>
                            <div class="dots-item flex gap-x-1">
                              <ItemsTableItem
                                state={props.state}
                                item={item}
                                upgrades={props.upgrades}
                                onMoveCharacterItem={props.onMoveCharacterItem}
                                onConsumeItem={props.onConsumeItem}
                                onConsumeCharacterItem={props.onConsumeCharacterItem}
                                upgradeItem={upgradeItem}
                              />
                            </div>
                          </Show>
                          <p class="dots-item" onClick={() => props.onChangeItem(item)}>{localize(TRANSLATION, locale()).change}</p>
                          <Show when={ITEMS_INFO.includes(props.provider)}>
                            <p class="dots-item" onClick={() => props.onInfoItem(item)}>{localize(TRANSLATION, locale()).info}</p>
                          </Show>
                          <p class="dots-item" onClick={() => props.onRemoveCharacterItem(item, props.state)}>{localize(TRANSLATION, locale()).delete}</p>
                        </div>
                      </Show>
                    </div>
                  </div>
                </div>
              }
            </For>
          </Show>
        </div>
      </div>
      <Modal>
        <Show when={upgradingItem.item}>
          <Switch>
            <Match when={props.provider === 'daggerheart'}>
              <DaggerheartItemUpgrade
                characterId={props.characterId}
                item={upgradingItem.item}
                state={upgradingItem.state}
                upgradeItems={props.upgradeItems}
                completeUpgrade={completeUpgrade}
              />
            </Match>
          </Switch>
        </Show>
      </Modal>
    </>
  );
}
