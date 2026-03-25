import { createSignal, createEffect, Show } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { PageHeader, IconButton } from '../../components';
import { Arrow } from '../../assets';
import { useAppState, useAppAlert, useAppLocale } from '../../context';
import { fetchCharacterViewRequest } from '../../requests/fetchCharacterViewRequest';
import { localize, copyToClipboard } from '../../helpers';

const TRANSLATION = {
  en: {
    download: 'Download',
    sharePdf: 'Share PDF link',
    back: 'Close',
    copied: 'Copied, you can share copied value',
    minimize: 'Minimize',
    maximize: 'Maximize'
  },
  ru: {
    download: 'Скачать',
    sharePdf: 'Поделиться PDF ссылкой',
    back: 'Закрыть',
    copied: 'Скопировано, можете передать это значение',
    minimize: 'Свернуть',
    maximize: 'Развернуть'
  },
  es: {
    download: 'Descargar',
    sharePdf: 'Compartir enlace del PDF',
    back: 'Cerca',
    copied: 'Copiado, puedes compartir el valor copiado',
    minimize: 'Minimize',
    maximize: 'Maximize'
  }
}

export const CharacterView = (props) => {
  const size = createWindowSize();
  const [characterId, setCharacterId] = createSignal(undefined);

  const [appState, { navigate, changeUserInfo }] = useAppState();
  const [{ renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (appState.activePageParams.id === characterId()) return;

    const fetchCharacterView = async () => await fetchCharacterViewRequest(appState.accessToken, appState.activePageParams.id, locale());

    Promise.all([fetchCharacterView()]).then(
      ([characterViewData]) => {
        renderCharacterView(characterViewData);
        renderDownloadLink(characterViewData);
        setCharacterId(appState.activePageParams.id);
      }
    );
  });

  const renderDownloadLink = (characterViewData) => {
    const a = document.getElementById('pdfDownload');
    a.href = characterViewData;
    a.download = 'characterSheet.pdf';
  }

  const renderCharacterView = (characterViewData) => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.mjs'; // eslint-disable-line no-undef
    pdfjsLib.getDocument(characterViewData).promise.then(async function(pdfDoc) { // eslint-disable-line no-undef
      const container = document.getElementById('pdf');
      for (let pageNum = 1; pageNum <= pdfDoc._pdfInfo.numPages; pageNum++) {
        if (pageNum > 1) {
          const splitter = document.createElement('div');
          splitter.className = 'pdf_splitter';
          container.appendChild(splitter);
        }
        const canvas = document.createElement('canvas');
        canvas.id = `page-${pageNum}`;
        canvas.style.display = 'block';
        container.appendChild(canvas);

        const page = await pdfDoc.getPage(pageNum);
        const scale = 3;
        const viewport = page.getViewport({ scale });

        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = { canvasContext: context, viewport: viewport };
        await page.render(renderContext).promise;
      }
    }).catch(function(error) {
      console.error('Error loading PDF:', error);
    });
  }

  const copy = () => {
    copyToClipboard(`https://${appState.rootHost}/${locale()}/characters/${appState.activePageParams.id}.pdf`);
    renderNotice(localize(TRANSLATION, locale()).copied);
  }

  const minimize = () => {
    changeUserInfo({ showNavigation: appState.showNavigation === 'show' ? 'hide' : 'show' });
  }

  return (
    <>
      <Show when={size.width < 768}>
        <PageHeader
          leftContent={
            <IconButton onClick={props.onNavigate}><Arrow back width={20} height={20} /></IconButton>
          }
        />
      </Show>
      <div class="flex-1 flex flex-col overflow-y-scroll relative">
        <div id="pdf" />
        <div
          classList={{
            'left-100!': size.width >= 768 && (appState.activePage !== 'characterView' || appState.showNavigation === 'show')
          }}
          class="pdf-buttons"
        >
          <div class="flex flex-col sm:flex-row items-start gap-4">
            <a class="pdf-button" onClick={minimize}>
              {appState.showNavigation === 'show' ? localize(TRANSLATION, locale()).maximize : localize(TRANSLATION, locale()).minimize}
            </a>
            <a id="pdfDownload" class="pdf-button">{localize(TRANSLATION, locale()).download}</a>
            <a class="pdf-button" onClick={copy}>{localize(TRANSLATION, locale()).sharePdf}</a>
          </div>
          <Show when={appState.showNavigation !== 'show'}>
            <a class="pdf-button" onClick={() => navigate(null, {})}>{localize(TRANSLATION, locale()).back}</a>
          </Show>
        </div>
      </div>
    </>
  );
}
