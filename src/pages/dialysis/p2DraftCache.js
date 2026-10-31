import { encryptedGet, encryptedSet } from '../../cache/encryptedPageCache';

export function draftKey(sessionId, screenId) {
  return `p2-draft:${sessionId || 'none'}:${screenId}`;
}

export async function saveP2Draft(sessionId, screenId, payload) {
  await encryptedSet(draftKey(sessionId, screenId), {
    payload,
    savedAt: new Date().toISOString(),
  });
}

export async function loadP2Draft(sessionId, screenId) {
  return encryptedGet(draftKey(sessionId, screenId));
}
