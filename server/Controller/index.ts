import * as Machina from 'machina';
import { EventEmitter } from 'events';

import Fsm from './Fsm';

interface TunerDevice extends EventEmitter {
  readonly streamDevice: any;
  start(options: any): void;
  stop(): void;
}

interface DeviceStreamer extends EventEmitter {
  start(device: any, options: any): void;
  stop(): void;
}

export default class Controller extends EventEmitter {
  readonly tuner: TunerDevice;
  readonly streamer: DeviceStreamer;
  readonly state: string = 'idle';

  constructor(tuner: TunerDevice, streamer: DeviceStreamer) {
    super();

    this.tuner = tuner;
    this.streamer = streamer;
  }

  start(tunerOpts: any, streamerOpts: any) {
  }

  stop() {
  }
}
