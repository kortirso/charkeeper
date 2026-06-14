import { createSignal, createEffect } from 'solid-js';

import { ErrorWrapper } from '../../../../components';
// import { localize } from '../../../../helpers';

// const TRANSLATION = {
//   en: {
//   },
//   ru: {
//   },
//   es: {
//   }
// }

export const Cthulhu7Equipment = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    setLastActiveCharacterId(character().id);
  });

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Cthulhu7Equipment' }}>
    </ErrorWrapper>
  );
}
