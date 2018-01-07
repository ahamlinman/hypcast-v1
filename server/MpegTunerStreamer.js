/* eslint-disable no-console */

import Machina from 'machina';
import FfmpegCommand from 'fluent-ffmpeg';
import WebSocketStream from 'websocket-stream';

// Common error handlers for while the tuner / streamer are initializing or
// active. In all cases, everything is stopped and errors are dumped where
// possible.
const ErrorHandlers = {
  tunerError(err) {
    this.emit('error', err);
    this.handle('stop');
  },

  tunerStop() {
    this.emit('error', new Error('The tuner unexpectedly stopped'));
    this.handle('stop');
  },

  ffmpegError(err, stdout, stderr) {
    console.error('Dumping FFmpeg output:', stdout, stderr);
    this.emit('error', err);
    this.handle('stop');
  },

  ffmpegEnd(stdout, stderr) {
    console.error('Dumping FFmpeg output:', stdout, stderr);
    this.emit('error', new Error('FFmpeg unexpectedly stopped'));
    this.handle('stop');
  },
};

const TunerMachine = Machina.Fsm.extend({
  initialize(tuner, server) {
    this._tuner = tuner;
    this._server = server;

    this._tuner.on('lock', () => this.handle('tunerLock'));
    this._tuner.on('error', (err) => this.handle('tunerError', err));
    this._tuner.on('stop', () => this.handle('tunerStop'));
  },

  initialState: 'inactive',
  states: {
    inactive: {
      _onEnter() {
        delete this._tuneData;
      },

      // The user wants to stream a given channel
      tune(data) {
        this._tuneData = data;
        console.log('tuneData:', data);
        this.transition('tuning');
      },
    },

    tuning: {
      ...ErrorHandlers,

      // We begin by starting up the tuner...
      _onEnter() {
        this._tuner.tune(this._tuneData.channel);
      },

      // ...and we'll start FFmpeg when we have a signal lock
      tunerLock() {
        this.transition('buffering');
      },

      // If the user quickly tries to change the channel, just go back to the
      // inactive state and start tuning again from there. A clean start.
      tune() {
        this.deferUntilTransition('inactive');
        this.handle('stop');
      },

      // If we stop from this state, make sure the tuner gets stopped
      stop() {
        this.transition('detuning');
      },
    },

    buffering: {
      ...ErrorHandlers,

      async _onEnter() {
        this._wss = WebSocketStream.createServer({
          server: this._server,
          path: '/mpeg-ws-stream',
        }, handle.bind(this));

        function handle(stream) {
          if (this._ffmpeg) {
            throw new Error('Not ready for multiple clients yet!');
          }

          const { profile } = this._tuneData;

          this._ffmpeg = new FfmpegCommand({ source: this._tuner.device, logger: console })
            .complexFilter([
              // This scales the video down to videoHeight, unless it is already
              // smaller. -2 means that the width will proportionally match.
              `scale=-2:ih*min(1\\,${profile.videoHeight}/ih)`,
              // This will "stretch/squeeze [audio] samples to the given
              // timestamps." The goal is to let audio get back in sync after
              // reading a corrupted stream (e.g. if we're using an antenna and
              // the signal strength is low).
              'aresample=async=1000',
            ])
            .format('mpegts')
            .videoCodec('mpeg1video').videoBitrate(profile.videoBitrate)
            .outputOptions([
              // This "group of pictures" option forces more frequent keyframes,
              // in an attempt to make Hypcast streams start up more quickly.
              '-g 120',
            ])
            .audioCodec('mp2').audioBitrate(profile.audioBitrate)
            .on('start', (cmd) => { console.log('ffmpeg started:', cmd); this.transition('active'); })
            .on('error', (err, stdout, stderr) => this.handle('ffmpegError', err, stdout, stderr))
            .on('end', (stdout, stderr) => this.handle('ffmpegEnd', stdout, stderr))
            .pipe(stream);
        }
      },

      tune() {
        this.deferUntilTransition('inactive');
        this.handle('stop');
      },

      stop() {
        this.transition('debuffering');
      },
    },

    active: {
      ...ErrorHandlers,

      // If the user changes the channel, just start everything over
      tune() {
        this.deferUntilTransition('inactive');
        this.handle('stop');
      },

      stop() {
        this.transition('debuffering');
      },
    },

    debuffering: {
      _onEnter() {
        // Kill FFmpeg if it is running (note that it will emit an error on
        // SIGKILL that we need to absorb)
        if (this._ffmpeg) {
          this._ffmpeg.removeAllListeners('error').once('error', () => {});
          this._ffmpeg.kill();
          delete this._ffmpeg;

          this._wss.close();
          delete this._wss;
        }

        this.transition('detuning');
      },

      tune() {
        this.deferUntilTransition('inactive');
      },
    },

    detuning: {
      _onEnter() {
        this._tuner.stop();
      },

      tunerStop() {
        this.transition('inactive');
      },

      tune() {
        this.deferUntilTransition('inactive');
      },
    },
  },
});

export default class MpegTunerStreamer extends TunerMachine {
  tune(data) {
    this.handle('tune', data);
  }

  stop() {
    this.handle('stop');
  }

  get tuneData() {
    return this._tuneData;
  }
}
