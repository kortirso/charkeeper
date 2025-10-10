import { createSignal } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Input, Button, Label } from '../../../components';
import { useAppLocale, useAppAlert } from '../../../context';

export const CharacterForm = (props) => {
  const [selectedFile, setSelectedFile] = createSignal(null);
  const [avatarUrl, setAvatarUrl] = createSignal('');

  const [, dict] = useAppLocale();
  const [{ renderAlert }] = useAppAlert();

  const t = i18n.translator(dict);

  const handleFileChange = (event) => {
    const target = event.target;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      setSelectedFile(file);
      if (file.size > 1000000) renderAlert(t('alerts.fileSizeLimit'));
    }
  }

  return (
    <>
      <div class="flex-1">
        <div class="mb-8">
          {props.children}
        </div>
        <Label labelText={t('newCharacterPage.avatarFile')} />
        <input class="block mb-2 dark:text-gray-200" type="file" accept="image/jpeg, image/png" onChange={handleFileChange} />
        <Input
          labelText={t('newCharacterPage.avatarUrl')}
          value={avatarUrl()}
          onInput={(value) => setAvatarUrl(value)}
        />
        <Label labelText={t('newCharacterPage.avatarTransform')} />
      </div>
      <div class="flex mt-4">
        <Button
          outlined
          size='default'
          classList='w-full mr-2'
          onClick={() => props.loading() ? null : props.setCurrentTab('characters')}
        >
          {t('back')}
        </Button>
        <Button
          default
          size='default'
          classList='w-full ml-2'
          onClick={() => props.loading() ? null : props.onSaveCharacter(selectedFile(), avatarUrl())}
        >
          {props.loading() ? t('saving') : t('save')}
        </Button>
      </div>
    </>
  );
}
