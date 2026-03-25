"use client";
import { useEffect } from "react";

export function GoogleTranslate() {
  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;

    // Provide the initialization callback wrapper
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div 
      id="google_translate_element" 
      style={{ 
        width: "1px", height: "1px", overflow: "hidden", 
        position: "absolute", top: "-10000px", left: "-10000px", 
        opacity: 0, pointerEvents: "none" 
      }} 
    />
  );
}
