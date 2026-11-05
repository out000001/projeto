import {render,screen,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {vi,it,expect,beforeEach} from 'vitest';
import ProjectPublication from './ProjectPublication';
import {publishProject,unpublishProject} from '../../../services/projectApi';
vi.mock('../../../services/projectApi',()=>({publishProject:vi.fn(),unpublishProject:vi.fn(),attachmentDownload:vi.fn()}));
const project={id:'saved-project-12345',published:false,submission:{socialJustification:'Texto privado da justificativa',objectives:'Objetivos',activities:'Atividades',timeline:'Cronograma',teamMembers:[],attachments:[]}};
beforeEach(()=>{vi.clearAllMocks();publishProject.mockResolvedValue({ok:true});unpublishProject.mockResolvedValue({ok:true});});
it('publishes only after participation details are filled and server confirms',async()=>{
 const user=userEvent.setup();const onChanged=vi.fn();render(<ProjectPublication project={project} onChanged={onChanged}/>);
 await user.type(screen.getByLabelText('Local / bairro'),'Boa Vista');
 await user.type(screen.getByLabelText('Cursos / público participante'),'Todos os cursos');
 await user.type(screen.getByLabelText('Carga horária'),'40h');
 await user.type(screen.getByLabelText('Inscrições até'),'2027-02-10');
 await user.click(screen.getByLabelText('Tarde'));
 await user.click(screen.getByRole('button',{name:'Publicar projeto'}));
 await waitFor(()=>expect(onChanged).toHaveBeenCalledOnce());
 expect(publishProject).toHaveBeenCalledWith(project.id,{local:'Boa Vista',courses:'Todos os cursos',hours:'40h',deadline:'2027-02-10',turnos:['Tarde']});
});
it('keeps the publication dialog and reports a failed write',async()=>{
 publishProject.mockRejectedValueOnce(new Error('Falha de conexão. Tente novamente.'));
 const user=userEvent.setup();const onChanged=vi.fn();render(<ProjectPublication project={{...project,publicInfo:{local:'Boa Vista',courses:'Todos',hours:'20h',deadline:'2027-02-10'}}} onChanged={onChanged}/>);
 await user.click(screen.getByRole('button',{name:'Publicar projeto'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('Falha de conexão');
 expect(onChanged).not.toHaveBeenCalled();expect(screen.getByLabelText('Local / bairro')).toHaveValue('Boa Vista');
});
it('can remove a published item while retaining its private proposal',async()=>{
 const user=userEvent.setup();const onChanged=vi.fn();render(<ProjectPublication project={{...project,published:true}} onChanged={onChanged}/>);
 await user.click(screen.getByRole('button',{name:'Retirar da vitrine'}));
 await waitFor(()=>expect(onChanged).toHaveBeenCalledOnce());expect(unpublishProject).toHaveBeenCalledWith(project.id);
});
