import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, Clock, Flame, Heart, Target } from "lucide-react";
import { motion } from "motion/react";
import {
  AREA_ICONS,
  AREA_LABELS,
  formatDuration,
} from "../components/ExerciseCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useExercises,
  useFavorites,
  useSessionHistory,
  useUserProfile,
} from "../hooks/useQueries";

function formatDate(ts: bigint): string {
  const ms = Number(ts);
  if (ms === 0) return "Never";
  const adjusted = ms > 1e15 ? Math.round(ms / 1e6) : ms;
  return new Date(adjusted).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const { data: profile, isLoading: profileLoading } =
    useUserProfile(isLoggedIn);
  const { data: favorites = [], isLoading: favsLoading } =
    useFavorites(isLoggedIn);
  const { data: sessions = [], isLoading: sessionsLoading } =
    useSessionHistory(isLoggedIn);
  const { data: allExercises = [] } = useExercises();

  const favoriteExercises = allExercises.filter((e) =>
    favorites.some((f) => f === e.id),
  );
  const recentSessions = [...sessions]
    .sort((a, b) => Number(b.completedAt) - Number(a.completedAt))
    .slice(0, 5);

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">✿</span>
        </div>
        <h1 className="font-display font-bold text-3xl text-foreground mb-3">
          Your Dashboard
        </h1>
        <p className="text-muted-foreground font-body text-lg mb-8">
          Sign in to track your progress, view your streaks, and manage your
          favourite exercises.
        </p>
        <button
          type="button"
          className="pill-btn text-base px-10 py-3.5"
          onClick={login}
          disabled={isLoggingIn}
          data-ocid="dashboard.primary_button"
        >
          {isLoggingIn ? "Signing in..." : "Sign In to Continue"}
        </button>
      </div>
    );
  }

  const weeklyGoal = Number(profile?.weeklyGoal ?? 5);
  const weeklyCount = Number(profile?.weeklySessionCount ?? 0);
  const weeklyPct =
    weeklyGoal > 0 ? Math.min((weeklyCount / weeklyGoal) * 100, 100) : 0;
  const streak = Number(profile?.streakCount ?? 0);
  const totalSessions = Number(profile?.totalSessionsCompleted ?? 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-10">
          <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-2">
            My Dashboard
          </h1>
          <p className="text-muted-foreground font-body">
            Track your journey to glowing, toned skin
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div
            className="bg-card rounded-2xl border border-border p-6 shadow-card"
            data-ocid="dashboard.card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <span className="font-body font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                Streak
              </span>
            </div>
            {profileLoading ? (
              <Skeleton
                className="h-10 w-24"
                data-ocid="dashboard.loading_state"
              />
            ) : (
              <>
                <div className="font-display font-bold text-5xl text-foreground mb-1">
                  {streak}
                </div>
                <div className="text-muted-foreground font-body text-sm">
                  {streak === 0
                    ? "Start today!"
                    : streak === 1
                      ? "1 day in a row"
                      : `${streak} days in a row`}
                </div>
              </>
            )}
          </div>

          <div
            className="bg-card rounded-2xl border border-border p-6 shadow-card"
            data-ocid="dashboard.card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <span className="font-body font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                Weekly Goal
              </span>
            </div>
            {profileLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <>
                <div className="font-display font-bold text-5xl text-foreground mb-2">
                  {weeklyCount}
                  <span className="text-2xl text-muted-foreground">
                    /{weeklyGoal}
                  </span>
                </div>
                <Progress value={weeklyPct} className="h-2" />
                <div className="text-muted-foreground font-body text-xs mt-2">
                  {Math.round(weeklyPct)}% complete this week
                </div>
              </>
            )}
          </div>

          <div
            className="bg-card rounded-2xl border border-border p-6 shadow-card"
            data-ocid="dashboard.card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-teal-600" />
              </div>
              <span className="font-body font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                Total Sessions
              </span>
            </div>
            {profileLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <>
                <div className="font-display font-bold text-5xl text-foreground mb-1">
                  {totalSessions}
                </div>
                <div className="text-muted-foreground font-body text-sm">
                  sessions completed
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="h-1.5 leopard-accent" />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <Heart className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-xl text-foreground">
                  Favourite Exercises
                </h2>
              </div>
              {favsLoading ? (
                <div className="space-y-3" data-ocid="dashboard.loading_state">
                  {["a", "b", "c"].map((k) => (
                    <Skeleton key={k} className="h-12 rounded-xl" />
                  ))}
                </div>
              ) : favoriteExercises.length === 0 ? (
                <div
                  className="text-center py-8"
                  data-ocid="dashboard.empty_state"
                >
                  <Heart className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-muted-foreground font-body text-sm">
                    No favourites yet
                  </p>
                  <button
                    type="button"
                    className="pill-btn text-xs mt-3 px-4 py-2"
                    onClick={() => navigate({ to: "/exercises" })}
                    data-ocid="dashboard.button"
                  >
                    Browse Exercises
                  </button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {favoriteExercises.slice(0, 6).map((ex, i) => (
                    <li key={String(ex.id)}>
                      <button
                        type="button"
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                        onClick={() =>
                          navigate({
                            to: "/exercises/$id",
                            params: { id: String(ex.id) },
                          })
                        }
                        data-ocid={`dashboard.item.${i + 1}`}
                      >
                        <span className="text-xl">
                          {AREA_ICONS[ex.targetArea]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-body font-medium text-sm text-foreground truncate">
                            {ex.name}
                          </div>
                          <div className="font-body text-xs text-muted-foreground">
                            {AREA_LABELS[ex.targetArea]} ·{" "}
                            {formatDuration(ex.duration)}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">→</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="h-1.5 leopard-accent" />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-xl text-foreground">
                  Recent Sessions
                </h2>
              </div>
              {sessionsLoading ? (
                <div className="space-y-3" data-ocid="dashboard.loading_state">
                  {["a", "b", "c"].map((k) => (
                    <Skeleton key={k} className="h-12 rounded-xl" />
                  ))}
                </div>
              ) : recentSessions.length === 0 ? (
                <div
                  className="text-center py-8"
                  data-ocid="dashboard.empty_state"
                >
                  <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-muted-foreground font-body text-sm">
                    No sessions yet
                  </p>
                  <button
                    type="button"
                    className="pill-btn text-xs mt-3 px-4 py-2"
                    onClick={() => navigate({ to: "/session" })}
                    data-ocid="dashboard.button"
                  >
                    Start First Session
                  </button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {recentSessions.map((s, i) => (
                    <li
                      key={String(s.sessionId)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40"
                      data-ocid={`dashboard.item.${i + 1}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-body font-medium text-sm text-foreground">
                          {s.exerciseIds.length} exercise
                          {s.exerciseIds.length !== 1 ? "s" : ""}
                        </div>
                        <div className="font-body text-xs text-muted-foreground">
                          {formatDate(s.completedAt)} ·{" "}
                          {Number(s.durationSeconds)}s
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 leopard-accent rounded-2xl p-8 text-center">
          <h3 className="font-display font-bold text-2xl text-warmBrown-900 mb-2">
            Ready to Practice?
          </h3>
          <p className="font-body mb-5" style={{ color: "#3d2010" }}>
            Start a session and keep your streak going
          </p>
          <button
            type="button"
            className="bg-warmBrown-700 text-cream-100 rounded-full px-8 py-3 font-body font-semibold hover:opacity-90 transition-opacity"
            onClick={() => navigate({ to: "/session" })}
            data-ocid="dashboard.primary_button"
          >
            Start Session →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
