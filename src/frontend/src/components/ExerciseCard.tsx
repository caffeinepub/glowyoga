import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { Clock, Heart, Play } from "lucide-react";
import type { Exercise } from "../backend.d";
import { TargetArea } from "../backend.d";
import ExerciseCrossfade from "./ExerciseCrossfade";

export const AREA_COLORS: Record<string, string> = {
  [TargetArea.forehead]: "bg-amber-100 text-amber-800 border-amber-200",
  [TargetArea.eyes]: "bg-sky-100 text-sky-800 border-sky-200",
  [TargetArea.cheeks]: "bg-rose-100 text-rose-800 border-rose-200",
  [TargetArea.jawline]: "bg-purple-100 text-purple-700 border-purple-200",
  [TargetArea.neck]: "bg-teal-100 text-teal-800 border-teal-200",
  [TargetArea.fullFace]: "bg-orange-100 text-orange-800 border-orange-200",
};

export const AREA_LABELS: Record<string, string> = {
  [TargetArea.forehead]: "Forehead",
  [TargetArea.eyes]: "Eyes",
  [TargetArea.cheeks]: "Cheeks",
  [TargetArea.jawline]: "Jawline",
  [TargetArea.neck]: "Neck",
  [TargetArea.fullFace]: "Full Face",
};

export const AREA_ICONS: Record<string, string> = {
  [TargetArea.forehead]: "✦",
  [TargetArea.eyes]: "◉",
  [TargetArea.cheeks]: "◌",
  [TargetArea.jawline]: "▽",
  [TargetArea.neck]: "◇",
  [TargetArea.fullFace]: "✿",
};

export function formatDuration(seconds: bigint): string {
  const s = Number(seconds);
  if (s < 60) return `${s} sec`;
  return `${Math.round(s / 60)} min`;
}

interface ExerciseCardProps {
  exercise: Exercise;
  isFavorite: boolean;
  onToggleFavorite: (id: bigint) => void;
  onStart: (exercise: Exercise) => void;
  index: number;
}

export default function ExerciseCard({
  exercise,
  isFavorite,
  onToggleFavorite,
  onStart,
  index,
}: ExerciseCardProps) {
  const navigate = useNavigate();
  const area = exercise.targetArea as string;

  return (
    <article
      className="bg-card rounded-2xl border border-border shadow-card overflow-hidden flex flex-col group hover:shadow-warm transition-shadow duration-300"
      data-ocid={`exercise.item.${index}`}
    >
      <div className="h-2 leopard-accent" />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={cn(
              "text-xs font-semibold font-body px-2.5 py-0.5 rounded-full border",
              AREA_COLORS[area] ??
                "bg-secondary text-secondary-foreground border-border",
            )}
          >
            {AREA_ICONS[area]} {AREA_LABELS[area] ?? area}
          </span>
          <span className="text-xs font-body text-muted-foreground capitalize bg-muted/60 px-2 py-0.5 rounded-full">
            {exercise.difficulty}
          </span>
        </div>

        <ExerciseCrossfade
          exerciseId={exercise.id}
          className="w-full h-44 mb-4"
        />

        <h3 className="font-display font-semibold text-foreground text-base leading-snug mb-1.5">
          {exercise.name}
        </h3>
        <p className="text-muted-foreground text-sm font-body leading-relaxed flex-1 line-clamp-2">
          {exercise.description}
        </p>

        <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-body mt-3 mb-4">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDuration(exercise.duration)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex-1 pill-btn text-sm flex items-center justify-center gap-1.5"
            onClick={() => onStart(exercise)}
            data-ocid={`exercise.primary_button.${index}`}
          >
            <Play className="w-3.5 h-3.5" />
            Start
          </button>
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center border border-border hover:border-primary/40 transition-colors"
            onClick={() =>
              navigate({
                to: "/exercises/$id",
                params: { id: String(exercise.id) },
              })
            }
            data-ocid={`exercise.secondary_button.${index}`}
            aria-label="View details"
          >
            <span className="text-xs">→</span>
          </button>
          <button
            type="button"
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center border transition-colors",
              isFavorite
                ? "bg-primary/10 border-primary/40 text-primary"
                : "bg-secondary border-border text-muted-foreground hover:text-primary hover:border-primary/40",
            )}
            onClick={() => onToggleFavorite(exercise.id)}
            data-ocid={`exercise.toggle.${index}`}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              className={cn("w-4 h-4", isFavorite ? "fill-current" : "")}
            />
          </button>
        </div>
      </div>
    </article>
  );
}
