import { useMemo, useState } from "react";

export default function useTTS() {
  const supported = useMemo(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    []
  );
  const [speaking, setSpeaking] = useState(false);

  const pickEnglishVoice = () => {
    if (!supported) return null;
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => /en-(US|GB)/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang)) ||
      null
    );
  };

  const speak = (text) => {
    if (!supported || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 1;
    utter.pitch = 1;
    const voice = pickEnglishVoice();
    if (voice) utter.voice = voice;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const stop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  if (supported) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }

  return { supported, speaking, speak, stop };
}
