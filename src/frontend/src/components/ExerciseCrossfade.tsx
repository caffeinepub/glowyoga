import { cn } from "@/lib/utils";
import { useState } from "react";

const VALID_IDS = Array.from({ length: 25 }, (_, i) => i + 1);

interface ExerciseCrossfadeProps {
  exerciseId: number | bigint;
  className?: string;
}

export default function ExerciseCrossfade({
  exerciseId,
  className,
}: ExerciseCrossfadeProps) {
  const id = Number(exerciseId);
  const isValid = VALID_IDS.includes(id);
  const padded = String(id).padStart(2, "0");
  const frameA = `/assets/generated/exercise-${padded}-a.dim_600x750.jpg`;
  const frameB = `/assets/generated/exercise-${padded}-b.dim_600x750.jpg`;

  const [aLoaded, setALoaded] = useState(false);
  const [bLoaded, setBLoaded] = useState(false);
  const bothLoaded = aLoaded && bLoaded;

  if (!isValid) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-secondary flex items-center justify-center",
          className,
        )}
      >
        <span className="text-4xl opacity-30">✿</span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes crossfadeA {
          0%   { opacity: 1; }
          35%  { opacity: 1; }
          50%  { opacity: 0; }
          85%  { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes crossfadeB {
          0%   { opacity: 0; }
          35%  { opacity: 0; }
          50%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { opacity: 0; }
        }
        .cf-frame-a {
          animation: crossfadeA 4s ease-in-out infinite;
        }
        .cf-frame-b {
          animation: crossfadeB 4s ease-in-out infinite;
        }
      `}</style>
      <div className={cn("relative overflow-hidden rounded-xl", className)}>
        {!bothLoaded && (
          <div className="absolute inset-0 bg-secondary animate-pulse rounded-xl" />
        )}
        <img
          src={frameA}
          alt=""
          aria-hidden="true"
          className={cn(
            "cf-frame-a absolute inset-0 w-full h-full object-cover transition-opacity duration-100",
            bothLoaded ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setALoaded(true)}
        />
        <img
          src={frameB}
          alt=""
          aria-hidden="true"
          className={cn(
            "cf-frame-b absolute inset-0 w-full h-full object-cover",
            bothLoaded ? "opacity-0" : "opacity-0",
          )}
          onLoad={() => setBLoaded(true)}
        />
        {/* spacer to maintain aspect ratio via parent className */}
        <div className="w-full h-full" />
      </div>
    </>
  );
}
