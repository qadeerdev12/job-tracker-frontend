import { useState, useEffect, lazy, Suspense } from "react";
import { supabase } from "./lib/supabase";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";

const Dashboard = lazy(() => import("./components/Dashboard"));

const LoadingScreen = () => (
  <div className="min-h-screen bg-page flex items-center justify-center">
    <div className="text-brand-600 text-lg font-semibold">Loading...</div>
  </div>
);

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("landing");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") document.documentElement.classList.add("dark");

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <LoadingScreen />;

  if (session) return (
    <Suspense fallback={<LoadingScreen />}>
      <Dashboard />
    </Suspense>
  );

  if (page === "landing") return <LandingPage setPage={setPage} />;
  if (page === "register") return <Register setPage={setPage} />;
  return <Login setPage={setPage} />;
}

export default App;
