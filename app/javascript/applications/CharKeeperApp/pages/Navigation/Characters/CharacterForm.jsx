import { createSignal } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Input, Button, Label } from '../../../components';
import { useAppLocale, useAppAlert } from '../../../context';

const TRANSLATION = {
  en: {
    fileSizeLimit: 'File size should be less than 1 MB',
    avatarFile: 'Select avatar file',
    avatarUrl: 'or paste link to image',
    avatarTransform: 'Image will be converted to square format'
  },
  ru: {
    fileSizeLimit: 'Размер файла должен быть меньше 1 МБ',
    avatarFile: 'Выберите файл аватара',
    avatarUrl: 'или укажите ссылку на изображение',
    avatarTransform: 'Изображение будет конфертировано в квадратный формат'
  }
}

export const CharacterForm = (props) => {
  const [selectedFile, setSelectedFile] = createSignal(null);
  const [avatarUrl, setAvatarUrl] = createSignal('');

  const [locale, dict] = useAppLocale();
  const [{ renderAlert }] = useAppAlert();

  const t = i18n.translator(dict);

  const handleFileChange = (event) => {
    const target = event.target;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      if (file.size > 1000000) return renderAlert(TRANSLATION[locale()].fileSizeLimit);

      setSelectedFile(file);      
    }
  }

  return (
    <>
      <div class="flex-1">
        <div class="mb-8">
          {props.children}
        </div>
        <Label labelText={TRANSLATION[locale()].avatarFile} />
        <input class="block mb-2 dark:text-gray-200" type="file" accept="image/jpeg, image/png" onChange={handleFileChange} />
        <Input
          labelText={TRANSLATION[locale()].avatarUrl}
          value={avatarUrl()}
          onInput={(value) => setAvatarUrl(value)}
        />
        <Label labelText={TRANSLATION[locale()].avatarTransform} />
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
          onClick={() => props.loading() ? null : props.onSaveCharacter(selectedFile(), avatarUrl())}
        >
          {props.loading() ? t('saving') : t('save')}
        </Button>
      </div>
    </>
  );
}
