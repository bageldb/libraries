
if (typeof document !== 'undefined') {
  console.log('bagelDB is running in a browser');
} else if (typeof globalThis?.navigator !== 'undefined' && globalThis?.navigator?.product === 'ReactNative') {
  // I'm in react-native
} else {
  // I'm in node js
  if (!globalThis?.EventSource) {
    try {

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      //   const EventSource = require('eventsource');
      //   globalThis.EventSource = EventSource;

      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      //   const setIt = new Function('try {return globalThis.EventSource = require("eventsource");}catch(e){return false;}');
      //   setIt();
      // const EventSource = require('eventsource');
      // globalThis.EventSource = EventSource;

    } catch (error) {
    //   console.warn('if you are running bagelDB in nodejs environment you might need the `eventsource` npm package for live data to function');
    }
  }
}



