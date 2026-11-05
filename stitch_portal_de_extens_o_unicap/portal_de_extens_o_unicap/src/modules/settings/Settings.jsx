import { useState } from "react";
import PropTypes from "prop-types";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { useSession } from "../../contexts/SessionContext";
import {
  Save,
  Shield,
  CheckCircle,
  Mail,
  User,
  Clock,
  Building,
  Settings as SettingsIcon
} from "../../components/ui/Icons";
import useSettings from "./hooks/useSettings";
import { validateSettings, SESSION_TIMEOUT_MINUTES } from "./settingsLogic";
import { NOTIFICATION_OPTIONS, DENSITY_OPTIONS, PROFILE_LABELS } from "./data/settingsOptions";

function ToggleRow({ id, checked, onChange, title, description }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="text-body-md font-semibold text-on-surface">
          {title}
        </label>
        <span className="text-body-sm text-on-surface-variant">{description}</span>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 flex-none cursor-pointer rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-surface-container-highest"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface-container-lowest shadow transition-all ${
            checked ? "left-[1.375rem]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

ToggleRow.propTypes = {
  id: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
};

function SectionCard({ icon: Icon, title, subtitle, children }) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-primary-container text-on-primary shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-headline-md font-semibold text-on-surface">{title}</h2>
          <p className="text-body-sm text-on-surface-variant">{subtitle}</p>
        </div>
      </div>
      <div className="divide-y divide-surface-container-high">{children}</div>
    </Card>
  );
}

SectionCard.propTypes = {
  icon: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  children: PropTypes.node
};

export default function SettingsScreen() {
  const { settings, update, save, discard, reset, isDirty, loading, error, syncedAt, busy } = useSettings();
  const { profile } = useSession();
  const [savedAt, setSavedAt] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const validation = validateSettings(settings);

  const handleSave = async () => {
    if (!validation.ok) { setSaveError(Object.values(validation.errors)[0]); return; }
    const result = await save(settings);
    if (result.ok) {
      setSavedAt(result.savedAt);
      setSaveError(null);
    } else {
      setSavedAt(null);
      setSaveError(result.error);
    }
  };

  const handleReset = async () => {
    const result = await reset();
    if (!result.ok) { setSaveError(result.error); return; }
    setSavedAt(null);
    setSaveError(null);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-label-sm text-on-surface-variant">Módulo de Conta • Todas as áreas</span>
      </div>

      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface">Configurações da Conta</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Gerencie seu perfil e os avisos exibidos no portal. As configurações ficam salvas na sua conta.
        </p>
      </div>

      {loading && <p role="status">Carregando configurações da conta…</p>}
      {(saveError || error) && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
          <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
          {saveError || error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard icon={User} title="Perfil" subtitle="Dados exibidos nos registros de extensão.">
          <div className="flex flex-col gap-4 py-3">
            <Input
              label="Nome de exibição"
              value={settings.displayName}
              onChange={(e) => update({ displayName: e.target.value })}
              placeholder="Como seu nome aparece nos projetos"
              hint="Deixe vazio para usar o nome institucional."
            />
            <Input
              label="E-mail alternativo"
              type="email"
              value={settings.alternateEmail}
              onChange={(e) => update({ alternateEmail: e.target.value })}
              error={validation.errors.alternateEmail}
              hint="Contato secundário disponível para atendimento pela gestão."
            />
          </div>
        </SectionCard>

        <SectionCard icon={Building} title="Vínculo Institucional" subtitle="Somente leitura — gerenciado pela DEG.">
          <div className="flex flex-col gap-4 py-3">
            <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-4 py-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-body-md text-on-surface">Perfil de acesso</span>
              </div>
              <span className="text-body-md font-semibold text-primary">
                {PROFILE_LABELS[profile] || PROFILE_LABELS.estudante}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-4 py-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-body-md text-on-surface">Última sincronização</span>
              </div>
              <span className="text-body-md font-semibold text-primary">{syncedAt ? new Date(syncedAt).toLocaleString("pt-BR") : "Ainda não salva"}</span>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Alterações de vínculo, matrícula e centro devem ser solicitadas à secretaria da DEG.
            </p>
          </div>
        </SectionCard>

        <SectionCard icon={Mail} title="Notificações" subtitle="Escolha os avisos mostrados no menu Avisos. Não são enviados e-mails automáticos.">
          {NOTIFICATION_OPTIONS.map((option) => (
            <ToggleRow
              key={option.id}
              id={`toggle-${option.id}`}
              checked={settings[option.id]}
              onChange={(value) => update({ [option.id]: value })}
              title={option.title}
              description={option.description}
            />
          ))}
        </SectionCard>

        <SectionCard icon={Shield} title="Privacidade & Segurança" subtitle="Controle de sessão e alertas de prazo.">
          <div className="flex flex-col gap-5 py-3">
            <div>
              <label htmlFor="density" className="mb-1 block text-label-sm font-medium text-on-surface">
                Densidade da interface
              </label>
              <select
                id="density"
                value={settings.density}
                onChange={(e) => update({ density: e.target.value })}
                className="input"
              >
                {DENSITY_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              {validation.errors.density && (
                <span className="text-body-sm text-error">{validation.errors.density}</span>
              )}
            </div>

            <Input
              label="Antecedência do alerta de prazos (dias)"
              type="number"
              min="1"
              max="30"
              value={settings.deadlineAlertDays}
              onChange={(e) => update({ deadlineAlertDays: Number(e.target.value) })}
              error={validation.errors.deadlineAlertDays}
            />

            <div>
              <label htmlFor="session-timeout" className="mb-1 block text-label-sm font-medium text-on-surface">
                Encerrar sessão após inatividade
              </label>
              <select
                id="session-timeout"
                value={settings.sessionTimeoutMinutes}
                onChange={(e) => update({ sessionTimeoutMinutes: Number(e.target.value) })}
                className="input"
              >
                {SESSION_TIMEOUT_MINUTES.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} minutos
                  </option>
                ))}
              </select>
            </div>
          </div>
        </SectionCard>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Save className={`h-4 w-4 ${isDirty ? "text-secondary" : "text-teal-700"}`} />
            <span className="text-body-sm text-on-surface-variant">
              {isDirty
                ? "Há alterações não salvas."
                : savedAt
                  ? "Tudo sincronizado."
                  : "Nenhuma alteração pendente."}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleReset} disabled={busy || loading}
              className="gap-2"
              title="Restaura as preferências padrão sem apagar sua conta"
            >
              <SettingsIcon className="h-4 w-4" />
              Restaurar padrões
            </Button>
            <Button variant="outline" onClick={discard} disabled={busy || !isDirty} className="gap-2">
              Descartar
            </Button>
            <Button onClick={handleSave} disabled={busy || loading || !isDirty} className="gap-2">
              {busy ? "Salvando…" : "Salvar configurações"}
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
