import { Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { PageHeader, IconButton, Button, createModal } from '../../components';
import { Arrow } from '../../assets';
import { useAppState, useAppLocale } from '../../context';
import { removeProfileRequest } from '../../requests/removeProfileRequest';

export const ProfileDeleteTab = (props) => {
  const size = createWindowSize();

  const { Modal, openModal, closeModal } = createModal();
  const [appState, { setAccessToken }] = useAppState();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const confirmProfileDeleting = async () => {
    await removeProfileRequest(appState.accessToken);

    setAccessToken(null);
    window.location = '/';
  }

  return (
    <>
      <Show when={size.width < 768}>
        <PageHeader
          leftContent={
            <IconButton onClick={props.onNavigate}>
              <Arrow back width={20} height={20} />
            </IconButton>
          }
        >
          <p>{t('pages.settingsPage.profileDeleting')}</p>
        </PageHeader>
      </Show>
      <div class="p-4 flex-1 flex flex-col overflow-y-scroll">
        <Button default textable onClick={openModal}>{t('delete')}</Button>
      </div>
      <Modal>
        <p class="mb-3 text-xl">{t('pages.settingsPage.profileDeleting')}</p>
        <p class="mb-2">{t('pages.settingsPage.deleteProfileConfirm1')}</p>
        <p class="mb-3">{t('pages.settingsPage.deleteProfileConfirm2')}</p>
        <div class="flex w-full">
          <Button outlined classList='flex-1 mr-2' onClick={closeModal}>{t('cancel')}</Button>
          <Button default classList='flex-1 ml-2' onClick={confirmProfileDeleting}>{t('delete')}</Button>
        </div>
      </Modal>
    </>
  );
}
