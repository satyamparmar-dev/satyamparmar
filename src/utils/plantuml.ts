import pako from 'pako';

// ─── PlantUML URL Encoder ────────────────────────────────────
// Encodes PlantUML source → deflate → base64-like for PlantUML server

const encode64 = (data: Uint8Array): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
  let result = '';
  for (let i = 0; i < data.length; i += 3) {
    const b0 = data[i];
    const b1 = i + 1 < data.length ? data[i + 1] : 0;
    const b2 = i + 2 < data.length ? data[i + 2] : 0;
    result += chars[b0 >> 2];
    result += chars[((b0 & 0x3) << 4) | (b1 >> 4)];
    result += chars[((b1 & 0xf) << 2) | (b2 >> 6)];
    result += chars[b2 & 0x3f];
  }
  return result;
};

export const encodePlantUML = (source: string): string => {
  try {
    const utf8 = new TextEncoder().encode(source);
    // PlantUML expects raw DEFLATE stream (without zlib headers).
    const compressed = pako.deflateRaw(utf8, { level: 9 });
    return encode64(compressed);
  } catch {
    return '';
  }
};

export const getPlantUMLUrl = (
  source: string,
  type: 'svg' | 'png' = 'svg'
): string => {
  const encoded = encodePlantUML(source);
  if (!encoded) return '';
  return `https://www.plantuml.com/plantuml/${type}/${encoded}`;
};

// ─── Extract PlantUML Source ─────────────────────────────────
export const extractPlantUMLSource = (raw: string): string => {
  const match = raw.match(/@startuml[\s\S]*?@enduml/);
  return match ? match[0] : raw;
};

// ─── Validate PlantUML ────────────────────────────────────────
export const isValidPlantUML = (source: string): boolean => {
  return source.includes('@startuml') && source.includes('@enduml');
};
