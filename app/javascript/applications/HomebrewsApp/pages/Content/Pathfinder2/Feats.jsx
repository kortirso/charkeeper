import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchFeatsRequest, fetchFeatRequest } from '../../../requests_v2/pathfinder2/feats';

export const Pathfinder2Feats = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchFeatsRequest(appState.accessToken);

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
      publicationType="feat"
      onFetchRequest={fetchList}
      onShowRequest={fetchFeatRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
