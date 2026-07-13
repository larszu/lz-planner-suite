import { describe, it, expect } from 'vitest';
import { dataUrlToBytes } from '../src/utils/pdfExport';

// Reiner Base64-Decode einer Data-URL — keine DOM-Abhaengigkeit ausser atob.
describe('pdfExport dataUrlToBytes()', () => {
  it('dekodiert eine base64-Data-URL zu den Rohbytes', () => {
    // "Hi" == base64 "SGk="
    const bytes = dataUrlToBytes('data:image/jpeg;base64,SGk=');
    expect(Array.from(bytes)).toEqual([0x48, 0x69]);
  });

  it('liefert eine leere Sequenz fuer leeren Payload', () => {
    const bytes = dataUrlToBytes('data:image/jpeg;base64,');
    expect(bytes.length).toBe(0);
  });
});
