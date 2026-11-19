import { Switch, Match } from 'solid-js';

import {
  DaggerheartEquipment, Pathfinder2Equipment, NimbleEquipment, Dnd5Equipment, Dc20Equipment, CosmereEquipment
} from '../../../pages';
import { ErrorWrapper } from '../../../components';

export const CampaignItems = (props) => {
  const campaign = () => props.campaign;

  return (
    <ErrorWrapper payload={{ campaign_id: campaign().id, key: 'CampaignItems' }}>
      <Switch>
        <Match when={campaign().provider === 'dnd5' || campaign().provider === 'dnd2024'}>
          <Dnd5Equipment
            forCampaign
            withWeight
            withPrice
            character={campaign()}
            characters={props.characters}
            onReloadCharacter={() => console.log('Equipment refresh')}
          />
        </Match>
        <Match when={campaign().provider === 'daggerheart'}>
          <DaggerheartEquipment
            forCampaign
            character={campaign()}
            characters={props.characters}
            onReloadCharacter={() => console.log('Equipment refresh')}
          />
        </Match>
        <Match when={campaign().provider === 'dc20'}>
          <Dc20Equipment
            forCampaign
            character={campaign()}
            characters={props.characters}
            onReloadCharacter={() => console.log('Equipment refresh')}
          />
        </Match>
        <Match when={campaign().provider === 'pathfinder2'}>
          <Pathfinder2Equipment
            forCampaign
            withWeight
            withPrice
            character={campaign()}
            characters={props.characters}
            onReloadCharacter={() => console.log('Equipment refresh')}
          />
        </Match>
        <Match when={campaign().provider === 'nimble'}>
          <NimbleEquipment
            forCampaign
            character={campaign()}
            characters={props.characters}
            onReloadCharacter={() => console.log('Equipment refresh')}
          />
        </Match>
        <Match when={campaign().provider === 'cosmere'}>
          <CosmereEquipment
            forCampaign
            character={campaign()}
            characters={props.characters}
            onReloadCharacter={() => console.log('Equipment refresh')}
          />
        </Match>
      </Switch>
    </ErrorWrapper>
  );
}
