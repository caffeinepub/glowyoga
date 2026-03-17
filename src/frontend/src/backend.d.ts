import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Session {
    completedAt: bigint;
    exerciseIds: Array<bigint>;
    durationSeconds: bigint;
    sessionId: bigint;
}
export interface Exercise {
    id: bigint;
    duration: bigint;
    difficulty: Difficulty;
    name: string;
    tips: string;
    description: string;
    instructions: Array<string>;
    targetArea: TargetArea;
}
export interface UserProfile {
    weeklyGoal: bigint;
    totalSessionsCompleted: bigint;
    lastSessionDate: bigint;
    weeklySessionCount: bigint;
    streakCount: bigint;
}
export enum Difficulty {
    intermediate = "intermediate",
    beginner = "beginner",
    advanced = "advanced"
}
export enum TargetArea {
    eyes = "eyes",
    neck = "neck",
    fullFace = "fullFace",
    cheeks = "cheeks",
    jawline = "jawline",
    forehead = "forehead"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExercises(): Promise<Array<Exercise>>;
    getExercisesByArea(area: TargetArea): Promise<Array<Exercise>>;
    getFavorites(): Promise<Array<bigint>>;
    getSessionHistory(): Promise<Array<Session>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserProfileOrCreate(): Promise<UserProfile>;
    isCallerAdmin(): Promise<boolean>;
    recordSession(exerciseIds: Array<bigint>, duration: bigint): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleFavorite(exerciseId: bigint): Promise<void>;
}
