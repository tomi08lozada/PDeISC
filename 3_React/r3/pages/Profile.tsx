import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "../api";
import { useSession } from "../context";
import { date, initials, type FormData } from "../shared";
import { AccountFields, Alert, Role } from "../components/Common";
export function Profile() {
  const { user, refresh } = useSession();
  const form = useForm<FormData>({ defaultValues: user! });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function submit(data: FormData) {
    setError("");
    setSuccess("");
    try {
      await api("/profile/update", data);
      await refresh();
      setSuccess("Tu perfil se actualizó correctamente.");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className="row g-4">
      <div className="col-lg-4">
        <section className="panel profile-summary">
          <span className="avatar large">{initials(user!.name)}</span>
          <h3>{user!.name}</h3>
          <p className="muted">{user!.email}</p>
          <Role role={user!.role} />
          <hr />
          <small className="muted">
            Parte del equipo desde {date(user!.created_at)}
          </small>
        </section>
      </div>
      <div className="col-lg-8">
        <section className="panel">
          <h3>Información personal</h3>
          <p className="muted">Mantené tus datos al día.</p>
          <Alert text={error} />
          <Alert text={success} good />
          <form onSubmit={form.handleSubmit(submit)}>
            <AccountFields form={form} />
            <button
              className="btn btn-primary mt-3"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Guardando…" : "Guardar cambios"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
