// @flow
import React from 'react';
import Button from 'component/button';
import Icon from 'component/common/icon';
import ClaimList from 'component/claimList';
import * as ICONS from 'constants/icons';
import { useIsLargeScreen } from 'effects/use-screensize';

// TODO: recsysFyp will be moved into 'RecSys', so the redux import in a jsx
// violation is just temporary.
import { recsysFyp } from 'redux/actions/search';

// ****************************************************************************
// SectionHeader (TODO: DRY)
// ****************************************************************************

type SectionHeaderProps = {
  title: string,
  navigate?: string,
  icon?: string,
  help?: string,
};

const SectionHeader = ({ title, navigate = '/', icon = '', help }: SectionHeaderProps) => {
  return (
    <h1 className="claim-grid__header">
      <Button navigate={navigate} button="link">
        <Icon className="claim-grid__header-icon" sectionIcon icon={icon} size={20} />
        <span className="claim-grid__title">{title}</span>
        {help}
      </Button>
    </h1>
  );
};

// ****************************************************************************
// RecommendedPersonal
// ****************************************************************************

const VIEW = { ALL_VISIBLE: 0, COLLAPSED: 1, EXPANDED: 2 };

function getSuitablePageSizeForScreen(defaultSize, isLargeScreen) {
  return isLargeScreen ? defaultSize * (3 / 2) : defaultSize;
}

type Props = {
  onLoad: (displayed: boolean) => void,
  // --- redux ---
  userId: ?string,
  personalRecommendations: { gid: string, uris: Array<string> },
  doFetchPersonalRecommendations: () => void,
};

export default function RecommendedPersonal(props: Props) {
  const { onLoad, userId, personalRecommendations, doFetchPersonalRecommendations } = props;
  const [markedGid, setMarkedGid] = React.useState('');
  const [view, setView] = React.useState(VIEW.ALL_VISIBLE);
  const isLargeScreen = useIsLargeScreen();

  const count = personalRecommendations.uris.length;
  const countCollapsed = getSuitablePageSizeForScreen(8, isLargeScreen);
  const finalCount = view === VIEW.ALL_VISIBLE ? count : view === VIEW.COLLAPSED ? countCollapsed : count;

  React.useEffect(() => {
    onLoad(count > 0);
  }, [count, onLoad]);

  // Resolve the view state:
  React.useEffect(() => {
    let newView;
    if (count <= countCollapsed) {
      newView = VIEW.ALL_VISIBLE;
    } else {
      if (view === VIEW.ALL_VISIBLE) {
        newView = VIEW.COLLAPSED;
      }
    }

    if (newView && newView !== view) {
      setView(newView);
    }
  }, [count, countCollapsed, view, setView]);

  // Mark recommendations when rendered:
  React.useEffect(() => {
    if (userId && markedGid !== personalRecommendations.gid) {
      setMarkedGid(personalRecommendations.gid);
      recsysFyp.markPersonalRecommendations(userId, personalRecommendations.gid);
    }
  }, [userId, markedGid, personalRecommendations.gid]);

  // Fetch on mount:
  React.useEffect(() => {
    doFetchPersonalRecommendations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return count > 0 ? (
    <>
      <SectionHeader title={__('Recommended For You')} icon={ICONS.WEB} />
      <ClaimList
        tileLayout
        uris={personalRecommendations.uris.slice(0, finalCount)}
        fypId={personalRecommendations.gid}
      />

      {view !== VIEW.ALL_VISIBLE && (
        <div className="livestream-list--view-more">
          <Button
            label={view === VIEW.COLLAPSED ? __('Show more') : __('Show less')}
            button="link"
            iconRight={ICONS.DOWN}
            className="claim-grid__title--secondary"
            onClick={() => {
              if (view === VIEW.COLLAPSED) {
                setView(VIEW.EXPANDED);
              } else {
                setView(VIEW.COLLAPSED);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          />
        </div>
      )}
    </>
  ) : null;
}
