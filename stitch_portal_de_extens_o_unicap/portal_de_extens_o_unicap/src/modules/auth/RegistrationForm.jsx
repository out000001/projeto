import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function RegistrationForm({ onBack }) {
  const headingRef = useRef(null);
  const formRef = useRef(null);
  const [confirmationError, setConfirmationError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [profile, setProfile] = useState("estudante");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    headingRef.current?.focus();
    document.title = "Criar conta · Portal de Extensão UNICAP";
    return () => { document.title = "Entrar · Portal de Extensão UNICAP"; };
  }, []);

  useEffect(() => {
    if (loading) return;
    const field = confirmationError ? "confirmation" : codeError ? "managerCode" : null;
    if (field) formRef.current?.elements.namedItem(field)?.focus();
  }, [confirmationError, codeError, loading]);

  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    setError(""); setConfirmationError(""); setCodeError("");
    if (password !== confirmation) {
      setConfirmationError("As senhas não coincidem. Repita a senha informada acima.");
      formRef.current?.elements.namedItem("confirmation")?.focus();
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, profile, ...(profile === "gestor" ? { managerCode: code } : {}) })
      });
      const result = await response.json().catch(() => null);
      if (response.status === 403 && profile === "gestor") {
        setCodeError("Chave inválida. Confira com a coordenação e tente novamente.");
        formRef.current?.elements.namedItem("managerCode")?.focus();
        return;
      }
      if (!response.ok || !result?.ok) throw new Error(result?.error || "Cadastro indisponível. Tente novamente mais tarde.");
      setPassword(""); setConfirmation(""); setCode(""); setSuccess(true);
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Verifique sua conexão e tente novamente." : err.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-form flex flex-col gap-6">
      <div className="auth-heading"><p className="auth-eyebrow text-primary">FAÇA PARTE</p><h1 ref={headingRef} tabIndex={-1} className="font-display text-3xl font-bold">Criar conta</h1><p className="mt-3 text-on-surface-variant">Seu próximo projeto começa com uma conexão.</p></div>
      <p role="status" className="registration-status">{success ? "Cadastro concluído! Entre com seu e-mail e senha para acessar o portal." : loading ? "Criando sua conta. Aguarde…" : ""}</p>
      {success ? (
        <div className="flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6">

          <Button onClick={onBack}>Ir para o login</Button>
        </div>
      ) : (
        <form ref={formRef} onSubmit={submit} aria-busy={loading} className="auth-credentials flex flex-col gap-5">
          <fieldset disabled={loading} className="flex flex-col gap-5">
            <legend className="mb-3 font-semibold">Como você vai participar?</legend>
            <p className="registration-required">Todos os campos são obrigatórios.</p>
            <div className="registration-profiles">
              <label className={profile === "estudante" ? "selected" : ""}><input type="radio" name="registration-profile" value="estudante" checked={profile === "estudante"} onChange={() => { setProfile("estudante"); setCode(""); setError(""); }} /> Aluno / Comunidade</label>
              <label className={profile === "gestor" ? "selected" : ""}><input type="radio" name="registration-profile" value="gestor" checked={profile === "gestor"} onChange={() => { setProfile("gestor"); setError(""); }} /> Gestor / Docente</label>
            </div>
            <Input name="name" label="Nome completo" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required />
            <Input name="email" spellCheck={false} label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} required />
            <Input name="password" label="Senha" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} maxLength={128} hint="Use pelo menos 8 caracteres." required />
            <Input name="confirmation" error={confirmationError} label="Confirmar senha" type="password" autoComplete="new-password" value={confirmation} onChange={(e) => { setConfirmation(e.target.value); setConfirmationError(""); }} minLength={8} maxLength={128} required />
            {profile === "gestor" && <Input name="managerCode" error={codeError} spellCheck={false} label="Chave de cadastro de gestor" type="password" autoComplete="off" value={code} onChange={(e) => { setCode(e.target.value); setCodeError(""); }} maxLength={256} hint="Solicite a chave à coordenação do portal." required />}
          </fieldset>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">{error}</p>}
          <Button type="submit" aria-disabled={loading}>{loading ? "Criar conta — aguarde…" : "Criar conta"}</Button>
          <Button type="button" variant="outline" onClick={onBack} disabled={loading}>Já tenho conta — Entrar</Button>
        </form>
      )}
    </div>
  );
}
RegistrationForm.propTypes = { onBack: PropTypes.func.isRequired };
