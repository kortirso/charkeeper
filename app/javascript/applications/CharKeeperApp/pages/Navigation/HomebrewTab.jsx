import * as i18n from '@solid-primitives/i18n';

import { PageHeader } from '../../components';
import { useAppLocale } from '../../context';

export const HomebrewTab = () => {
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  return (
    <>
      <PageHeader>
        {t('homebrewPage.title')}
      </PageHeader>
      <div class="p-4 flex-1 flex flex-col overflow-y-scroll" />
    </>
  );
}
