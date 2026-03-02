import { For, Show } from 'solid-js';

import { Button } from '../../components';
import { Hands, Equipment, Backpack, Storage, Drink, Upgrade } from '../../assets';

export const ItemsTableItem = (props) => (
  <>
    <For each={[
      { state: 'hands', Icon: Hands }, { state: 'equipment', Icon: Equipment },
      { state: 'backpack', Icon: Backpack }, { state: 'storage', Icon: Storage }
    ]}>
      {({ state, Icon }) =>
        <Show when={props.state !== state}>
          <Button default size="small" onClick={() => props.onMoveCharacterItem(props.item, props.state, state)}>
            <Icon width={16} height={16} />
          </Button>
        </Show>
      }
    </For>
    <Show when={props.item.kind === 'consumables' && props.item.bonuses.length > 0}>
      <Button default size="small" onClick={() => props.onConsumeItem(props.item, props.state)}>
        <Drink width={16} height={16} />
      </Button>
    </Show>
    <Show when={(props.item.kind === 'consumables' || props.item.kind === 'potion') && props.item.info.consume}>
      <Button default size="small" onClick={() => props.onConsumeCharacterItem(props.item, props.state)}>
        <Drink width={16} height={16} />
      </Button>
    </Show>
    <Show when={props.upgrades && props.upgrades.includes(props.item.kind)}>
      <Button default size="small" onClick={() => props.upgradeItem(props.item, props.state)}>
        <Upgrade width={16} height={16} />
      </Button>
    </Show>
  </>
)
