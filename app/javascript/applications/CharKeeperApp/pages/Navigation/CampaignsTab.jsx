import { createSignal, createEffect, createMemo, For, Switch, Match, Show, batch } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { CampaignsListItem } from '../../pages';
import { CharacterNavigation, createModal, PageHeader, Select, Input, Button } from '../../components';
import { Plus } from '../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { fetchCampaignsRequest } from '../../requests/fetchCampaignsRequest';
import { createCampaignRequest } from '../../requests/createCampaignRequest';
import { removeCampaignRequest } from '../../requests/removeCampaignRequest';
import { fetchCampaignJoinRequest } from '../../requests/fetchCampaignJoinRequest';
import { localize } from '../../helpers';

const TRANSLATION = {
  en: {
    askDm: 'Ask your DM for campaign ID'
  },
  ru: {
    askDm: 'Узнайте у мастера ID кампании'
  }
}

export const CampaignsTab = () => {
  const [currentTab, setCurrentTab] = createSignal('campaigns');
  const [activeFilter, setActiveFilter] = createSignal('allFilter');
  const [campaigns, setCampaigns] = createSignal(undefined);
  const [findCampaignId, setFindCampaignId] = createSignal('');
  const [deletingCampaignId, setDeletingCampaignId] = createSignal(undefined);
  const [campaignForm, setCampaignForm] = createStore({
    name: '',
    provider: ''
  });

  const { Modal, openModal, closeModal } = createModal();
  const [appState, { navigate }] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (campaigns() !== undefined) return;

    const fetchCampaigns = async () => await fetchCampaignsRequest(appState.accessToken);

    Promise.all([fetchCampaigns()]).then(
      ([campaignsData]) => {
        setCampaigns(campaignsData.campaigns);
      }
    );
  });

  const campaignProviders = createMemo(() => {
    if (campaigns() === undefined) return [];

    const uniqProviders = new Set(campaigns().map((item) => item.provider));
    return [...uniqProviders];
  });

  const filteredCampaigns = createMemo(() => {
    if (campaigns() === undefined) return [];
    if (activeFilter() === 'allFilter') return campaigns();

    return campaigns().filter((item) => item.provider === activeFilter());
  });

  const saveCampaign = async () => {
    const result = await createCampaignRequest(appState.accessToken, { campaign: campaignForm });

    if (result.errors_list === undefined) {
      batch(() => {
        setCampaigns(campaigns().concat(result.campaign));
        setCurrentTab('campaigns');
        setCampaignForm({ name: '', provider: '' });
      });
    } else renderAlerts(result.errors_list);
  }

  const findCampaign = async () => {
    if (findCampaignId() === '') return;
    if (campaigns().find((item) => item.id === findCampaignId())) return;

    const result = await fetchCampaignJoinRequest(appState.accessToken, findCampaignId());

    if (result.errors_list === undefined) setCampaigns(campaigns().concat(result.campaign));
    else renderAlerts(result.errors_list);
  }

  const deleteCampaign = (event, campaignId) => {
    event.stopPropagation();

    batch(() => {
      setDeletingCampaignId(campaignId);
      openModal();
    });
  }

  const confirmCampaignDeleting = async () => {
    const result = await removeCampaignRequest(appState.accessToken, deletingCampaignId());

    if (result.errors_list === undefined) {
      batch(() => {
        setCampaigns(campaigns().filter((item) => item.id !== deletingCampaignId()));
        closeModal();
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <>
      <Switch>
        <Match when={currentTab() === 'newCampaign'}>
          <PageHeader>
            {t('pages.campaignsPage.newTitle')}
          </PageHeader>
        </Match>
        <Match when={currentTab() === 'campaigns'}>
          <PageHeader>
            {t('pages.campaignsPage.title')}
          </PageHeader>
          <Button
            default
            classList='absolute right-4 bottom-4 rounded-full w-12 h-12 z-10'
            onClick={() => setCurrentTab('newCampaign')}
          >
            <Plus />
          </Button>
          <CharacterNavigation
            tabsList={['allFilter'].concat(['dnd5', 'dnd2024', 'pathfinder2', 'daggerheart', 'dc20', 'fate'].filter((item) => campaignProviders().includes(item)))}
            activeTab={activeFilter()}
            setActiveTab={setActiveFilter}
          />
        </Match>
      </Switch>
      <Switch>
        <Match when={currentTab() === 'campaigns'}>
          <div class="flex-1 overflow-y-auto">
            <Show
              when={filteredCampaigns().length > 0}
              fallback={<p class="dark:text-snow p-2">{t('pages.campaignsPage.noCampaigns')}</p>}
            >
              <For each={filteredCampaigns()}>
                {(campaign) =>
                  <CampaignsListItem
                    isActive={campaign.id == appState.activePageParams.id}
                    name={campaign.name}
                    provider={campaign.provider}
                    onClick={() => navigate('campaign', { id: campaign.id })}
                    onDeleteCampaign={(e) => deleteCampaign(e, campaign.id)}
                  />
                }
              </For>
            </Show>
            <div class="w-full flex p-2">
              <Button default size="small" classList="px-2" onClick={findCampaign}>
                {t('find')}
              </Button>
              <Input
                containerClassList="ml-4 flex-1"
                labelText={t('pages.campaignsPage.findCampaignId')}
                placeholder={localize(TRANSLATION, locale()).askDm}
                value={findCampaignId()}
                onInput={(value) => setFindCampaignId(value)}
              />
            </div>
          </div>
        </Match>
        <Match when={currentTab() === 'newCampaign'}>
          <div class="p-4 flex-1 flex flex-col overflow-y-auto">
            <div class="flex-1">
              <Select
                containerClassList="mb-2"
                classList="w-full"
                labelText={t('pages.campaignsPage.provider')}
                items={{ 'dnd5': 'D&D 5', 'dnd2024': 'D&D 2024', 'daggerheart': 'Daggerheart', 'pathfinder2': 'Pathfinder 2', 'fate': 'Fate', 'dc20': 'DC20' }}
                selectedValue={campaignForm.provider}
                onSelect={(value) => setCampaignForm({ ...campaignForm, provider: value })}
              />
              <Input
                containerClassList="mb-2"
                labelText={t('pages.campaignsPage.name')}
                value={campaignForm.name}
                onInput={(value) => setCampaignForm({ ...campaignForm, name: value })}
              />
            </div>
            <div class="flex mt-4 items-center gap-x-4">
              <Button outlined size='default' classList='w-full' onClick={() => setCurrentTab('campaigns')}>
                {t('back')}
              </Button>
              <Button default size='default' classList='w-full' onClick={saveCampaign}>
                {t('save')}
              </Button>
            </div>
          </div>
        </Match>
      </Switch>
      <Modal>
        <p class="mb-3 text-xl">{t('pages.campaignsPage.deleteCampaignTitle')}</p>
        <p class="mb-3">{t('pages.campaignsPage.confirmDeleting')}</p>
        <div class="flex w-full">
          <Button outlined classList='flex-1 mr-2' onClick={closeModal}>{t('cancel')}</Button>
          <Button default classList='flex-1 ml-2' onClick={confirmCampaignDeleting}>{t('delete')}</Button>
        </div>
      </Modal>
    </>
  );
}
