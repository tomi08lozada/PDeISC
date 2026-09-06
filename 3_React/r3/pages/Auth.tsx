import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowUpRight, Check, ShieldCheck, Users } from "lucide-react";
import { api } from "../api";
import { useSession } from "../context";
import type { FormData } from "../shared";
import { AccountFields, Alert, Brand, ThemeButton } from "../components/Common";
export function Auth() {
  const { refresh, error: connectionError } = useSession();
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const form = useForm<FormData>({
    shouldUnregister: true,
    defaultValues: { department: "General" },
  });
  async function submit(data: FormData) {
    setError("");
    setSuccess("");
    try {
      if (registering) {
        const r = await api("/auth/register", data);
        setSuccess(r.message);
        setRegistering(false);
        form.reset();
      } else {
        await api("/auth/login", data);
        await refresh();
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <Brand />
        <div>
          <span className="eyebrow">PERSONAS. CONEXIONES. POSIBILIDADES.</span>
          <h1>
            Un equipo conectado.
            <br />
            <em>Todo en su lugar.</em>
          </h1>
          <p>
            Un espacio simple y seguro para gestionar las personas que hacen
            crecer tu organización.
          </p>
          <div className="orbit">
            <div className="orbit-center">
              <Users size={44} />
            </div>
            <span className="orbit-label first">
              <ShieldCheck size={18} /> Acceso protegido
            </span>
            <span className="orbit-label second">
              <Check size={18} /> Tu equipo, conectado
            </span>
          </div>
        </div>
        <small>NEXO WORKSPACE / GESTIÓN DE USUARIOS</small>
      </aside>
      <main className="auth-main">
        <div className="auth-top">
          <span>Tu espacio de trabajo</span>
          <ThemeButton />
        </div>
        <div className="auth-card">
          <span className="mini-tag">BIENVENIDO A NEXO</span>
          <h2>{registering ? "Creá tu cuenta" : "Qué bueno verte de nuevo"}</h2>
          <p className="muted">
            {registering
              ? "Sumate al espacio de trabajo de tu equipo."
              : "Ingresá tus datos para acceder a tu espacio."}
          </p>
          <Alert text={error || connectionError} />
          <Alert text={success} good />
          <form onSubmit={form.handleSubmit(submit)}>
            {registering ? (
              <AccountFields form={form} password />
            ) : (
              <>
                <label className="form-label">
                  Correo electrónico
                  <input
                    type="email"
                    className="form-control"
                    placeholder="nombre@empresa.com"
                    autoComplete="username"
                    {...form.register("email", { required: true })}
                    required
                  />
                </label>
                <label className="form-label">
                  Contraseña
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Tu contraseña"
                    autoComplete="current-password"
                    {...form.register("password", { required: true })}
                    required
                  />
                </label>
              </>
            )}
            <button
              className="btn btn-primary w-100 mt-3"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Procesando…"
                : registering
                  ? "Crear cuenta"
                  : "Ingresar al espacio"}{" "}
              <ArrowUpRight size={18} />
            </button>
          </form>
          <p className="auth-switch">
            {registering
              ? "¿Ya tenés una cuenta?"
              : "¿Todavía no tenés cuenta?"}{" "}
            <button
              onClick={() => {
                setRegistering(!registering);
                setError("");
                setSuccess("");
                form.reset();
              }}
            >
              {registering ? "Iniciá sesión" : "Registrate"}
            </button>
          </p>
          <div className="secure-note">
            <ShieldCheck size={17} /> Tus datos, protegidos en cada paso.
          </div>
        </div>
        <small className="auth-footer">
          Hecho para personas. Diseñado para conectar.
        </small>
      </main>
    </div>
  );
}
