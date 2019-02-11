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

  tunerOpts: any;
  streamerOpts: any;
  __machina__: Machina.ClientMeta | undefined;

  constructor(tuner: TunerDevice, streamer: DeviceStreamer) {
    super();

    this.tuner = tuner;
    this.streamer = streamer;
  }

  get state() {
    if (!this.__machina__) {
      return Fsm.initialState;
    }

    return this.__machina__.state;
  }

  start(tunerOpts: any, streamerOpts: any) {
    this.tunerOpts = tunerOpts;
    this.streamerOpts = streamerOpts;
    Fsm.handle(this, 'start');
  }

  stop() {
    Fsm.handle(this, 'stop');
  }

  startTuner() {
    this.tuner.start(this.tunerOpts);
  }

  stopTuner() {
    this.tuner.stop();
  }

  startStreamer() {
    this.streamer.start(this.tuner.streamDevice, this.streamerOpts);
  }

  stopStreamer() {
    this.streamer.stop();
  }
}
