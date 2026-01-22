import { createSignal, createEffect, Show } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';
import * as i18n from '@solid-primitives/i18n';

import { PageHeader, IconButton } from '../../components';
import { Arrow } from '../../assets';
import { useAppState, useAppAlert, useAppLocale } from '../../context';
import { fetchCharacterViewRequest } from '../../requests/fetchCharacterViewRequest';
import { copyToClipboard } from '../../helpers';

export const CharacterView = (props) => {
  const size = createWindowSize();
  const [characterId, setCharacterId] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderNotice }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (appState.activePageParams.id === characterId()) return;

    const fetchCharacterView = async () => await fetchCharacterViewRequest(appState.accessToken, appState.activePageParams.id);

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
      const page = await pdfDoc.getPage(1);

      const scale = 3;
      const viewport = page.getViewport({ scale });

      // Get the canvas element and set its size based on the PDF page.
      const canvas = document.getElementById('pdf');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render the page into the canvas.
      const renderContext = { canvasContext: context, viewport: viewport };
      await page.render(renderContext).promise;
    }).catch(function(error) {
      console.error('Error loading PDF:', error);
    });
  }

  const copy = () => {
    copyToClipboard(`https://${appState.rootHost}/characters/${appState.activePageParams.id}.pdf`);
    renderNotice(t('alerts.copied'));
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
        />
      </Show>
      <div class="flex-1 flex flex-col overflow-y-scroll relative">
        <canvas id="pdf" />
        <div class="absolute top-4 left-4">
          <a id="pdfDownload" class="rounded bg-blue-400 text-snow dark:bg-fuzzy-red px-2 py-1 mr-2">
            {t('charactersPage.download')}
          </a>
          <span class="rounded bg-blue-400 text-snow dark:bg-fuzzy-red px-2 py-1 cursor-pointer" onClick={copy}>
            {t('charactersPage.sharePdf')}
          </span>
        </div>
      </div>
    </>
  );
}
