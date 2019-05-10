/* eslint-disable no-console */

import { EventEmitter } from 'events';
import { Pipeline } from 'gstreamer-superficial';

import { TuneData } from '../models/TuneData';
import { createTmpDir } from './StreamerUtils';

export default class GTunerStreamer extends EventEmitter {
  public readonly channelsPath: string;
  public streamPath: undefined | string;
  public state: string;
  public tuneData: undefined | TuneData;

  private pipeline: any;
  private cleanTmp: undefined | (() => void);

  constructor({ channelsPath = 'channels.conf' } = {}) {
    super();
    this.channelsPath = channelsPath;
    this.state = 'inactive';
  }

  private createPipeline(path: string) {
    console.log('path', path);
    const queue = 'queue leaky=downstream max-size-time=2500000000 max-size-buffers=0 max-size-bytes=0';

    return new Pipeline(`
    hlssink2 name=hls target-duration=2 playlist-length=30 playlist-location=${path}/stream.m3u8 location=${path}/segment%05d.ts

    dvbsrc delsys=atsc modulation=8vsb frequency=617028615
      ! tsdemux program-number=3 name=dmx

    dmx.
      ! ${queue}
      ! decodebin
      ! x264enc tune=zerolatency speed-preset=ultrafast
      ! hls.video

    dmx.
      ! ${queue}
      ! decodebin
      ! audioconvert
      ! faac bitrate=256000
      ! hls.audio
    `);
  }

  async tune(data: TuneData) {
    if (data.profile === null) {
      throw new Error('cannot tune with no profile');
    }

    const { dirPath, clean } = await createTmpDir();
    this.streamPath = dirPath;
    this.cleanTmp = clean;

    console.log('tuneData', data);
    this.pipeline = this.createPipeline(dirPath);
    this.pipeline.play();

    this.emit('transition', { fromState: 'inactive', toState: 'active' });
    this.state = 'active';
    this.tuneData = data;
  }

  stop() {
    console.log('stop');
    this.pipeline.stop();
    this.pipeline = undefined;

    if (this.cleanTmp) {
      this.cleanTmp();
      this.cleanTmp = undefined;
    }

    this.streamPath = undefined;
    this.tuneData = undefined;
    this.emit('transition', { fromState: 'active', toState: 'inactive' });
    this.state = 'inactive';
  }
}
