import React, { useState } from 'react';
import { Member, BodyMeasurement, AIAnalysisResult } from '../types';
import { analyzeMemberProgress } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, BrainCircuit, Ruler, Sparkles, Loader2 } from 'lucide-react';

interface Props {
  members: Member[];
  measurements: BodyMeasurement[];
  setMeasurements: React.Dispatch<React.SetStateAction<BodyMeasurement[]>>;
}

export const Measurements: React.FC<Props> = ({ members, measurements, setMeasurements }) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Form State
  const [newMeasurement, setNewMeasurement] = useState<Partial<BodyMeasurement>>({
    weightKg: 0,
    heightCm: 0,
    bodyFatPercentage: 0,
    muscleMassKg: 0,
  });

  const memberMeasurements = measurements.filter(m => m.memberId === selectedMemberId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const selectedMember = members.find(m => m.id === selectedMemberId);

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    const entry: BodyMeasurement = {
      id: crypto.randomUUID(),
      memberId: selectedMemberId,
      date: new Date().toISOString().split('T')[0],
      weightKg: Number(newMeasurement.weightKg),
      heightCm: Number(newMeasurement.heightCm),
      bodyFatPercentage: Number(newMeasurement.bodyFatPercentage),
      muscleMassKg: Number(newMeasurement.muscleMassKg),
    };

    setMeasurements([...measurements, entry]);
    setShowAddForm(false);
    // Reset AI result as data changed
    setAiResult(null); 
  };

  const runAnalysis = async () => {
    if (!selectedMember) return;
    setIsLoadingAi(true);
    const result = await analyzeMemberProgress(selectedMember, memberMeasurements);
    setAiResult(result);
    setIsLoadingAi(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Control de Medidas</h2>
          <p className="text-slate-500">Seguimiento biométrico y análisis de progreso</p>
        </div>
        <select 
          className="bg-white border border-slate-300 text-slate-700 py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedMemberId}
          onChange={(e) => {
            setSelectedMemberId(e.target.value);
            setAiResult(null);
          }}
        >
          <option value="">Seleccione un Miembro</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.fullName}</option>
          ))}
        </select>
      </div>

      {!selectedMemberId && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center text-blue-700">
          <Ruler className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Selecciona un miembro arriba para ver sus estadísticas o registrar nuevas medidas.</p>
        </div>
      )}

      {selectedMemberId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Progreso de Peso
                </h3>
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="text-sm bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800"
                >
                  {showAddForm ? 'Cancelar' : '+ Nueva Medida'}
                </button>
              </div>

              {showAddForm && (
                <form onSubmit={handleAddMeasurement} className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
                   <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Peso (kg)</label>
                    <input type="number" step="0.1" required className="w-full mt-1 p-2 rounded border border-slate-300" 
                      value={newMeasurement.weightKg} onChange={e => setNewMeasurement({...newMeasurement, weightKg: Number(e.target.value)})} />
                   </div>
                   <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Altura (cm)</label>
                    <input type="number" required className="w-full mt-1 p-2 rounded border border-slate-300" 
                      value={newMeasurement.heightCm} onChange={e => setNewMeasurement({...newMeasurement, heightCm: Number(e.target.value)})} />
                   </div>
                   <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Grasa (%)</label>
                    <input type="number" step="0.1" className="w-full mt-1 p-2 rounded border border-slate-300" 
                      value={newMeasurement.bodyFatPercentage} onChange={e => setNewMeasurement({...newMeasurement, bodyFatPercentage: Number(e.target.value)})} />
                   </div>
                   <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Músculo (kg)</label>
                    <input type="number" step="0.1" className="w-full mt-1 p-2 rounded border border-slate-300" 
                      value={newMeasurement.muscleMassKg} onChange={e => setNewMeasurement({...newMeasurement, muscleMassKg: Number(e.target.value)})} />
                   </div>
                   <button type="submit" className="col-span-2 md:col-span-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mt-2">Guardar Registro</button>
                </form>
              )}

              <div className="h-[300px] w-full">
                {memberMeasurements.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={memberMeasurements}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickMargin={10} />
                      <YAxis stroke="#64748b" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="weightKg" name="Peso (kg)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="muscleMassKg" name="Músculo (kg)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                    No hay datos registrados aún.
                  </div>
                )}
              </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Peso</th>
                      <th className="p-3">Grasa %</th>
                      <th className="p-3">Músculo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {memberMeasurements.map(m => (
                      <tr key={m.id}>
                        <td className="p-3">{m.date}</td>
                        <td className="p-3 font-medium">{m.weightKg} kg</td>
                        <td className="p-3">{m.bodyFatPercentage || '-'}%</td>
                        <td className="p-3">{m.muscleMassKg || '-'} kg</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>

          {/* AI Analysis Panel */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
              
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="w-6 h-6 text-purple-300" />
                <h3 className="font-bold text-lg">Smart Trainer AI</h3>
              </div>
              
              <p className="text-indigo-200 text-sm mb-6 leading-relaxed">
                Utiliza inteligencia artificial para analizar las tendencias de este miembro y generar recomendaciones personalizadas automáticamente.
              </p>

              <button 
                onClick={runAnalysis}
                disabled={isLoadingAi || memberMeasurements.length < 2}
                className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg font-medium transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingAi ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5 text-yellow-300" />}
                {isLoadingAi ? 'Analizando...' : 'Generar Reporte'}
              </button>
            </div>

            {aiResult && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
                 <div className="flex items-center gap-2 mb-4">
                    <span className={`w-3 h-3 rounded-full ${aiResult.trend === 'positive' ? 'bg-green-500' : aiResult.trend === 'negative' ? 'bg-red-500' : 'bg-slate-400'}`}></span>
                    <h4 className="font-bold text-slate-800">Resultado del Análisis</h4>
                 </div>
                 
                 <div className="space-y-4">
                   <div>
                     <h5 className="text-xs font-bold text-slate-400 uppercase mb-1">Resumen</h5>
                     <p className="text-slate-700 text-sm leading-relaxed">{aiResult.summary}</p>
                   </div>
                   <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                     <h5 className="text-xs font-bold text-amber-600 uppercase mb-2">Consejos del Entrenador</h5>
                     <p className="text-slate-700 text-sm whitespace-pre-line">{aiResult.advice}</p>
                   </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
