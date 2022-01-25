import { connect } from 'react-redux';
import { doToggleMuteChannel } from 'redux/actions/blocked';
import { selectChannelIsMuted } from 'redux/selectors/blocked';
import ChannelMuteButton from './view';

const select = (state, props) => ({
  isMuted: selectChannelIsMuted(state, props.uri),
});

export default connect(select, {
  doToggleMuteChannel,
})(ChannelMuteButton);
