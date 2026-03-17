import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Clock, Heart, Play } from "lucide-react";
import { motion } from "motion/react";
import {
  AREA_COLORS,
  AREA_ICONS,
  AREA_LABELS,
  formatDuration,
} from "../components/ExerciseCard";
import ExerciseCrossfade from "../components/ExerciseCrossfade";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useExercises,
  useFavorites,
  useToggleFavorite,
} from "../hooks/useQueries";

export default function ExerciseDetailPage() {
  const { id } = useParams({ from: "/exercises/$id" });
  const navigate = useNavigate();
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const { data: exercises = [] } = useExercises();
  const { data: favorites = [] } = useFavorites(isLoggedIn);
  const toggleFav = useToggleFavorite();

  const exercise = exercises.find((e) => String(e.id) === id);
  const isFavorite = favorites.some((f) => String(f) === id);

  if (!exercise) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="text-6xl mb-4">✿</div>
        <h2 className="font-display font-bold text-2xl text-foreground mb-2">
          Exercise not found
        </h2>
        <button
          type="button"
          className="pill-btn mt-4"
          onClick={() => navigate({ to: "/exercises" })}
          data-ocid="detail.button"
        >
          Back to Library
        </button>
      </div>
    );
  }

  const area = exercise.targetArea as string;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          type="button"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-8 transition-colors"
          onClick={() => navigate({ to: "/exercises" })}
          data-ocid="detail.button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </button>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <div className="rounded-3xl overflow-hidden">
              <div className="h-3 leopard-accent" />
              <ExerciseCrossfade
                exerciseId={exercise.id}
                className="rounded-b-3xl overflow-hidden aspect-[4/5]"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className={cn(
                  "text-xs font-semibold font-body px-3 py-1 rounded-full border",
                  AREA_COLORS[area] ??
                    "bg-secondary text-secondary-foreground border-border",
                )}
              >
                {AREA_ICONS[area]} {AREA_LABELS[area] ?? area}
              </span>
              <span className="text-xs font-body capitalize bg-muted/60 px-3 py-1 rounded-full text-muted-foreground">
                {exercise.difficulty}
              </span>
            </div>

            <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
              {exercise.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-body">
                <Clock className="w-4 h-4" />
                {formatDuration(exercise.duration)}
              </div>
            </div>

            <p className="text-muted-foreground font-body text-base leading-relaxed mb-8">
              {exercise.description}
            </p>

            <div className="mb-8">
              <h2 className="font-display font-semibold text-lg text-foreground mb-4">
                Instructions
              </h2>
              <ol className="space-y-3">
                {exercise.instructions.map((step, i) => (
                  <li
                    key={`${step.substring(0, 15)}-${i}`}
                    className="flex gap-3"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold font-body">
                      {i + 1}
                    </span>
                    <span className="text-foreground font-body text-sm leading-relaxed pt-0.5">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {exercise.tips && (
              <div className="bg-primary/8 border border-primary/20 rounded-2xl p-5 mb-8">
                <h3 className="font-display font-semibold text-sm text-primary uppercase tracking-wide mb-2">
                  Pro Tip
                </h3>
                <p className="text-foreground font-body text-sm leading-relaxed">
                  {exercise.tips}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                className="pill-btn flex-1 flex items-center justify-center gap-2 py-3.5"
                onClick={() => {
                  sessionStorage.setItem(
                    "sessionExercises",
                    JSON.stringify([exercise]),
                  );
                  navigate({ to: "/session" });
                }}
                data-ocid="detail.primary_button"
              >
                <Play className="w-4 h-4" />
                Start Exercise
              </button>
              <button
                type="button"
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors",
                  isFavorite
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
                onClick={() => toggleFav.mutate(exercise.id)}
                data-ocid="detail.toggle"
              >
                <Heart
                  className={cn("w-5 h-5", isFavorite ? "fill-current" : "")}
                />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
