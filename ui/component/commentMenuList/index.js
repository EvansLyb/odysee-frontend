import { connect } from 'react-redux';
import { makeSelectChannelPermUrlForClaimUri, makeSelectClaimIsMine, makeSelectClaimForUri } from 'lbry-redux';
import { doCommentPin, doCommentModAddDelegate } from 'redux/actions/comments';
import { doChannelMute } from 'redux/actions/blocked';
// import { doSetActiveChannel } from 'redux/actions/app';
import { doOpenModal } from 'redux/actions/app';
import { doSetPlayingUri } from 'redux/actions/content';
import { selectActiveChannelClaim } from 'redux/selectors/app';
import { selectPlayingUri } from 'redux/selectors/content';

import CommentMenuList from './view';

const select = (state, props) => ({
  claim: makeSelectClaimForUri(props.uri)(state),
  claimIsMine: makeSelectClaimIsMine(props.uri)(state),
  contentChannelPermanentUrl: makeSelectChannelPermUrlForClaimUri(props.uri)(state),
  activeChannelClaim: selectActiveChannelClaim(state),
  playingUri: selectPlayingUri(state),
});

const perform = (dispatch) => ({
  openModal: (modal, props) => dispatch(doOpenModal(modal, props)),
  clearPlayingUri: () => dispatch(doSetPlayingUri({ uri: null })),
  muteChannel: (channelUri) => dispatch(doChannelMute(channelUri)),
  pinComment: (commentId, claimId, remove) => dispatch(doCommentPin(commentId, claimId, remove)),
  //   setActiveChannel: channelId => dispatch(doSetActiveChannel(channelId)),
  commentModAddDelegate: (modChanId, modChanName, creatorChannelClaim) =>
    dispatch(doCommentModAddDelegate(modChanId, modChanName, creatorChannelClaim, true)),
});

export default connect(select, perform)(CommentMenuList);
