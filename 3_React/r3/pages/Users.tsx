import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowDown,
  ArrowUp,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { api, type User } from "../api";
import { useSession } from "../context";
import { date, initials, type FormData } from "../shared";
import { AccountFields, Alert, Role } from "../components/Common";
export function UserList({
  users,
  reload,
}: {
  users: User[];
  reload: () => Promise<void>;
}) {
  const { user, refresh } = useSession();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"name" | "email" | "role" | "created_at">(
    "name",
  );
  const [ascending, setAscending] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<User | "new" | null>(null);
  const [removing, setRemoving] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const visible = users
    .filter(
      (u) =>
        (filter === "all" || u.role === filter) &&
        `${u.name} ${u.email} ${u.department}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort(
      (a, b) =>
        String(a[sort]).localeCompare(String(b[sort]), "es", {
          numeric: true,
        }) * (ascending ? 1 : -1),
    );
  async function remove() {
    setBusy(true);
    setError("");
    try {
      await api("/users/delete", { id: removing!.id });
      setRemoving(null);
      setSuccess("Usuario eliminado.");
      await reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="section-intro">
        <p className="muted">
          Administrá las personas y los permisos de tu espacio.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => {
            setError("");
            setEditing("new");
          }}
        >
          <Plus size={18} /> Nuevo usuario
        </button>
      </div>
      <Alert text={error} />
      <Alert text={success} good />
      <section className="panel user-panel">
        <div className="table-tools">
          <div className="search-box">
            <Search size={18} />
            <input
              aria-label="Buscar usuarios"
              placeholder="Buscar por nombre, correo o área…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select filter-select"
            aria-label="Filtrar por rol"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="user">Usuarios</option>
          </select>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                {(["name", "email", "role", "created_at"] as const).map(
                  (key, i) => (
                    <th
                      key={key}
                      aria-sort={
                        sort === key
                          ? ascending
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <button
                        onClick={() => {
                          setSort(key);
                          setAscending(sort === key ? !ascending : true);
                        }}
                      >
                        {
                          [
                            "Nombre",
                            "Correo electrónico",
                            "Rol",
                            "Fecha de alta",
                          ][i]
                        }
                        {sort === key &&
                          (ascending ? (
                            <ArrowUp size={13} />
                          ) : (
                            <ArrowDown size={13} />
                          ))}
                      </button>
                    </th>
                  ),
                )}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <span className="avatar">{initials(u.name)}</span>
                      <div>
                        <strong>
                          {u.name}{" "}
                          {u.id === user!.id && (
                            <small className="muted">(vos)</small>
                          )}
                        </strong>
                        <small className="d-block muted">
                          {u.department || "General"}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td className="muted">{u.email}</td>
                  <td>
                    <Role role={u.role} />
                  </td>
                  <td className="muted text-nowrap">{date(u.created_at)}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className="icon-button"
                        aria-label={`Editar a ${u.name}`}
                        onClick={() => setEditing(u)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-button danger"
                        disabled={u.id === user!.id}
                        aria-label={`Eliminar a ${u.name}`}
                        onClick={() => {
                          setError("");
                          setRemoving(u);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!visible.length && (
          <div className="empty-state">
            <Users size={36} />
            <h3>No encontramos usuarios</h3>
            <p>Probá con otra búsqueda o agregá una persona al espacio.</p>
          </div>
        )}
        <div className="table-footer">
          {visible.length} de {users.length} usuarios{" "}
          <span>Orden {ascending ? "ascendente" : "descendente"}</span>
        </div>
      </section>
      {editing && (
        <UserModal
          value={editing}
          close={() => setEditing(null)}
          done={async () => {
            setEditing(null);
            setSuccess("Los cambios se guardaron correctamente.");
            await reload();
            await refresh();
          }}
        />
      )}
      {removing && (
        <Modal
          title="¿Eliminar usuario?"
          close={() => !busy && setRemoving(null)}
        >
          <p>
            Vas a eliminar la cuenta de <strong>{removing.name}</strong> y sus
            sesiones. Esta acción no se puede deshacer.
          </p>
          <Alert text={error} />
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-outline-secondary"
              disabled={busy}
              onClick={() => setRemoving(null)}
            >
              Cancelar
            </button>
            <button className="btn btn-danger" disabled={busy} onClick={remove}>
              {busy ? "Eliminando…" : "Eliminar usuario"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

export function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, []);
  return (
    <div className="modal-shade">
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={(event) => {
          if (event.key === "Escape") close();
          if (event.key !== "Tab") return;
          const fields = event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input, select, [tabindex="0"]',
          );
          const first = fields[0];
          const last = fields[fields.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <div className="panel-title">
          <h3>{title}</h3>
          <button
            autoFocus
            className="icon-button"
            onClick={close}
            aria-label="Cerrar"
          >
            <X size={21} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function UserModal({
  value,
  close,
  done,
}: {
  value: User | "new";
  close: () => void;
  done: () => Promise<void>;
}) {
  const form = useForm<FormData>({
    defaultValues:
      value === "new" ? { role: "user", department: "General" } : value,
  });
  const [error, setError] = useState("");
  async function submit(data: FormData) {
    try {
      await api(value === "new" ? "/users/create" : "/users/update", {
        ...data,
        ...(value !== "new" ? { id: value.id } : {}),
      });
      await done();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Modal
      title={value === "new" ? "Sumar una persona" : "Editar usuario"}
      close={() => !form.formState.isSubmitting && close()}
    >
      <Alert text={error} />
      <form onSubmit={form.handleSubmit(submit)}>
        <AccountFields form={form} password={value === "new"} role />
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={close}
            disabled={form.formState.isSubmitting}
          >
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Guardando…" : "Guardar usuario"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
