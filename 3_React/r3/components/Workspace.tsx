import { useEffect, useState, type ReactNode } from "react";
import {
  ChevronRight,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { useSession } from "../context";
import { initials, labels, type Page } from "../shared";
import { Alert, Brand, ThemeButton } from "./Common";
export function Workspace({
  page,
  go,
  mode,
  setMode,
  children,
}: {
  page: Page;
  go: (p: Page) => void;
  mode: string;
  setMode: (m: string) => void;
  children: ReactNode;
}) {
  const { user, logout } = useSession();
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState("");
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="workspace">
      <aside className="sidebar">
        <Brand />
        <div className="workspace-label">
          <span className="workspace-square">N</span>
          <div>
            Mi organización<small>Espacio de trabajo</small>
          </div>
          <ShieldCheck size={16} />
        </div>
        <span className="nav-caption">PRINCIPAL</span>
        <nav>
          {(
            [
              "overview",
              ...(user!.role === "admin" ? ["users"] : []),
              "profile",
            ] as Page[]
          ).map((p) => (
            <button
              className={page === p ? "active" : ""}
              key={p}
              onClick={() => go(p)}
            >
              {p === "overview" ? (
                <LayoutDashboard size={19} />
              ) : p === "users" ? (
                <Users size={19} />
              ) : (
                <UserRound size={19} />
              )}
              {labels[p]}
              {page === p && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="version-box">
            <span className="nav-caption">VERSIÓN DEL SISTEMA</span>
            <div className="version-toggle">
              <button
                className={mode === "router" ? "selected" : ""}
                onClick={() => setMode("router")}
              >
                Router
              </button>
              <button
                className={mode === "state" ? "selected" : ""}
                onClick={() => setMode("state")}
              >
                useState
              </button>
            </div>
            <small>Mismo espacio. Dos navegaciones.</small>
          </div>
          <div className="sidebar-note">
            <CircleHelp size={17} /> Tu equipo, en un solo lugar.
          </div>
          <button
            className="logout-button"
            onClick={async () => {
              try {
                await logout();
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="topbar">
          <span>
            Espacio de trabajo <ChevronRight size={14} />{" "}
            <strong>{labels[page]}</strong>
          </span>
          <div className="d-flex align-items-center gap-3">
            <ThemeButton />
            <span className="topbar-separator" />
            <span className="avatar small">{initials(user!.name)}</span>
            <div className="header-user">
              <strong>{user!.name}</strong>
              <small>
                {user!.role === "admin" ? "Administrador" : "Usuario"}
              </small>
            </div>
          </div>
        </header>
        <main className="content">
          <div className="page-heading">
            <div>
              <span className="mini-tag">TU EQUIPO, MÁS CERCA</span>
              <h1>
                {page === "overview"
                  ? `Hola, ${user!.name.split(" ")[0]} 👋`
                  : labels[page]}
              </h1>
              {page === "overview" && (
                <p className="muted">
                  Este es el pulso de tu espacio de trabajo.
                </p>
              )}
            </div>
            <time dateTime={now.toISOString()}>
              {now.toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </div>
          <Alert text={error} />
          {children}
          <footer className="content-footer">
            <span>
              nexo. <span className="muted">Personas que conectan.</span>
            </span>
            <span className="muted">
              {mode === "router" ? "React Router" : "useState"}{" "}
              <span className="footer-dot">•</span> Sesión protegida{" "}
              <ShieldCheck size={13} />
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
