import { Progress } from "@/components/ui/progress";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  Pause,
  Play,
  RefreshCw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Exercise } from "../backend.d";
import ExerciseCrossfade from "../components/ExerciseCrossfade";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useExercises, useRecordSession } from "../hooks/useQueries";

export default function SessionPage() {
  const navigate = useNavigate();
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const { data: allExercises = [] } = useExercises();
  const recordSession = useRecordSession();

  const stateExercises: Exercise[] = (() => {
    try {
      const raw = sessionStorage.getItem("sessionExercises");
      return raw ? (JSON.parse(raw) as Exercise[]) : [];
    } catch {
      return [];
    }
  })();

  const sessionExercises =
    stateExercises.length > 0 ? stateExercises : allExercises.slice(0, 5);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [countdown, setCountdown] = useState<number | null>(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = sessionExercises[currentIdx];

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset timer on exercise change
  useEffect(() => {
    if (current) setTimeLeft(Number(current.duration));
  }, [currentIdx, current]);

  // Countdown logic
  // biome-ignore lint/correctness/useExhaustiveDependencies: countdown tick
  useEffect(() => {
    if (countdown === null) return;

    // Clear any pending countdown tick
    if (countdownRef.current) clearTimeout(countdownRef.current);

    if (countdown > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdown((c) => (c !== null && c > 0 ? c - 1 : c));
      }, 1000);
    } else {
      // countdown === 0 → show "Go!" briefly then start
      countdownRef.current = setTimeout(() => {
        setCountdown(null);
        setIsPlaying(true);
      }, 700);
    }

    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, [countdown]);

  function skipCountdown() {
    if (countdownRef.current) clearTimeout(countdownRef.current);
    setCountdown(null);
    setIsPlaying(true);
  }

  function goToExercise(idx: number) {
    if (countdownRef.current) clearTimeout(countdownRef.current);
    setCurrentIdx(idx);
    setIsPlaying(false);
    setCountdown(3);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: timer interval
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            setIsPlaying(false);
            if (currentIdx < sessionExercises.length - 1) {
              setTimeout(() => {
                goToExercise(currentIdx + 1);
              }, 1200);
            } else {
              setTimeout(() => setCompleted(true), 1200);
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentIdx, sessionExercises.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function handleComplete() {
    if (!isLoggedIn) return;
    const durationSeconds = BigInt(Math.round((Date.now() - startTime) / 1000));
    recordSession.mutate({
      exerciseIds: sessionExercises.map((e) => e.id),
      duration: durationSeconds,
    });
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: only run on completed change
  useEffect(() => {
    if (completed) handleComplete();
  }, [completed]);

  if (!current && !completed) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="text-6xl mb-4">✿</div>
        <h2 className="font-display font-bold text-2xl text-foreground mb-4">
          Loading session...
        </h2>
        <div
          className="h-8 bg-card rounded animate-pulse w-48 mx-auto"
          data-ocid="session.loading_state"
        />
      </div>
    );
  }

  if (completed) {
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const mins = Math.floor(totalTime / 60);
    const secs = totalTime % 60;
    return (
      <div
        className="max-w-2xl mx-auto px-6 py-16 text-center"
        data-ocid="session.success_state"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <div className="w-24 h-24 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
          <h2 className="font-display font-bold text-4xl text-foreground mb-3">
            Session Complete!
          </h2>
          <p className="text-muted-foreground font-body text-lg mb-8">
            Amazing work. You completed {sessionExercises.length} exercises in{" "}
            {mins > 0 ? `${mins}m ` : ""}
            {secs}s.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: "Exercises", value: sessionExercises.length },
              {
                label: "Duration",
                value: `${mins > 0 ? `${mins}m ` : ""}${secs}s`,
              },
              {
                label: "Areas Trained",
                value: new Set(sessionExercises.map((e) => e.targetArea)).size,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-2xl border border-border p-4"
              >
                <div className="font-display font-bold text-2xl text-primary">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-body text-xs mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              type="button"
              className="pill-btn flex items-center gap-2"
              onClick={() => {
                setCompleted(false);
                setCurrentIdx(0);
                setIsPlaying(false);
                setCountdown(3);
              }}
              data-ocid="session.button"
            >
              <RefreshCw className="w-4 h-4" />
              Repeat Session
            </button>
            <button
              type="button"
              className="px-6 py-2.5 rounded-full border-2 border-primary/30 text-foreground font-body font-semibold text-sm hover:border-primary/60 transition-colors"
              onClick={() => navigate({ to: "/exercises" })}
              data-ocid="session.secondary_button"
            >
              More Exercises
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const totalDuration = Number(current.duration);
  const progress =
    totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
  const sessionProgress = (currentIdx / sessionExercises.length) * 100;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  const instructions: string[] = current.instructions ?? [];
  const hasMultipleSteps = instructions.length > 1;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="font-body text-sm text-muted-foreground">
              Exercise {currentIdx + 1} of {sessionExercises.length}
            </span>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground font-body text-sm transition-colors"
              onClick={() => navigate({ to: "/exercises" })}
              data-ocid="session.link"
            >
              End Session
            </button>
          </div>
          <Progress
            value={sessionProgress}
            className="h-1.5"
            data-ocid="session.panel"
          />
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {sessionExercises.map((ex, i) => (
            <button
              type="button"
              key={String(ex.id)}
              onClick={() => goToExercise(i)}
              className={`px-3 py-1 rounded-full text-xs font-body font-medium transition-colors ${
                i === currentIdx
                  ? "bg-primary text-primary-foreground"
                  : i < currentIdx
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="relative bg-card rounded-3xl border border-border shadow-warm overflow-hidden"
          >
            <div className="h-3 leopard-accent" />
            <div className="flex flex-col md:flex-row">
              {/* Image panel */}
              <div className="md:w-2/5 min-h-64 md:min-h-full">
                <ExerciseCrossfade
                  exerciseId={current.id}
                  className="w-full min-h-64 md:h-full rounded-none"
                />
              </div>

              <div className="flex-1 p-8">
                <div className="text-xs font-body font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  Step {currentIdx + 1} — {current.difficulty}
                </div>
                <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-4">
                  {current.name}
                </h2>

                {/* Step-by-step instructions */}
                <div className="bg-secondary/60 rounded-xl p-4 mb-6">
                  <p className="text-xs font-body font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    How to do it
                  </p>
                  {hasMultipleSteps ? (
                    <ol className="space-y-2.5">
                      {instructions.map((step, stepIdx) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: instruction order is stable
                        <li key={stepIdx} className="flex gap-3 items-start">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary font-body font-bold text-xs flex items-center justify-center mt-0.5">
                            {stepIdx + 1}
                          </span>
                          <span className="font-body text-sm text-foreground leading-relaxed">
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-foreground font-body text-sm leading-relaxed">
                      {instructions[0] ?? current.description}
                    </p>
                  )}
                </div>

                <div className="mb-2">
                  <div
                    className="font-body font-bold text-foreground"
                    style={{ fontSize: "4rem", lineHeight: 1 }}
                  >
                    {mins > 0
                      ? `${mins}:${String(secs).padStart(2, "0")}`
                      : `${secs}s`}
                  </div>
                </div>
                <Progress value={progress} className="mb-6 h-2" />

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="w-11 h-11 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-primary/10 transition-colors"
                    onClick={() => goToExercise(Math.max(0, currentIdx - 1))}
                    data-ocid="session.button"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="w-16 h-16 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity shadow-warm"
                    onClick={() => {
                      if (countdown !== null) {
                        skipCountdown();
                      } else {
                        setIsPlaying((p) => !p);
                      }
                    }}
                    data-ocid="session.primary_button"
                  >
                    {isPlaying ? (
                      <Pause className="w-7 h-7 text-primary-foreground" />
                    ) : (
                      <Play className="w-7 h-7 text-primary-foreground ml-0.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    className="w-11 h-11 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-primary/10 transition-colors"
                    onClick={() => {
                      if (currentIdx < sessionExercises.length - 1) {
                        goToExercise(currentIdx + 1);
                      } else {
                        setCompleted(true);
                      }
                    }}
                    data-ocid="session.button"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Countdown overlay */}
            <AnimatePresence>
              {countdown !== null && (
                <motion.div
                  key="countdown-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-card/90 backdrop-blur-sm z-20"
                  data-ocid="session.modal"
                >
                  <p className="font-body text-sm text-muted-foreground mb-4 tracking-wide">
                    Get ready —{" "}
                    <span className="font-semibold text-foreground">
                      {current.name}
                    </span>
                  </p>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={countdown}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.4, opacity: 0 }}
                      transition={{
                        duration: 0.35,
                        type: "spring",
                        bounce: 0.4,
                      }}
                      className="font-display font-bold text-primary"
                      style={{ fontSize: "7rem", lineHeight: 1 }}
                    >
                      {countdown === 0 ? "Go!" : countdown}
                    </motion.div>
                  </AnimatePresence>

                  <button
                    type="button"
                    className="mt-8 font-body text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
                    onClick={skipCountdown}
                    data-ocid="session.close_button"
                  >
                    Skip countdown
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {current.tips && (
          <div className="mt-6 bg-primary/8 border border-primary/20 rounded-2xl p-4">
            <span className="font-body font-semibold text-sm text-primary">
              💡 Tip:{" "}
            </span>
            <span className="font-body text-sm text-foreground">
              {current.tips}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
