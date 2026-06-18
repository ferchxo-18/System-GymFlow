import React from 'react';
import { Member, StaffLog } from '../types';
import { Users, UserCheck, TrendingUp, AlertTriangle } from 'lucide-react';

interface Props {
  members: Member[];
  staffLogs: StaffLog[];
}

export const Dashboard: React.FC<Props> = ({ members, staffLogs }) => {
  const activeMembers = members.filter(m => m.status === 'Activo').length;
  const pendingMembers = members.filter(m => m.status === 'Pendiente').length;
  
  // Calculate active staff (Entries without subsequent Exits - simplified logic for demo)
  // In a real app, we'd group by name and check the last action.
  const uniqueStaff = Array.from(new Set(staffLogs.map(l => l.staffName)));
  const staffOnSite = uniqueStaff.filter(name => {
    const logs = staffLogs.filter(l => l.staffName === name).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return logs.length > 0 && logs[0].action === 'ENTRY';
  }).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Bienvenido de nuevo</h2>
        <p className="text-slate-500">Resumen de actividad del gimnasio hoy</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Miembros Activos</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{activeMembers}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Personal en Sitio</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{staffOnSite}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Membresías Pendientes</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{pendingMembers}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl shadow-lg text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-blue-100">Crecimiento Mensual</p>
              <h3 className="text-3xl font-bold mt-2 flex items-center gap-2">
                +12% <TrendingUp className="w-5 h-5"/>
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-64 flex flex-col items-center justify-center text-center">
            <h4 className="font-semibold text-slate-800 mb-2">Excel vs. Smart Gym App</h4>
            <p className="text-slate-500 text-sm max-w-md">
                A diferencia de Excel, este sistema utiliza el API de Gemini AI para analizar datos biométricos en tiempo real, mantiene un historial seguro de accesos y funciona en cualquier dispositivo sin archivos corruptos.
            </p>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h4 className="font-semibold text-slate-800 mb-4">Actividad Reciente del Personal</h4>
            <div className="space-y-3">
                {staffLogs.slice(0, 3).map(log => (
                    <div key={log.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{log.staffName}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${log.action === 'ENTRY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {log.action === 'ENTRY' ? 'ENTRADA' : 'SALIDA'}
                        </span>
                    </div>
                ))}
                {staffLogs.length === 0 && <p className="text-slate-400 text-sm">Sin actividad reciente.</p>}
            </div>
        </div>
      </div>
    </div>
  );
};
