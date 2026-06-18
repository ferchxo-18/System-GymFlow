import React, { useState, useEffect } from 'react';
import { StaffLog } from '../types';
import { LogIn, LogOut, Clock, ShieldCheck } from 'lucide-react';

interface Props {
  logs: StaffLog[];
  setLogs: React.Dispatch<React.SetStateAction<StaffLog[]>>;
}

export const StaffPortal: React.FC<Props> = ({ logs, setLogs }) => {
  const [staffName, setStaffName] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLog = (action: 'ENTRY' | 'EXIT') => {
    if (!staffName.trim()) {
      alert("Por favor ingrese su nombre");
      return;
    }

    const newLog: StaffLog = {
      id: crypto.randomUUID(),
      staffName: staffName,
      action: action,
      timestamp: new Date().toISOString(),
    };

    setLogs([newLog, ...logs]);
    setStaffName('');
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Control de Acceso Personal</h2>
        <div className="text-4xl font-mono text-blue-600 font-bold tracking-widest my-4">
          {currentTime.toLocaleTimeString()}
        </div>
        <p className="text-slate-500">Registre su entrada o salida del turno laboral</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        <div className="max-w-md mx-auto space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del Colaborador</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Ej. Juan Pérez"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                value={staffName}
                onChange={e => setStaffName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleLog('ENTRY')}
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-green-100 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300 transition-all group"
            >
              <LogIn className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-bold">Marcar Entrada</span>
            </button>
            <button 
              onClick={() => handleLog('EXIT')}
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-red-100 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 transition-all group"
            >
              <LogOut className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-bold">Marcar Salida</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Historial Reciente
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 sticky top-0">
              <tr>
                <th className="p-4">Colaborador</th>
                <th className="p-4">Acción</th>
                <th className="p-4 text-right">Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-900">{log.staffName}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      log.action === 'ENTRY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.action === 'ENTRY' ? 'Entrada' : 'Salida'}
                    </span>
                  </td>
                  <td className="p-4 text-right text-slate-500 font-mono">
                    {formatTime(log.timestamp)}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={3} className="p-8 text-center text-slate-400">Sin registros hoy.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
