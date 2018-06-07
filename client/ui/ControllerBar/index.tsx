import * as React from 'react';

import ChannelSelector from './ChannelSelector';
import ProfileSelector, { Profile, ProfileSet } from './ProfileSelector';

export { ProfileSet };

function findKey(obj, value) {
  const target = JSON.stringify(value);

  for (const [k, v] of Object.entries(obj)) {
    if (JSON.stringify(v) === target) {
      return k;
    }
  }
}

interface TuneDataChange {
  channel?: string;
  profile?: Profile;
}

interface TuneData {
  channel: string;
  profile: Profile;
}

export interface TuneDataProps {
  tuneData: TuneData;
  onTuneDataChange: (evt: TuneDataChange) => void;
  onTune: () => void;
  onStop: () => void;
}

interface ControllerBarProps extends TuneDataProps {
  enabled: boolean;

  channels: string[];
  profiles: ProfileSet;
}

export default class ControllerBar extends React.Component<ControllerBarProps, {}> {
  constructor(props) {
    super(props);

    this.handleChannelChanged = this.handleChannelChanged.bind(this);
    this.handleProfileChanged = this.handleProfileChanged.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleStop = this.handleStop.bind(this);
  }

  handleChannelChanged(channel) {
    this.props.onTuneDataChange({ channel });
  }

  handleProfileChanged(profileName) {
    this.props.onTuneDataChange({ profile: this.props.profiles[profileName] });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onTune();
  }

  handleStop(event) {
    event.preventDefault();
    this.props.onStop();
  }

  render() {
    return (
      <form className='tuner form-inline text-center lead' onSubmit={this.handleSubmit}>
        <div className='form-group'>
          <label htmlFor='channel'>Watch</label>
          <ChannelSelector
            enabled={this.props.enabled}
            channels={this.props.channels}
            selected={this.props.tuneData.channel}
            onChange={this.handleChannelChanged} />
        </div>

        <div className='form-group'>
          <label htmlFor='profile'>at</label>
          <ProfileSelector
            enabled={this.props.enabled}
            profiles={this.props.profiles}
            selected={findKey(this.props.profiles, this.props.tuneData.profile)}
            onChange={this.handleProfileChanged} />
          <label htmlFor='profile'>quality</label>
        </div>

        <button type='submit' className='btn btn-default' disabled={!this.props.enabled}>
          <span className='glyphicon glyphicon-play'></span>
        </button>

        <button type='button' className='btn btn-default'
            onClick={this.handleStop} disabled={!this.props.enabled}>
          <span className='glyphicon glyphicon-stop'></span>
        </button>
      </form>
    );
  }
}
