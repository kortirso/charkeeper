import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchSpellsRequest, fetchSpellRequest } from '../../../requests_v2/pathfinder2/spells';

export const Pathfinder2Spells = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchSpellsRequest(appState.accessToken);

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-2">
      <p>ID - {props.info.id}</p>
      <p
        class="feat-markdown"
        innerHTML={props.info.description} // eslint-disable-line solid/no-innerhtml
      />
    </div>
  );

  return (
    <SharedContent
      provider="pathfinder2"
      parentType="Feat"
      publicationType="spell"
      onFetchRequest={fetchList}
      onShowRequest={fetchSpellRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
