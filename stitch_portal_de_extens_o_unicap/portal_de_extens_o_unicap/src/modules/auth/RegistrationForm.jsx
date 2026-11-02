import { useState } from "react";
import PropTypes from "prop-types";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function RegistrationForm({ onBack }) {
  const [profile, setProfile] = useState("estudante");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    setError("");
    if (password !== confirmation) { setError("As senhas não coincidem."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, profile, ...(profile === "gestor" ? { managerCode: code } : {}) })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) throw new Error(result?.error || "Cadastro indisponível. Tente novamente mais tarde.");
      setPassword(""); setConfirmation(""); setCode(""); setSuccess(true);
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Verifique sua conexão e tente novamente." : err.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-center font-display text-3xl font-bold">Criar conta</h1>
      {success ? (
        <div className="flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6">
          <p role="status">Cadastro concluído! Entre com seu e-mail e senha para acessar o portal.</p>
          <Button onClick={onBack}>Ir para o login</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-5 rounded-xl border border-surface-container-high bg-surface-container-lowest p-6 shadow-sm">
          <fieldset disabled={loading} className="flex flex-col gap-5">
            <legend className="mb-3 font-semibold">Como você vai participar?</legend>
            <div className="flex flex-wrap gap-4">
              <label><input type="radio" name="registration-profile" value="estudante" checked={profile === "estudante"} onChange={() => { setProfile("estudante"); setCode(""); setError(""); }} /> Aluno / Comunidade</label>
              <label><input type="radio" name="registration-profile" value="gestor" checked={profile === "gestor"} onChange={() => { setProfile("gestor"); setError(""); }} /> Gestor / Docente</label>
            </div>
            <Input label="Nome completo" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required />
            <Input label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} required />
            <Input label="Senha" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} maxLength={128} hint="Use pelo menos 8 caracteres." required />
            <Input label="Confirmar senha" type="password" autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} minLength={8} maxLength={128} required />
            {profile === "gestor" && <Input label="Chave de cadastro de gestor" type="password" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} maxLength={256} hint="Solicite a chave à coordenação do portal." required />}
          </fieldset>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">{error}</p>}
          <Button type="submit" disabled={loading}>{loading ? "Criando conta..." : "Criar conta"}</Button>
          <Button type="button" variant="outline" onClick={onBack} disabled={loading}>Já tenho conta — Entrar</Button>
        </form>
      )}
    </div>
  );
}
RegistrationForm.propTypes = { onBack: PropTypes.func.isRequired };
