import { EventEmitter } from 'events';

export default class HlsDeviceStreamer extends EventEmitter {
  private logger = console;

  start(device: any, options: any) {
    this.logger.log('pretending to start streamer', device, options);
    this.emit('start');
  }

  stop() {
    this.logger.log('pretending to stop streamer');
    this.emit('end');
  }
}
