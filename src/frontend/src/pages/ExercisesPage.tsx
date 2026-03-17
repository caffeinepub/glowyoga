import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { TargetArea } from "../backend.d";
import ExerciseCard from "../components/ExerciseCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useExercises,
  useFavorites,
  useToggleFavorite,
} from "../hooks/useQueries";

const TABS = [
  { value: "all", label: "All" },
  { value: TargetArea.forehead, label: "Forehead" },
  { value: TargetArea.eyes, label: "Eyes" },
  { value: TargetArea.cheeks, label: "Cheeks" },
  { value: TargetArea.jawline, label: "Jawline" },
  { value: TargetArea.neck, label: "Neck" },
  { value: TargetArea.fullFace, label: "Full Face" },
];

export default function ExercisesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const { data: exercises = [], isLoading } = useExercises();
  const { data: favorites = [] } = useFavorites(isLoggedIn);
  const toggleFav = useToggleFavorite();

  const filtered = exercises.filter((ex) => {
    const matchArea = activeTab === "all" || ex.targetArea === activeTab;
    const matchSearch =
      search === "" ||
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.description.toLowerCase().includes(search.toLowerCase());
    return matchArea && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-3">
              Exercise Library
            </h1>
            <p className="text-muted-foreground font-body text-lg">
              {exercises.length} exercises targeting every facial muscle group
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 rounded-full bg-card border-border font-body"
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="exercises.search_input"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2" data-ocid="exercises.tab">
          {TABS.map((tab) => (
            <button
              type="button"
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              data-ocid="exercises.tab"
              className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-all ${
                activeTab === tab.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border text-foreground/70 hover:text-foreground hover:border-primary/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          data-ocid="exercises.loading_state"
        >
          {["a", "b", "c", "d", "e", "f", "g", "h"].map((k) => (
            <div
              key={k}
              className="bg-card rounded-2xl border border-border h-80 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24" data-ocid="exercises.empty_state">
          <div className="text-6xl mb-4">✿</div>
          <h3 className="font-display font-semibold text-xl text-foreground mb-2">
            No exercises found
          </h3>
          <p className="text-muted-foreground font-body">
            Try adjusting your search or filter
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + search}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {filtered.map((ex, i) => (
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
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
