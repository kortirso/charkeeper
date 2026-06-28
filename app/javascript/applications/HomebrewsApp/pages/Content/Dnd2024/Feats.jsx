import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchFeatsRequest, fetchFeatRequest, copyFeatRequest } from '../../../requests_v2/dnd2024/feats';

export const Dnd2024Feats = () => {
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
      provider="dnd2024"
      parentType="Dnd2024::Feat"
      publicationType="feat"
      onFetchRequest={fetchList}
      onShowRequest={fetchFeatRequest}
      onCopyRequest={copyFeatRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
