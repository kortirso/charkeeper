import { Show } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { PageHeader, IconButton, Button, createModal } from '../../components';
import { Arrow } from '../../assets';
import { useAppState, useAppLocale } from '../../context';
import { removeProfileRequest } from '../../requests/removeProfileRequest';
import { localize } from '../../helpers';

const TRANSLATION = {
  en: {
    profileDeleting: 'Deleting profile',
    delete: 'Delete',
    deleteProfileConfirm1: 'Are you sure you want to remove your profile?',
    deleteProfileConfirm2: 'This action is not revertable, add data will be removed.',
    cancel: 'Cancel'
  },
  ru: {
    profileDeleting: 'Удаление профиля',
    delete: 'Удалить',
    deleteProfileConfirm1: 'Вы точно хотите удалить свой профиль?',
    deleteProfileConfirm2: 'Это действие нельзя отменить, все данные будут удалены.',
    cancel: 'Отменить'
  },
  es: {
    profileDeleting: 'Borrando perfil',
    delete: 'Borrar',
    deleteProfileConfirm1: '¿Estás seguro de que deseas eliminar tu perfil?',
    deleteProfileConfirm2: 'Esta acción no es reversible, los datos añadidos se eliminarán.',
    cancel: 'Cancelar'
  }
}

export const ProfileDeleteTab = (props) => {
  const size = createWindowSize();

  const { Modal, openModal, closeModal } = createModal();
  const [appState, { setAccessToken }] = useAppState();
  const [locale] = useAppLocale();

  const confirmProfileDeleting = async () => {
    await removeProfileRequest(appState.accessToken);

    setAccessToken(null);
    window.location.href = '/';
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
          <p>{localize(TRANSLATION, locale()).profileDeleting}</p>
        </PageHeader>
      </Show>
      <div class="p-4 flex-1 flex flex-col overflow-y-auto">
        <Button default textable onClick={openModal}>{localize(TRANSLATION, locale()).delete}</Button>
      </div>
      <Modal>
        <p class="mb-3 text-xl">{localize(TRANSLATION, locale()).profileDeleting}</p>
        <p class="mb-2">{localize(TRANSLATION, locale()).deleteProfileConfirm1}</p>
        <p class="mb-3">{localize(TRANSLATION, locale()).deleteProfileConfirm2}</p>
        <div class="flex w-full">
          <Button outlined classList='flex-1 mr-2' onClick={closeModal}>{localize(TRANSLATION, locale()).cancel}</Button>
          <Button default classList='flex-1 ml-2' onClick={confirmProfileDeleting}>{localize(TRANSLATION, locale()).delete}</Button>
        </div>
      </Modal>
    </>
  );
}
