import {render,screen,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach,describe,it,expect,vi} from 'vitest';
import {SessionProvider} from '../../contexts/SessionContext';
import {DEFAULT_SETTINGS} from './settingsLogic';
import {getAccount,saveAccount} from '../../services/portalApi';
import SettingsScreen from './Settings';
vi.mock('../../services/api',()=>import('../../services/apiMock'));
vi.mock('../../services/portalApi',()=>({getAccount:vi.fn(),saveAccount:vi.fn()}));
let stored;
beforeEach(()=>{stored={...DEFAULT_SETTINGS};vi.clearAllMocks();getAccount.mockImplementation(async()=>({settings:{...stored},syncedAt:null}));saveAccount.mockImplementation(async(next,reset)=>{stored={...(reset?DEFAULT_SETTINGS:next)};return{settings:{...stored},savedAt:'2026-11-05T12:00:00Z'};});});
async function renderSettings(){render(<SessionProvider><SettingsScreen/></SessionProvider>);await waitFor(()=>expect(screen.queryByText('Carregando configurações da conta…')).not.toBeInTheDocument());}
describe('Configurações salvas na conta',()=>{
 it('loads defaults from the account API without fabricated sync time',async()=>{await renderSettings();expect(getAccount).toHaveBeenCalled();expect(screen.getByLabelText('Nome de exibição')).toHaveValue('');expect(screen.getByRole('button',{name:'Salvar configurações'})).toBeDisabled();expect(screen.queryByText('Hoje, 08:32')).not.toBeInTheDocument();});
 it('loads previously saved preferences from the server',async()=>{stored={...stored,displayName:'Maria Silva',notifyEditais:true,weeklyDigest:false};await renderSettings();expect(screen.getByLabelText('Nome de exibição')).toHaveValue('Maria Silva');expect(screen.getByRole('switch',{name:'Propostas para análise'})).toBeChecked();expect(screen.getByRole('switch',{name:'Resumo semanal'})).not.toBeChecked();});
 it('validates settings before calling the server',async()=>{const user=userEvent.setup();await renderSettings();await user.type(screen.getByLabelText('E-mail alternativo'),'inválido');await user.click(screen.getByRole('button',{name:'Salvar configurações'}));expect(saveAccount).not.toHaveBeenCalled();expect(screen.getByRole('alert')).toHaveTextContent('e-mail válido');});
 it('confirms saved state only after the server response and can discard edits',async()=>{const user=userEvent.setup();await renderSettings();await user.type(screen.getByLabelText('Nome de exibição'),'Maria Silva');await user.click(screen.getByRole('switch',{name:'Propostas para análise'}));await user.click(screen.getByRole('button',{name:'Salvar configurações'}));await screen.findByText('Tudo sincronizado.');expect(stored.displayName).toBe('Maria Silva');expect(stored.notifyEditais).toBe(true);await user.type(screen.getByLabelText('Nome de exibição'),' Souza');await user.click(screen.getByRole('button',{name:'Descartar'}));expect(screen.getByLabelText('Nome de exibição')).toHaveValue('Maria Silva');});
 it('restores defaults on the server without deleting the account',async()=>{stored={...stored,displayName:'Maria Silva'};const user=userEvent.setup();await renderSettings();await user.click(screen.getByRole('button',{name:'Restaurar padrões'}));await waitFor(()=>expect(screen.getByLabelText('Nome de exibição')).toHaveValue(''));expect(saveAccount).toHaveBeenCalledWith(DEFAULT_SETTINGS,true);});
 it('keeps edited settings after a failed write',async()=>{saveAccount.mockRejectedValueOnce(new Error('Falha ao conectar. Tente novamente.'));const user=userEvent.setup();await renderSettings();await user.type(screen.getByLabelText('Nome de exibição'),'Maria');await user.click(screen.getByRole('button',{name:'Salvar configurações'}));expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao conectar');expect(screen.getByLabelText('Nome de exibição')).toHaveValue('Maria');});
});
