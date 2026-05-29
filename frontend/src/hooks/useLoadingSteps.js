import { useState, useEffect, useRef } from "react";

const QUOTATION_STEPS = [
  { message: "🔧 Calculating Pipe Requirements...", maxProgress: 20 },
  { message: "⚡ Selecting Best Motor Configuration...", maxProgress: 40 },
  { message: "📏 Measuring Cable Requirements...", maxProgress: 60 },
  { message: "💰 Optimizing Pricing...", maxProgress: 80 },
  { message: "📄 Preparing Quotation...", maxProgress: 100 }
];

const PDF_STEPS = [
  { message: "📷 Capturing Invoice Layout...", maxProgress: 30 },
  { message: "🎨 Compiling High-Resolution Rendering...", maxProgress: 60 },
  { message: "📄 Generating Print-Ready PDF...", maxProgress: 90 },
  { message: "✅ Delivering Local Document...", maxProgress: 100 }
];

export function useLoadingSteps(type = "quotation", duration = 3000) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const steps = type === "pdf" ? PDF_STEPS : QUOTATION_STEPS;

  const startLoading = () => {
    setIsActive(true);
    setProgress(0);
    setCurrentStepIndex(0);
    startTimeRef.current = Date.now();
  };

  const stopLoading = () => {
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isActive) return;

    const intervalTime = 50; // Update every 50ms for smooth animation
    
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const fraction = Math.min(elapsed / duration, 0.99); // Cap at 99% until complete
      const currentProgress = Math.round(fraction * 100);
      
      setProgress(currentProgress);

      // Determine step based on progress
      let newStepIndex = 0;
      for (let i = 0; i < steps.length; i++) {
        if (currentProgress <= steps[i].maxProgress) {
          newStepIndex = i;
          break;
        }
      }
      
      // Ensure we don't go out of bounds
      newStepIndex = Math.min(newStepIndex, steps.length - 1);
      setCurrentStepIndex(newStepIndex);
    }, intervalTime);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, duration, steps]);

  const completeLoading = () => {
    setProgress(100);
    setCurrentStepIndex(steps.length - 1);
    stopLoading();
  };

  return {
    progress,
    currentMessage: steps[currentStepIndex]?.message || "",
    startLoading,
    stopLoading,
    completeLoading,
    isActive
  };
}
