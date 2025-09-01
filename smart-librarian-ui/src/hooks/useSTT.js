import { useMemo, useRef, useState } from "react";

export default function useSTT() {
  const supported = useMemo(
    () =>
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window),
    []
  );

  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  if (supported && !recognitionRef.current) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = "en-US";
    r.interimResults = false;
    r.maxAlternatives = 1;
    recognitionRef.current = r;
  }

  const start = (onResult) => {
    const r = recognitionRef.current;
    if (!r) return;
    r.start();
    setListening(true);
    r.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onResult?.(transcript);
      setListening(false);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
  };

  return { supported, listening, start };
}
