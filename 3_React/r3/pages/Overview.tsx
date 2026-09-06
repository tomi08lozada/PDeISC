import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { User } from "../api";
import { useSession } from "../context";
import { initials, type Page } from "../shared";
import { Role } from "../components/Common";
export function Overview({
  users,
  go,
}: {
  users: User[];
  go: (p: Page) => void;
}) {
  const { user } = useSession();
  const isAdmin = user?.role === "admin";
  return (
    <>
      <div className="welcome-banner">
        <div>
          <span className="eyebrow">UN ESPACIO, TODO TU EQUIPO</span>
          <h2>
            Las buenas conexiones
            <br />
            empiezan acá.
          </h2>
          <p>Personas organizadas. Accesos seguros. Más posibilidades.</p>
          <button
            className="btn btn-light"
            onClick={() => go(isAdmin ? "users" : "profile")}
          >
            {isAdmin ? "Gestionar usuarios" : "Ver mi perfil"}{" "}
            <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="banner-art" aria-hidden="true">
          <div className="art-ring" />
          <div className="art-card">
            <Users size={42} />
            <span>Mejor, juntos.</span>
            <div className="avatar-stack">
              <i>✦</i>
              <i>n</i>
              <i>+</i>
            </div>
          </div>
        </div>
      </div>
      <div className="row g-3 my-2">
        <Stat
          title={isAdmin ? "Usuarios del espacio" : "Mi cuenta"}
          value={isAdmin ? String(users.length) : "Activa"}
          caption={
            isAdmin ? "Personas conectadas a Nexo" : "Tu espacio está listo"
          }
          icon={<Users />}
        />
        <Stat
          title={isAdmin ? "Administradores" : "Tipo de acceso"}
          value={
            isAdmin
              ? String(users.filter((u) => u.role === "admin").length)
              : "Usuario"
          }
          caption="Accesos definidos por rol"
          icon={<ShieldCheck />}
        />
        <Stat
          title="Protección de datos"
          value="Activada"
          caption="Sesión segura y persistente"
          icon={<Check />}
        />
      </div>
      <div className="row g-4 mt-1">
        <div className="col-lg-8">
          <section className="panel">
            <div className="panel-title">
              <div>
                <h3>
                  {isAdmin ? "Últimas incorporaciones" : "Tu información"}
                </h3>
                <p>
                  {isAdmin
                    ? "El equipo sigue conectando."
                    : "Un perfil que te representa."}
                </p>
              </div>
              <button
                className="text-button"
                onClick={() => go(isAdmin ? "users" : "profile")}
              >
                Ver {isAdmin ? "todos" : "perfil"} <ChevronRight size={16} />
              </button>
            </div>
            {isAdmin ? (
              users.length ? (
                [...users]
                  .sort((a, b) => b.id - a.id)
                  .slice(0, 4)
                  .map((u) => (
                    <div className="person-row" key={u.id}>
                      <span className="avatar">{initials(u.name)}</span>
                      <div className="flex-grow-1">
                        <strong>{u.name}</strong>
                        <small>{u.email}</small>
                      </div>
                      <Role role={u.role} />
                    </div>
                  ))
              ) : (
                <p className="muted">Todavía no hay usuarios para mostrar.</p>
              )
            ) : (
              <div className="person-row">
                <span className="avatar">{initials(user!.name)}</span>
                <div>
                  <strong>{user!.name}</strong>
                  <small>{user!.email}</small>
                </div>
              </div>
            )}
          </section>
        </div>
        <div className="col-lg-4">
          <section className="tip-card">
            <span className="tip-icon">
              <ShieldCheck />
            </span>
            <h3>
              La confianza es parte
              <br />
              del equipo.
            </h3>
            <p>
              Los permisos por rol mantienen la información en las manos
              correctas.
            </p>
            <div className="tip-line">
              <span className="status-dot" /> Acceso verificado
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export function Stat({
  title,
  value,
  caption,
  icon,
}: {
  title: string;
  value: string;
  caption: string;
  icon: ReactNode;
}) {
  return (
    <div className="col-md-4">
      <section className="stat-card">
        <div className="stat-heading">
          {title}
          <span>{icon}</span>
        </div>
        <strong>{value}</strong>
        <small>{caption}</small>
      </section>
    </div>
  );
}
