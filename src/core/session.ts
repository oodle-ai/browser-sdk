const SESSION_KEY = '__oodle_session';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const SESSION_MAX_DURATION_MS = 4 * 60 * 60 * 1000;

interface SessionData {
  id: string;
  createdAt: number;
  lastActivity: number;
  viewCount: number;
  errorCount: number;
  actionCount: number;
  sampled: boolean;
  replaySampled: boolean;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    },
  );
}

function loadSession(): SessionData | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      id: parsed.id,
      createdAt: parsed.createdAt ?? Date.now(),
      lastActivity: parsed.lastActivity ?? Date.now(),
      viewCount: parsed.viewCount ?? 0,
      errorCount: parsed.errorCount ?? 0,
      actionCount: parsed.actionCount ?? 0,
      sampled: parsed.sampled ?? true,
      replaySampled: parsed.replaySampled ?? true,
    };
  } catch {
    return null;
  }
}

function saveSession(data: SessionData) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // storage unavailable
  }
}

let currentSession: SessionData | null = null;
let _sessionSampleRate = 100;
let _replaySampleRate = 100;

export function setSampleRates(
  sessionRate: number,
  replayRate: number,
) {
  _sessionSampleRate = Math.max(
    0,
    Math.min(100, sessionRate),
  );
  _replaySampleRate = Math.max(
    0,
    Math.min(100, replayRate),
  );
}

function rollSample(rate: number): boolean {
  return Math.random() * 100 < rate;
}

export function getSessionId(): string {
  const now = Date.now();

  if (!currentSession) {
    currentSession = loadSession();
  }

  if (
    !currentSession ||
    now - currentSession.lastActivity >
      SESSION_TIMEOUT_MS ||
    now - currentSession.createdAt >
      SESSION_MAX_DURATION_MS
  ) {
    const sampled = rollSample(_sessionSampleRate);
    currentSession = {
      id: generateId(),
      createdAt: now,
      lastActivity: now,
      viewCount: 0,
      errorCount: 0,
      actionCount: 0,
      sampled,
      replaySampled: sampled &&
        rollSample(_replaySampleRate),
    };
  } else {
    currentSession.lastActivity = now;
  }

  saveSession(currentSession);
  return currentSession.id;
}

export function isSessionSampled(): boolean {
  getSessionId();
  return currentSession?.sampled ?? true;
}

export function isReplaySampled(): boolean {
  getSessionId();
  return currentSession?.replaySampled ?? true;
}

export function touchSession() {
  if (currentSession) {
    currentSession.lastActivity = Date.now();
    saveSession(currentSession);
  }
}

export function incrementSessionCount(
  eventType: string,
) {
  getSessionId();
  if (!currentSession) return;
  if (
    eventType === 'view' ||
    eventType === 'page_load'
  ) {
    currentSession.viewCount++;
  } else if (eventType === 'error') {
    currentSession.errorCount++;
  } else if (eventType === 'action') {
    currentSession.actionCount++;
  }
  saveSession(currentSession);
}

export function getSessionCounts(): {
  viewCount: number;
  errorCount: number;
  actionCount: number;
} {
  getSessionId();
  return {
    viewCount: currentSession?.viewCount ?? 0,
    errorCount: currentSession?.errorCount ?? 0,
    actionCount: currentSession?.actionCount ?? 0,
  };
}
