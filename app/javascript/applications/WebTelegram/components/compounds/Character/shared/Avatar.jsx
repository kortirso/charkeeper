import { createSignal, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Button, Input } from '../../../atoms';

import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

export const Avatar = (props) => {
  const character = () => props.character;

  const [loading, setLoading] = createSignal(false);
  const [selectedFile, setSelectedFile] = createSignal(null);
  const [avatarUrl, setAvatarUrl] = createSignal('');
  const [name, setName] = createSignal(character().name);

  const [appState] = useAppState();
  const [{ renderAlert, renderAlerts, renderNotice }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const handleFileChange = (event) => {
    const target = event.target;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      setSelectedFile(file);
      if (file.size > 1000000) renderAlert(t('alerts.fileSizeLimit'));
    }
  }

  const imageToBase64 = (file) => {
    if (file === null) return;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.replace(/^data:image\/[a-z]+;base64,/, "");
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const updateCharacter = async () => {
    if (selectedFile() && selectedFile().size > 1000000) {
      return renderAlert(t('alerts.fileSizeLimit'));
    }

    setLoading(true);

    let characterFormData = {};
    if (character().name !== name()) {
      characterFormData = { ...characterFormData, name: name() }
    }
    const fileContent = await imageToBase64(selectedFile());
    if (fileContent) {
      const avatarFile = { file_content: fileContent, file_name: selectedFile().name }
      characterFormData = { ...characterFormData, avatar_file: avatarFile }
    }
    if (avatarUrl().length > 0) {
      characterFormData = { ...characterFormData, avatar_url: avatarUrl() }
    }

    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: characterFormData, only_head: true });
    
    if (result.errors === undefined) {
      batch(() => {
        if (character().name !== name()) props.onReplaceCharacter({ name: name() });
        renderNotice(t('alerts.characterIsUpdated'));
        setLoading(false);
      });
    } else {
      batch(() => {
        renderAlerts(result.errors);
        setLoading(false);
      });
    }
  }

  return (
    <div class="white-box p-4 mb-4">
      <div class="mb-4">
        <label class="text-sm/4 font-cascadia-light text-gray-400">{t('newCharacterPage.avatarFile')}</label>
        <input class="block mb-2" type="file" accept="image/jpeg, image/png" onChange={handleFileChange} />
        <Input
          labelText={t('newCharacterPage.avatarUrl')}
          value={avatarUrl()}
          onInput={(value) => setAvatarUrl(value)}
        />
        <label class="text-sm/4 font-cascadia-light text-gray-400">{t('newCharacterPage.avatarTransform')}</label>
      </div>
      <Input
        containerClassList="mb-4"
        labelText={t('newCharacterPage.name')}
        value={name()}
        onInput={(value) => setName(value)}
      />
      <Button default onClick={() => loading() ? null : updateCharacter}>{loading() ? t('saving') : t('save')}</Button>
    </div>
  );
}
