/* eslint-disable no-console */

import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import { Pipeline } from 'gstreamer-superficial';

import { TuneData, Profile } from '../models/TuneData';
import { createTmpDir, createNewFile } from './StreamerUtils';

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

  private createPipeline(outDir: string, profile: Profile) {
    console.log('outDir', outDir);
    const queue = 'queue leaky=downstream max-size-time=2500000000 max-size-buffers=0 max-size-bytes=0';

    return new Pipeline(`
    hlssink2 name=hls target-duration=3 playlist-length=30 playlist-location=${outDir}/stream.m3u8 location=${outDir}/segment%05d.ts

    dvbsrc delsys=atsc modulation=8vsb frequency=617028615
      ! tsdemux program-number=3 name=dmx

    dmx.
      ! ${queue}
      ! decodebin
      ! x264enc tune=zerolatency speed-preset=${profile.videoPreset} bitrate=${profile.videoKbitSec}
      ! hls.video

    dmx.
      ! ${queue}
      ! decodebin
      ! audioconvert
      ! faac bitrate=${profile.audioKbitSec * 1000}
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

    const playlistPath = path.join(dirPath, 'stream.m3u8');
    createNewFile(playlistPath);

    const watcher = fs.watch(playlistPath).once('change', () => {
      watcher.close();
      this.emit('transition', { fromState: 'inactive', toState: 'active' });
      this.state = 'active';
    });

    console.log('tuneData', data);
    this.tuneData = data;
    this.pipeline = this.createPipeline(dirPath, data.profile);
    this.pipeline.play();

    this.emit('transition', { fromState: 'inactive', toState: 'buffering' });
    this.state = 'buffering';
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
