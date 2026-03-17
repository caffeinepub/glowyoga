import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type Exercise,
  type Session,
  TargetArea,
  type UserProfile,
} from "../backend.d";
import { EXERCISES } from "../data/exercises";
import { useActor } from "./useActor";

export function useExercises() {
  return {
    data: EXERCISES as Exercise[],
    isLoading: false,
  };
}

export function useExercisesByArea(area: TargetArea) {
  return {
    data: EXERCISES.filter((ex) => ex.targetArea === area) as Exercise[],
    isLoading: false,
  };
}

export function useFavorites(loggedIn: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFavorites();
    },
    enabled: !!actor && !isFetching && loggedIn,
  });
}

export function useSessionHistory(loggedIn: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<Session[]>({
    queryKey: ["sessionHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSessionHistory();
    },
    enabled: !!actor && !isFetching && loggedIn,
  });
}

export function useUserProfile(loggedIn: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserProfileOrCreate();
    },
    enabled: !!actor && !isFetching && loggedIn,
  });
}

export function useToggleFavorite() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (exerciseId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.toggleFavorite(exerciseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

export function useRecordSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      exerciseIds,
      duration,
    }: { exerciseIds: bigint[]; duration: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.recordSession(exerciseIds, duration);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessionHistory"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export { TargetArea };
