import { Label } from '../../components';
import { useAppLocale, useAppAlert } from '../../context';
import { localize } from '../../helpers';

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
  },
  es: {
    fileSizeLimit: 'El tamaño del archivo debe ser menor a 1 MB',
    avatarFile: 'Selecciona el archivo del avatar',
    avatarUrl: 'o pega el enlace a la imagen',
    avatarTransform: 'La imagen se convertirá a un formato cuadrado'
  }
}

export const AvatarInput = (props) => {
  const [{ renderAlert }] = useAppAlert();
  const [locale] = useAppLocale();

  const handleFileChange = (event) => {
    const target = event.target;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      if (file.size > 1000000) return renderAlert(localize(TRANSLATION, locale()).fileSizeLimit);

      props.onSelectedFile(file);
    }
  }

  return (
    <>
      <Label labelText={localize(TRANSLATION, locale()).avatarFile} />
      <input class="block mb-2 dark:text-gray-200" type="file" accept="image/jpeg, image/png" onChange={handleFileChange} />
      <Label labelText={localize(TRANSLATION, locale()).avatarTransform} />
    </>
  );
}
