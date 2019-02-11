// TODO: Continue improving and validating these declarations, then contribute
// to machina.js (https://github.com/ifandelse/machina.js/issues/158).
declare module 'machina' {
  // export as namespace machina;

  export const eventListeners: EventListeners;
  function on(eventName: string, callback: EventListener): EventSubscription;
  function off(eventName: string, callback?: EventListener): void;
  function emit(eventName: string, ...args: any[]): void;

  export namespace utils {
    function createUUID(): string;
    function getDefaultClientMeta(): ClientMeta;
    function getDefaultOptions(): DefaultOptions;
    function getLeaklessArgs(): any;
    function listenToChild(): EventSubscription;
    function makeFsmNamespace(): string;
  }

  export class BehavioralFsm {
    constructor(options: Options);
    static extend(options: Options): typeof BehavioralFsm;

    initialState: string;
    eventListeners: EventListeners;
    states: States;
    namespace?: string;
    initialize: () => void;

    emit(eventName: string, ...args: any[]): void;
    handle(client: Client, eventName: string, ...args: any[]): void;
    transition(client: Client, stateName: string): void;
    processQueue(client: Client, type: string): void;
    clearQueue(client: Client, type?: string, stateName?: string): void;
    deferUntilTransition(client: Client, stateName?: string): void;
    deferAndTransition(client: Client, stateName: string): void;
    compositeState(client: Client): string;
    on(eventName: string, callback: EventListener): EventSubscription;
    off(eventName?: string, callback?: EventListener): void;
  }

  export interface Client {
    __machina__?: ClientMeta;
  }

  export interface ClientMeta {
    targetReplayState: any;
    state: string;
    priorState: string;
    priorAction: string;
    currentAction: string;
    currentActionArgs: any[];
    inputQueue: any[];
    inExitHandler: boolean;
    initialize?: () => void;
  }

  export class Fsm implements ClientMeta {
    constructor(options: Options);
    static extend(options: Options): typeof Fsm;

    initialState: string;
    eventListeners: EventListeners;
    states: States;
    namespace?: string;
    initialize: () => void;

    targetReplayState: any;
    state: string;
    priorState: string;
    priorAction: string;
    currentAction: string;
    currentActionArgs: any[];
    inputQueue: any[];
    inExitHandler: boolean;

    emit(eventName: string, ...args: any[]): void;
    handle(eventName: string, ...args: any[]): void;
    transition(stateName: string): void;
    processQueue(type: string): void;
    clearQueue(type?: string, stateName?: string): void;
    deferUntilTransition(stateName?: string): void;
    deferAndTransition(stateName: string): void;
    compositeState(): string;
    on(eventName: string, callback: EventListener): EventSubscription;
    off(eventName?: string, callback?: EventListener): void;
  }

  export interface Options {
    initialState?: string;
    eventListeners?: EventListeners;
    states?: States;
    namespace?: string;
    initialize?: () => void;
  }

  export interface DefaultOptions extends Options {
    useSafeEmit: boolean;
    hierarchy: any;
    pendingDelegations: any;
  }

  export interface States {
    [name: string]: State;
  }

  export interface State {
    // TODO: Make this work for Fsm and BehavioralFsm
    [action: string]: any;
  }

  export interface EventListeners {
    [eventName: string]: EventListener[] | undefined;
  }

  export type EventListener = (...args: any[]) => void;

  export interface EventSubscription {
    eventName: string;
    callback: EventListener;
    off: () => void;
  }
}
