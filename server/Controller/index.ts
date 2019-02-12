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
    this.tuner
      .on('lock', () => Fsm.handle(this, 'tunerStart')) // TODO change event name
      .on('stop', () => Fsm.handle(this, 'tunerEnd'))
      .on('error', (err) => this.handleError(err));

    this.streamer = streamer;
    this.streamer
      .on('start', () => Fsm.handle(this, 'streamerStart'))
      .on('end', () => Fsm.handle(this, 'streamerEnd'))
      .on('error', (err) => this.handleError(err));
  }

  get state() {
    if (!this.__machina__) {
      return Fsm.initialState;
    }

    return Fsm.compositeState(this);
  }

  start(tunerOpts: any, streamerOpts: any) {
    this.tunerOpts = tunerOpts;
    this.streamerOpts = streamerOpts;
    Fsm.handle(this, 'start');
  }

  stop() {
    Fsm.handle(this, 'stop');
  }

  private handleError(err: Error) {
    Fsm.handle(this, 'error');
    this.emit('error', err);
  }

  startTuner() {
    this.tuner.start(this.tunerOpts);
    this.emit('transition');
  }

  stopTuner() {
    this.tuner.stop();
    this.emit('transition');
  }

  startStreamer() {
    this.streamer.start(this.tuner.streamDevice, this.streamerOpts);
    this.emit('transition');
  }

  stopStreamer() {
    this.streamer.stop();
    this.emit('transition');
  }
}
