/**
 * Mock Web Worker class for testing
 *
 * This is a bare bones web worker that does nothing.
 * It is needed to test the KgFull component which imports the worker.
 * As the only thing the web worker does is create a d3 force simulation,
 * which is a third party package, I (Max Wang) decided that we don't
 * need to test the returned simulation.
 */
class Worker {
  constructor(stringUrl) {
    this.url = stringUrl;
    this.onmessage = () => {};
  }

  postMessage(msg) {
    this.onmessage(msg);
  }
}

export default Worker;
