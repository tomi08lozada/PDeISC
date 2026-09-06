import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { api, type User } from "../api";
import { useSession } from "../context";
import { labels, type Page } from "../shared";
import { Alert } from "../components/Common";
import { Workspace } from "../components/Workspace";
import { Overview } from "../pages/Overview";
import { Profile } from "../pages/Profile";
import { UserList } from "../pages/Users";
export function Screens({ page, go }: { page: Page; go: (p: Page) => void }) {
  const { user } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(user?.role === "admin");
  const [error, setError] = useState("");
  async function reload() {
    try {
      if (user?.role === "admin") setUsers(await api<User[]>("/users/list"));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void reload();
  }, [user?.id, user?.role]);
  if (page === "profile") return <Profile />;
  if (loading)
    return (
      <div className="panel" role="status">
        Cargando tu espacio…
      </div>
    );
  if (error)
    return (
      <section className="panel">
        <Alert text={error} />
        <button className="btn btn-primary" onClick={reload}>
          Reintentar
        </button>
      </section>
    );
  return page === "users" && user?.role === "admin" ? (
    <UserList users={users} reload={reload} />
  ) : (
    <Overview users={users} go={go} />
  );
}

export function RouterVersion({ setMode }: { setMode: (m: string) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSession();
  const page = (location.pathname.slice(1) || "overview") as Page;
  const go = (p: Page) => navigate("/" + p);
  return (
    <Workspace
      page={labels[page] ? page : "overview"}
      go={go}
      mode="router"
      setMode={setMode}
    >
      <Routes>
        <Route path="/overview" element={<Screens page="overview" go={go} />} />
        <Route
          path="/users"
          element={
            user?.role === "admin" ? (
              <Screens page="users" go={go} />
            ) : (
              <Navigate to="/profile" replace />
            )
          }
        />
        <Route path="/profile" element={<Screens page="profile" go={go} />} />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </Workspace>
  );
}

export function StateVersion({ setMode }: { setMode: (m: string) => void }) {
  const [page, setPage] = useState<Page>("overview");
  return (
    <Workspace page={page} go={setPage} mode="state" setMode={setMode}>
      <Screens page={page} go={setPage} />
    </Workspace>
  );
}
