import * as Machina from 'machina';

interface Controller {
  startTuner(): void;
  stopTuner(): void;
  startStreamer(): void;
  stopStreamer(): void;
}

export default new Machina.BehavioralFsm({
  initialState: 'idle',

  states: {
    idle: {
      start: 'startingTuner',
    },

    startingTuner: {
      _onEnter(client: Controller) {
        client.startTuner();
      },

      start() {
        this.deferUntilTransition('idle');
        this.transition('stoppingTuner');
      },
      stop: 'stoppingTuner',

      tunerStart: 'startingStreamer',
      tunerEnd: 'idle',
    },

    startingStreamer: {
      _onEnter(client: Controller) {
        client.startStreamer();
      },

      start() {
        this.deferUntilTransition('idle');
        this.transition('stoppingStreamer');
      },
      stop: 'stoppingStreamer',

      tunerEnd: 'stoppingStreamer',

      streamerStart: 'active',
      streamerEnd: 'stoppingTuner',
    },

    active: {
      start() {
        this.deferUntilTransition('idle');
        this.transition('stoppingStreamer');
      },
      stop: 'stoppingStreamer',

      tunerEnd: 'stoppingStreamer',

      streamerEnd: 'stoppingTuner',
    },

    stoppingStreamer: {
      _onEnter(client: Controller) {
        client.stopStreamer();
      },

      start() {
        this.deferUntilTransition('idle');
        this.transition('stoppingTuner');
      },

      tunerEnd: 'idle',

      streamerEnd: 'stoppingTuner',
    },

    stoppingTuner: {
      _onEnter(client: Controller) {
        client.stopTuner();
      },

      start() {
        this.deferAndTransition('idle');
      },

      tunerEnd: 'idle',
    },
  },
});
