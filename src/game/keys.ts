const MODIFIERS = new Set(["Shift", "Control", "Alt", "Meta"]);

export function isModifierKey(key: string): boolean {
  return MODIFIERS.has(key);
}

export function matchesTarget(key: string, target: string): boolean {
  return key.toLowerCase() === target.toLowerCase();
}
