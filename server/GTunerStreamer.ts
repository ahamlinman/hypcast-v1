/* eslint-disable no-console */

import { EventEmitter } from 'events';
import { Pipeline } from 'gstreamer-superficial';

export default class GTunerStreamer extends EventEmitter {
  public readonly channelsPath: string;
  private pipeline: typeof Pipeline;

  constructor({ channelsPath = 'channels.conf' } = {}) {
    super();

    this.channelsPath = channelsPath;

    this.pipeline = this.createPipeline();
    this.pipeline.pollBus((msg: any) => { console.log('gst:', msg); });
  }

  private createPipeline() {
    const queue = 'queue leaky=downstream max-size-time=2500000000 max-size-buffers=0 max-size-bytes=0';

    return new Pipeline(`
    hlssink2 name=hls target-duration=2 playlist-length=30

    dvbsrc delsys=atsc modulation=8vsb frequency=617028615
      ! tsdemux program-number=3 name=dmx

    dmx.
      ! ${queue}
      ! decodebin
      ! x264enc
      ! hls.video

    dmx.
      ! ${queue}
      ! decodebin
      ! audioconvert
      ! faac
      ! hls.audio
    `);
  }

  tune(_: string) {
    console.log('tune');
    this.pipeline.play();
  }

  stop() {
    console.log('stop');
    this.pipeline.stop();
  }
}
