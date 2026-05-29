/**
 * Vitest setup for React component tests.
 *
 * - Imports @testing-library/jest-dom for extended matchers
 *   (toBeInTheDocument, toHaveTextContent, toBeVisible, etc.)
 * - Runs automatically before each test file via vitest.config.ts setupFiles.
 *
 * Created: Controlled Technical Sprint 05 — React Component Test Harness Foundation.
 */
import '@testing-library/jest-dom/vitest';

class MockAudioParam {
  value = 0;

  setValueAtTime(value: number) {
    this.value = value;
    return this;
  }

  exponentialRampToValueAtTime(value: number) {
    this.value = value;
    return this;
  }
}

class MockAudioNode {
  connect() {
    return this;
  }
}

class MockOscillatorNode extends MockAudioNode {
  type: OscillatorType = 'sine';
  frequency = new MockAudioParam();

  start() {
    return undefined;
  }

  stop() {
    return undefined;
  }
}

class MockGainNode extends MockAudioNode {
  gain = new MockAudioParam();
}

class MockAudioContext {
  currentTime = 0;
  destination = new MockAudioNode();
  state: AudioContextState = 'running';

  createOscillator() {
    return new MockOscillatorNode();
  }

  createGain() {
    return new MockGainNode();
  }

  resume() {
    this.state = 'running';
    return Promise.resolve();
  }

  close() {
    this.state = 'closed';
    return Promise.resolve();
  }
}

function installAudioContextMock(target: typeof globalThis | Window) {
  Object.defineProperty(target, 'AudioContext', {
    configurable: true,
    writable: true,
    value: MockAudioContext,
  });
  Object.defineProperty(target, 'webkitAudioContext', {
    configurable: true,
    writable: true,
    value: MockAudioContext,
  });
}

installAudioContextMock(globalThis);

if (typeof window !== 'undefined') {
  installAudioContextMock(window);
}
