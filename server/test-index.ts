/* eslint-disable no-console */

import * as path from 'path';

import AzapTuner from './AzapTuner';
import HlsDeviceStreamer from './HlsDeviceStreamer';
import Controller from './Controller';

const channelsPath = path.resolve('config', 'channels.conf');
const tuner = new AzapTuner({ channelsPath });
const streamer = new HlsDeviceStreamer();
const controller = new Controller(tuner, streamer);

controller
  .on('transition', () => console.log('transition', controller.state))
  .on('error', (err) => console.error(err));

tuner.on('lock', () => {
  console.log('locked');
  controller.stop();
});

controller.start('PBS (KCTS)', {});
