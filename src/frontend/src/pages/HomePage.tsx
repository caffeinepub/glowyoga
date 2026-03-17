import { Progress } from "@/components/ui/progress";
import { useNavigate } from "@tanstack/react-router";
import {
  Heart,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Star,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Exercise } from "../backend.d";
import ExerciseCard from "../components/ExerciseCard";
import { formatDuration } from "../components/ExerciseCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useExercises,
  useFavorites,
  useToggleFavorite,
} from "../hooks/useQueries";

function DemoPlayer({ exercises }: { exercises: Exercise[] }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  const current = exercises[currentIdx];

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset timer on exercise change
  useEffect(() => {
    if (current) setTimeLeft(Number(current.duration));
  }, [currentIdx, current]);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setIsPlaying(false);
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
  }, [isPlaying, timeLeft]);

  if (!current) return null;

  const totalDuration = Number(current.duration);
  const progress =
    totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="bg-card rounded-3xl border border-border shadow-warm overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-2/5 bg-secondary flex flex-col items-center justify-center p-10 relative">
          <div className="absolute inset-0 leopard-accent-subtle opacity-30" />
          <div className="relative text-8xl mb-4">✿</div>
          <div className="relative font-body text-sm text-muted-foreground font-medium">
            Step {currentIdx + 1} of {exercises.length}
          </div>
        </div>
        <div className="flex-1 p-8 flex flex-col justify-between">
          <div>
            <div className="text-xs font-body font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Current Session
            </div>
            <h3 className="font-display font-bold text-2xl text-foreground mb-2">
              {current.name}
            </h3>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              {current.instructions[0] ?? current.description}
            </p>
          </div>
          <div className="mb-6">
            <div
              className="font-body font-bold text-foreground"
              style={{ fontSize: "4rem", lineHeight: 1 }}
            >
              {mins > 0
                ? `${mins}:${String(secs).padStart(2, "0")}`
                : `${secs}s`}
            </div>
            <Progress value={progress} className="mt-3 h-1.5" />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-primary/10 transition-colors"
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              data-ocid="session.button"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-14 h-14 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity shadow-warm"
              onClick={() => setIsPlaying((p) => !p)}
              data-ocid="session.primary_button"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-primary-foreground" />
              ) : (
                <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
              )}
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-primary/10 transition-colors"
              onClick={() =>
                setCurrentIdx((i) => Math.min(exercises.length - 1, i + 1))
              }
              data-ocid="session.button"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="ml-auto pill-btn text-sm"
              onClick={() => navigate({ to: "/session" })}
              data-ocid="session.secondary_button"
            >
              Full Session →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const { data: exercises = [] } = useExercises();
  const { data: favorites = [] } = useFavorites(isLoggedIn);
  const toggleFav = useToggleFavorite();

  const featuredExercises = exercises.slice(0, 4);

  const features = [
    {
      icon: <Star className="w-6 h-6" />,
      title: "25 Expert Exercises",
      desc: "Curated by certified face yoga instructors",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Guided Sessions",
      desc: "Step-by-step with countdown timers",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Track Progress",
      desc: "Streaks, milestones, and history",
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden relative bg-secondary aspect-[4/5]">
              <img
                src="/assets/generated/hero-face-yoga.dim_800x900.jpg"
                alt="Face yoga practice"
                className="w-full h-full object-cover"
              />
              <div className="absolute right-0 top-0 bottom-0 w-8 leopard-accent opacity-80" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-2xl bg-warmBrown-700 -z-10" />
            <div className="absolute -top-3 -right-3 w-20 h-20 rounded-xl bg-caramel-500/20 -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          >
            <div className="inline-block leopard-accent text-cream-100 text-xs font-body font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              Natural Face Wellness
            </div>
            <h1
              className="font-display font-bold text-foreground leading-tight mb-6"
              style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}
            >
              Sculpt & Glow
              <br />
              <span className="text-primary">Naturally</span>
            </h1>
            <p className="text-muted-foreground font-body text-lg leading-relaxed mb-8 max-w-md">
              Discover the ancient art of face yoga. Tone muscles, reduce fine
              lines, and radiate confidence — no products needed.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                className="pill-btn text-base px-8 py-3.5"
                onClick={() => navigate({ to: "/exercises" })}
                data-ocid="home.primary_button"
              >
                Start Your Journey
              </button>
              <button
                type="button"
                className="px-8 py-3.5 rounded-full border-2 border-primary/30 text-foreground font-body font-semibold text-base hover:border-primary/60 transition-colors"
                onClick={() =>
                  isLoggedIn ? navigate({ to: "/dashboard" }) : login()
                }
                data-ocid="home.secondary_button"
              >
                {isLoggedIn ? "My Dashboard" : "Sign In Free"}
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2"
                >
                  <span className="text-primary">{f.icon}</span>
                  <span className="text-sm font-body font-medium text-foreground">
                    {f.title}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo Player */}
      {exercises.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-10">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
                Your Daily Practice
              </h2>
              <p className="text-muted-foreground font-body">
                Experience a guided session below — try the controls
              </p>
            </div>
            <DemoPlayer exercises={exercises.slice(0, 3)} />
          </motion.div>
        </section>
      )}

      <div className="leopard-accent h-8 my-4 opacity-60" />

      {/* Exercise preview */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
              Explore Exercises
            </h2>
            <p className="text-muted-foreground font-body">
              Hand-picked routines for every part of your face
            </p>
          </div>

          {featuredExercises.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredExercises.map((ex, i) => (
                <ExerciseCard
                  key={String(ex.id)}
                  exercise={ex}
                  isFavorite={favorites.some((f) => f === ex.id)}
                  onToggleFavorite={(id) => toggleFav.mutate(id)}
                  onStart={(e) => {
                    sessionStorage.setItem(
                      "sessionExercises",
                      JSON.stringify([e]),
                    );
                    navigate({ to: "/session" });
                  }}
                  index={i + 1}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {["a", "b", "c", "d"].map((k) => (
                <div
                  key={k}
                  className="bg-card rounded-2xl border border-border h-80 animate-pulse"
                />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <button
              type="button"
              className="pill-btn text-sm px-8 py-3"
              onClick={() => navigate({ to: "/exercises" })}
              data-ocid="home.link"
            >
              View All 25 Exercises →
            </button>
          </div>
        </motion.div>
      </section>

      {/* Benefits strip */}
      <section className="bg-secondary border-y border-border py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              {
                num: "25",
                label: "Expert Exercises",
                sub: "Covering every facial zone",
              },
              {
                num: "5–20",
                label: "Minutes Per Session",
                sub: "Quick enough for daily practice",
              },
              {
                num: "100%",
                label: "Natural Method",
                sub: "No tools or products needed",
              },
            ].map((stat) => (
              <motion.div
                key={stat.num}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-6"
              >
                <div className="font-display font-bold text-5xl text-primary mb-2">
                  {stat.num}
                </div>
                <div className="font-display font-semibold text-xl text-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-muted-foreground font-body text-sm">
                  {stat.sub}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
