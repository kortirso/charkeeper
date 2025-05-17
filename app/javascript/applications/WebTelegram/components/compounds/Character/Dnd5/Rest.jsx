import * as i18n from '@solid-primitives/i18n';

import { Button } from '../../../atoms';

import { useAppLocale } from '../../../../context';

export const Dnd5Rest = (props) => {
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  return (
    <div class="white-box p-4">
      <p class="font-cascadia-light mb-4">{t('character.shortRestDescription')}</p>
      <p class="font-cascadia-light mb-4">{t('character.longRestDescription')}</p>
      <div class="flex justify-center items-center">
        <Button default textable classList="flex-1 mr-2" onClick={() => props.onRestCharacter({ type: 'short_rest' })}>
          <span class="font-cascadia-light">{t('character.shortRest')}</span>
        </Button>
        <Button default textable classList="flex-1 ml-2" onClick={() => props.onRestCharacter({ type: 'long_rest' })}>
          <span class="font-cascadia-light">{t('character.longRest')}</span>
        </Button>
      </div>
    </div>
  );
}
