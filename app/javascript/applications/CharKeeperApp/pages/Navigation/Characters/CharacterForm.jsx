import * as i18n from '@solid-primitives/i18n';

import { Button } from '../../../components';
import { useAppLocale } from '../../../context';

export const CharacterForm = (props) => {
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  return (
    <>
      <div class="flex-1">
        <div class="mb-8">
          {props.children}
        </div>
      </div>
      <div class="flex mt-4 gap-x-4">
        <Button
          outlined
          classList="flex-1"
          onClick={() => props.loading() ? null : props.setCurrentTab('characters')}
        >
          {t('back')}
        </Button>
        <Button
          default
          classList="flex-1"
          onClick={() => props.loading() ? null : props.onSaveCharacter()}
        >
          {props.loading() ? t('saving') : t('save')}
        </Button>
      </div>
    </>
  );
}
