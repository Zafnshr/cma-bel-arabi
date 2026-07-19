"use client";

import { useState, useCallback, useEffect } from "react";

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeWordRange, setActiveWordRange] = useState<[number, number] | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!window.speechSynthesis) {
        console.error("Speech Synthesis API is not supported in this browser.");
        return;
      }

      window.speechSynthesis.cancel();
      setActiveWordRange(null);

      // Clean text but preserve length to keep charIndex accurate for highlighting
      // Replaces bullet points, asterisks, and dashes with spaces
      const cleanText = text.replace(/[*•\-]/g, " ");

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.9;
      utterance.lang = "en-US";

      if (voices.length > 0) {
        let selectedVoice = voices.find(
          (v) =>
            v.name.includes("Google US English") ||
            v.name.includes("Microsoft Aria") ||
            v.name.includes("Microsoft Guy")
        );

        if (!selectedVoice) {
          selectedVoice = voices.find((v) => v.lang === "en-US");
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        setActiveWordRange(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setActiveWordRange(null);
      };
      
      utterance.onboundary = (event) => {
        if (event.name === "word") {
          setActiveWordRange([event.charIndex, event.charIndex + event.charLength]);
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [voices]
  );

  return { speak, isSpeaking, activeWordRange };
}
