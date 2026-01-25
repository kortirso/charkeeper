import { createSignal, createEffect, Show, Switch, Match, batch } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { CampaignDnd5, CampaignPathfinder2, CampaignDaggerheart, CampaignDc20 } from '../../pages';
import { PageHeader, IconButton } from '../../components';
import { Arrow } from '../../assets';
import { useAppState, useAppAlert } from '../../context';
import { fetchCampaignRequest } from '../../requests/fetchCampaignRequest';
import { removeCampaignJoinRequest } from '../../requests/removeCampaignJoinRequest';

export const CampaignTab = (props) => {
  const size = createWindowSize();

  const [campaign, setCampaign] = createSignal({});
  const [characters, setCharacters] = createSignal([]);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();

  createEffect(() => {
    if (appState.activePageParams.id === campaign().id) return;

    const fetchCampaign = async () => await fetchCampaignRequest(appState.accessToken, appState.activePageParams.id);

    Promise.all([fetchCampaign()]).then(
      ([campaignData]) => {
        batch(() => {
          setCampaign(campaignData.campaign);
          setCharacters(campaignData.campaign.characters);
        });
      }
    );
  });

  const deleteCharacter = async (characterId) => {
    const result = await removeCampaignJoinRequest(appState.accessToken, campaign().id, characterId);

    if (result.errors_list === undefined) setCharacters(characters().filter((item) => item.id !== characterId));
    else renderAlerts(result.errors_list);
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
          <p>{campaign().name}</p>
        </PageHeader>
      </Show>
      <Switch>
        <Match when={campaign().provider === 'dnd5' || campaign().provider === 'dnd2024'}>
          <CampaignDnd5 campaign={campaign()} characters={characters()} onDeleteCharacter={deleteCharacter} />
        </Match>
        <Match when={campaign().provider === 'pathfinder2'}>
          <CampaignPathfinder2 campaign={campaign()} characters={characters()} onDeleteCharacter={deleteCharacter} />
        </Match>
        <Match when={campaign().provider === 'daggerheart'}>
          <CampaignDaggerheart campaign={campaign()} characters={characters()} onDeleteCharacter={deleteCharacter} />
        </Match>
        <Match when={campaign().provider === 'dc20'}>
          <CampaignDc20 campaign={campaign()} characters={characters()} onDeleteCharacter={deleteCharacter} />
        </Match>
      </Switch>
    </>
  );
}
