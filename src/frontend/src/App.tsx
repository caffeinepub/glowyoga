import { Toaster } from "@/components/ui/sonner";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useLocation,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import ExerciseDetailPage from "./pages/ExerciseDetailPage";
import ExercisesPage from "./pages/ExercisesPage";
import HomePage from "./pages/HomePage";
import SessionPage from "./pages/SessionPage";

export { Link, useNavigate, useParams, useLocation };

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster richColors position="bottom-right" />
    </div>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const exercisesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/exercises",
  component: ExercisesPage,
});

const exerciseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/exercises/$id",
  component: ExerciseDetailPage,
});

const sessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/session",
  component: SessionPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  exercisesRoute,
  exerciseDetailRoute,
  sessionRoute,
  dashboardRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
