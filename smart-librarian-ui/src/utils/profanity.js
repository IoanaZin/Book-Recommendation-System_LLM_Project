const banned = ["fuck", "shit", "bitch", "idiot", "stupid"];

export function containsProfanity(text = "") {
  const low = text.toLowerCase();
  return banned.some((w) => low.includes(w));
}
