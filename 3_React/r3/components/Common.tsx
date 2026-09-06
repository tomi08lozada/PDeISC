import { Moon, Sun } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSession } from "../context";
import type { FormData } from "../shared";
export function Alert({
  text,
  good = false,
}: {
  text: string;
  good?: boolean;
}) {
  return text ? (
    <div
      role={good ? "status" : "alert"}
      className={`alert ${good ? "alert-success" : "alert-danger"} py-2`}
    >
      {text}
    </div>
  ) : null;
}

export function ThemeButton() {
  const { theme, toggleTheme } = useSession();
  return (
    <button
      className="icon-button"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Activar modo noche" : "Activar modo día"}
    >
      {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
    </button>
  );
}

export function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">n</span> nexo
      <span className="brand-dot">.</span>
    </div>
  );
}

export function AccountFields({
  form,
  password = false,
  role = false,
}: {
  form: ReturnType<typeof useForm<FormData>>;
  password?: boolean;
  role?: boolean;
}) {
  const {
    register,
    formState: { errors },
  } = form;
  return (
    <>
      <label className="form-label">
        Nombre completo
        <input
          className="form-control"
          autoComplete="name"
          {...register("name", {
            required: "Ingresá tu nombre.",
            minLength: { value: 2, message: "Mínimo 2 caracteres." },
            maxLength: 100,
          })}
        />
      </label>
      <small className="field-error">{errors.name?.message}</small>
      <label className="form-label">
        Correo electrónico
        <input
          type="email"
          className="form-control"
          autoComplete="email"
          {...register("email", {
            required: "Ingresá un correo.",
            maxLength: 190,
          })}
        />
      </label>
      <small className="field-error">{errors.email?.message}</small>
      <label className="form-label">
        Área / departamento
        <input
          className="form-control"
          placeholder="Ej. Diseño"
          {...register("department", { maxLength: 80 })}
        />
      </label>
      {password && (
        <>
          <label className="form-label">
            Contraseña
            <input
              type="password"
              className="form-control"
              autoComplete="new-password"
              {...register("password", {
                required: "Ingresá una contraseña.",
                minLength: {
                  value: 10,
                  message: "Usá al menos 10 caracteres.",
                },
                maxLength: { value: 72, message: "Máximo 72 caracteres." },
              })}
            />
          </label>
          <small className="field-error">
            {errors.password?.message || "Al menos 10 caracteres."}
          </small>
        </>
      )}
      {role && (
        <label className="form-label">
          Rol
          <select className="form-select" {...register("role")}>
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </label>
      )}
    </>
  );
}

export function Role({ role }: { role: string }) {
  return (
    <span className={`role-badge ${role === "admin" ? "admin" : ""}`}>
      {role === "admin" ? "Administrador" : "Usuario"}
    </span>
  );
}
