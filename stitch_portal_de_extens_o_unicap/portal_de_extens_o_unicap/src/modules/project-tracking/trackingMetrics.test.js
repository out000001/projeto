import {afterEach,describe,expect,it,vi} from 'vitest';
import {currentMonth,validMonth,trackingMonths,participantHours,frequencySummary,executionSummary} from './trackingMetrics';
afterEach(()=>vi.useRealTimers());
const tracking=()=>({config:{startDate:'2026-12-01',endDate:'2027-02-28',totalHours:120},participants:[{id:'a',active:true},{id:'b',active:true},{id:'archived',active:false}],frequency:{'2026-12':{a:{hours:12,status:'pending'},b:{hours:30,status:'homologada'},archived:{hours:300,status:'homologada'}},'2027-01':{a:{hours:18,status:'homologada'}}}});
describe('tracking metrics used by the actual interface',()=>{
 it.each([['2026-10','2026-12'],['2027-01','2027-01'],['2027-04','2027-02']])('keeps %s inside the configured period as %s',(month,expected)=>{expect(validMonth(month,tracking().config)).toBe(expected);});
 it('does not invent limits for an unconfigured project',()=>{expect(validMonth('2026-11',{})).toBe('2026-11');});
 it('enumerates months across a year boundary',()=>{expect(trackingMonths(tracking())).toEqual(['2026-12','2027-01','2027-02']);});
 it('uses the Sao Paulo month around a UTC boundary',()=>{vi.useFakeTimers();vi.setSystemTime(new Date('2026-11-01T01:00:00Z'));expect(currentMonth()).toBe('2026-10');});
 it('separates registered hours from approved hours',()=>{expect(participantHours(tracking(),'a')).toEqual({registered:30,approved:18});});
 it('returns no accumulated hours for a missing participant',()=>{expect(participantHours(tracking(),'missing')).toEqual({registered:0,approved:0});});
 it('excludes inactive members from monthly approval counts',()=>{expect(frequencySummary(tracking(),'2026-12')).toEqual({total:2,approved:1,pending:1,percent:50});});
 it('treats an unsaved month as pending for each active member',()=>{expect(frequencySummary(tracking(),'2027-02')).toEqual({total:2,approved:0,pending:2,percent:0});});
 it('uses approved hours and active membership to calculate execution',()=>{expect(executionSummary(tracking())).toEqual({approved:48,planned:240,percent:20});});
 it('does not report a percentage without a configured workload',()=>{const value=tracking();value.config.totalHours=0;expect(executionSummary(value)).toEqual({approved:48,planned:0,percent:null});});
});
