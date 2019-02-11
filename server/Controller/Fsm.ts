import * as Machina from 'machina';

export default new Machina.BehavioralFsm({
  initialState: 'idle',

  states: {
    idle: {},
  },
});
