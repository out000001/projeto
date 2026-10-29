import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../contexts/SessionContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Shield, Lock, LockOpen, Mail, Eye, EyeOff } from "../../components/ui/Icons";

const profiles = [
  {
    id: "gestor",
    label: "Gestor / Docente",
    description: "Coordenadores, professores extensionistas e gestores da DEG.",
    color: "bg-primary-container text-on-primary",
    icon: Shield
  },
  {
    id: "estudante",
    label: "Estudante / Comunidade",
    description: "Alunos UNICAP e voluntários da sociedade civil.",
    color: "bg-secondary-container text-on-secondary-container",
    icon: LockOpen
  }
];

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, loading, isAuthenticated } = useSession();
  const [profile, setProfile] = useState("gestor");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSession, setKeepSession] = useState(true);
  const [formError, setFormError] = useState(null);

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    // O servidor é a autoridade: o perfil vem do back-end (credencial), não do
    // cartão selecionado — que vira apenas uma dica visual.
    const result = await login(identifier, password, { persist: keepSession });
    if (!result.ok) {
      setFormError(result.error || "Não foi possível fazer login.");
      return;
    }

    // Cada perfil segue para a sua área inicial.
    navigate(result.user.profile === "gestor" ? "/dashboard" : "/public", { replace: true });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface">
          Portal de Extensão Comunitária
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-body-md text-on-surface-variant">
          Identificação preliminar de segurança. Selecione seu perfil de vínculo institucional para carregar as permissões e telas exclusivas autorizadas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {profiles.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setProfile(item.id)}
            className={`flex cursor-pointer flex-col gap-3 rounded-xl border-2 p-5 text-left transition-colors ${
              profile === item.id
                ? "border-primary bg-surface-container-lowest shadow-sm"
                : "border-transparent hover:bg-surface-container-lowest/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg shadow-sm ${item.color}`}>
                <span className="material-symbols-outlined text-lg">
                  {item.icon === Shield ? "shield_person" : "school"}
                </span>
              </div>
              <div className={`flex h-3 w-3 items-center justify-center rounded-full ${
                profile === item.id ? "bg-primary ring-2 ring-primary/20" : "bg-surface-dim"
              }`} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label-lg font-bold text-on-surface">{item.label}</span>
              <span className="text-label-sm text-primary font-medium">
                {item.id === "gestor" ? "Coordenação & Parecer" : "Discentes & Público"}
              </span>
              <p className="text-body-sm text-on-surface-variant">{item.description}</p>
            </div>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-xl border border-surface-container-high bg-surface-container-lowest p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          <span className="font-label-md font-semibold text-on-surface">Credenciais de Acesso</span>
        </div>

        {formError && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
            {formError}
          </div>
        )}

        <Input
          label="Login Institucional (@unicap.br) ou Matrícula Docente"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Ex: prof.sobrenome@unicap.br ou 202010482"
          required
          hint="Credencial de servidor ou matrícula"
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="font-label-md font-semibold text-on-surface" htmlFor="password">
              Senha de Acesso
            </label>
            <a
              className="text-sm text-primary font-semibold hover:underline"
              href="mailto:extensao@unicap.br?subject=Recupera%C3%A7%C3%A3o%20de%20senha%20%E2%80%94%20Portal%20de%20Extens%C3%A3o"
            >
              Esqueceu a senha?
            </a>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-lg border border-surface-container-highest bg-surface-container-low px-10 pr-11 text-body-md text-on-surface placeholder:text-on-surface-variant/70 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-container"
              placeholder="••••••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-body-sm text-on-surface-variant">
          <input
            type="checkbox"
            className="h-4 w-4 rounded accent-primary"
            checked={keepSession}
            onChange={(event) => setKeepSession(event.target.checked)}
          />
          Manter sessão conectada com segurança
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
            {loading ? "Entrando..." : "Entrar no Painel de Gestão"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/public")} className="gap-2">
            <Mail className="h-4 w-4" />
            Acesso público
          </Button>
        </div>
      </form>

      <p className="text-center text-body-sm text-on-surface-variant">
        Dúvidas sobre credenciamento?{" "}
        <a className="text-primary font-semibold hover:underline" href="mailto:extensao@unicap.br">
          Suporte Técnico DEG
        </a>
      </p>
    </div>
  );
}
