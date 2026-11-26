import { Show } from 'solid-js';

import { Avatar } from '../../../assets';

export const CharacterAvatar = (props) => {
  return (
    <div class="character-avatar">
      <Show when={props.avatar} fallback={<Avatar width={64} height={64} />}>
        <img src={props.avatar} class="collection-item-avatar" />
      </Show>
    </div>
  );
}
