import { createSignal } from 'solid-js';

import { ErrorWrapper, Button } from '../../components';
import { Upgrade } from '../../assets';
import { useAppLocale } from '../../context';
import { localize } from '../../helpers';

const TRANSLATION = {
  en: {
    levelTooltip: "Level up is not revertable, be careful!"
  },
  ru: {
    levelTooltip: 'Повышение уровня необратимо, осторожно!'
  },
  es:{
    levelTooltip: 'Subir de nivel no es reversible, ¡ten cuidado!'
  }
}

export const LevelUp = (props) => {
  const character = () => props.character;

  const [locale] = useAppLocale();

  const [enabled, setEnabled] = createSignal(false);

  const levelUp = () => {
    if (!enabled()) return setEnabled(true);

    props.levelUp();
    setEnabled(false);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'LevelUp' }}>
      <div>
        <div class="flex items-center mb-2">
          <Button default semiDisabled={!enabled()} classList="rounded mr-4" onClick={levelUp}>
            <Upgrade width="24" height="24" />
          </Button>
          {props.children}
        </div>
        <p class="text-sm">{localize(TRANSLATION, locale()).levelTooltip}</p>
      </div>
    </ErrorWrapper>
  );
}
