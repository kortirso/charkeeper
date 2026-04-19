import { createMemo, For, Show } from 'solid-js';

import { Button } from '../../components';
import { Hands, Equipment, Backpack, Storage, Drink, Upgrade } from '../../assets';

export const ItemsTableItem = (props) => {
  const iconSize = createMemo(() => props.size === 'medium' ? 24 : 16);

  return (
    <>
      <For each={props.forCampaign ? [
          { state: 'hidden', Icon: Storage }, { state: 'shared', Icon: Storage }
        ] : [
          { state: 'hands', Icon: Hands }, { state: 'equipment', Icon: Equipment },
          { state: 'backpack', Icon: Backpack }, { state: 'storage', Icon: Storage }
        ]}>
        {({ state, Icon }) =>
          <Show when={props.state !== state}>
            <Button default size={props.size} onClick={() => props.onMoveCharacterItem(props.item, props.state)}>
              <Icon width={iconSize()} height={iconSize()} />
            </Button>
          </Show>
        }
      </For>
      <Show when={props.forCampaign}>
        <Button default size={props.size} onClick={() => props.onSendCampaignItem(props.item, props.state)}>
          <Hands width={iconSize()} height={iconSize()} />
        </Button>
      </Show>
      <Show when={!props.forCampaign}>
        <Show when={props.item.kind === 'consumables' && props.item.bonuses.length > 0}>
          <Button default size={props.size} onClick={() => props.onConsumeItem(props.item, props.state)}>
            <Drink width={iconSize()} height={iconSize()} />
          </Button>
        </Show>
        <Show when={(props.item.kind === 'consumables' || props.item.kind === 'potion') && props.item.info.consume}>
          <Button default size={props.size} onClick={() => props.onConsumeCharacterItem(props.item, props.state)}>
            <Drink width={iconSize()} height={iconSize()} />
          </Button>
        </Show>
        <Show when={props.upgrades && props.upgrades.includes(props.item.kind)}>
          <Button default size={props.size} onClick={() => props.upgradeItem(props.item, props.state)}>
            <Upgrade width={iconSize()} height={iconSize()} />
          </Button>
        </Show>
      </Show>
    </>
  );
}
