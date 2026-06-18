
import React, { useState } from 'react';
import { Search, Plus, Calendar, Activity, Ruler, Trash2 } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useGym } from '../context/GymContext';
import { Client, Measurement } from '../types';
import Modal from '../components/Modal';

const Measurements: React.FC = () => {
    const { clients, measurements, addMeasurement, deleteMeasurement } = useGym();
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState<Partial<Measurement>>({
        date: new Date().toISOString().split('T')[0]
    });

    const filteredClients = clients.filter(c => 
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.dni.includes(searchTerm)
    );

    const selectedClient = clients.find(c => c.id === selectedClientId);
    const clientMeasurements = measurements.filter(m => m.clientId === selectedClientId);
    
    // Get latest update for each client
    const getClientLatestUpdate = (clientId: string) => {
        const m = measurements.filter(x => x.clientId === clientId);
        if (m.length === 0) return 'Sin registros';
        return m[m.length - 1].date;
    };

    const handleDelete = (id: string) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este registro de medida?")) {
            deleteMeasurement(id);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClientId) return;

        // Auto calculate IMC if not present
        const heightInMeters = Number(formData.height) / 100;
        const imc = Number((Number(formData.weight) / (heightInMeters * heightInMeters)).toFixed(1));

        const newMeasurement: Measurement = {
            id: Math.random().toString(36).substr(2, 9),
            clientId: selectedClientId,
            date: formData.date || new Date().toISOString().split('T')[0],
            weight: Number(formData.weight),
            height: Number(formData.height),
            imc: imc,
            waist: Number(formData.waist),
            chest: Number(formData.chest),
            arms: Number(formData.arms),
            notes: formData.notes
        };
        
        addMeasurement(newMeasurement);
        setIsModalOpen(false);
        setFormData({ date: new Date().toISOString().split('T')[0] });
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
            {/* Left Sidebar: Client List */}
            <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Clientes</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Buscar cliente..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredClients.map(client => (
                        <div 
                            key={client.id}
                            onClick={() => setSelectedClientId(client.id)}
                            className={`p-4 border-b border-slate-100 cursor-pointer transition hover:bg-slate-50
                                ${selectedClientId === client.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''}
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className={`font-medium ${selectedClientId === client.id ? 'text-emerald-800' : 'text-slate-900'}`}>{client.fullName}</h3>
                                    <p className="text-xs text-slate-500">Última act: {getClientLatestUpdate(client.id)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side: Detail & Graphs */}
            <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                {selectedClient ? (
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{selectedClient.fullName}</h2>
                                <p className="text-sm text-slate-500">Historial de Medidas Corporales</p>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-900/20"
                            >
                                <Plus size={20} /> Nueva Medición
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Summary Cards */}
                            {clientMeasurements.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <p className="text-xs text-blue-600 font-medium uppercase">Peso Actual</p>
                                        <p className="text-2xl font-bold text-slate-900">{clientMeasurements[clientMeasurements.length - 1].weight} kg</p>
                                    </div>
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                        <p className="text-xs text-emerald-600 font-medium uppercase">IMC</p>
                                        <p className="text-2xl font-bold text-slate-900">{clientMeasurements[clientMeasurements.length - 1].imc}</p>
                                    </div>
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                        <p className="text-xs text-amber-600 font-medium uppercase">Cintura</p>
                                        <p className="text-2xl font-bold text-slate-900">{clientMeasurements[clientMeasurements.length - 1].waist} cm</p>
                                    </div>
                                     <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                        <p className="text-xs text-purple-600 font-medium uppercase">Pecho</p>
                                        <p className="text-2xl font-bold text-slate-900">{clientMeasurements[clientMeasurements.length - 1].chest} cm</p>
                                    </div>
                                </div>
                            )}

                            {/* Graph */}
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm h-72">
                                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2"><Activity size={16}/> Progreso</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={clientMeasurements}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} fontSize={12} />
                                        <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                                        <Tooltip contentStyle={{borderRadius:'8px'}}/>
                                        <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso" stroke="#3b82f6" strokeWidth={2} dot={{r:4}} />
                                        <Line yAxisId="right" type="monotone" dataKey="waist" name="Cintura" stroke="#10b981" strokeWidth={2} dot={{r:4}} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* History Table */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2"><Calendar size={16}/> Historial Detallado</h3>
                                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-medium">
                                            <tr>
                                                <th className="p-3">Fecha</th>
                                                <th className="p-3">Peso</th>
                                                <th className="p-3">Altura</th>
                                                <th className="p-3">IMC</th>
                                                <th className="p-3">Cintura</th>
                                                <th className="p-3">Pecho</th>
                                                <th className="p-3">Notas</th>
                                                <th className="p-3 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {clientMeasurements.slice().reverse().map(m => (
                                                <tr key={m.id} className="hover:bg-slate-50">
                                                    <td className="p-3 font-medium text-slate-900">{m.date}</td>
                                                    <td className="p-3">{m.weight} kg</td>
                                                    <td className="p-3">{m.height} cm</td>
                                                    <td className="p-3">{m.imc}</td>
                                                    <td className="p-3">{m.waist} cm</td>
                                                    <td className="p-3">{m.chest} cm</td>
                                                    <td className="p-3 text-slate-500 truncate max-w-xs">{m.notes || '-'}</td>
                                                    <td className="p-3 text-right">
                                                        <button 
                                                            onClick={() => handleDelete(m.id)}
                                                            className="text-slate-400 hover:text-red-600 transition p-1 hover:bg-red-50 rounded"
                                                            title="Eliminar registro"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {clientMeasurements.length === 0 && (
                                                <tr>
                                                    <td colSpan={8} className="p-8 text-center text-slate-400">No hay registros aún.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Ruler size={32} />
                        </div>
                        <p className="text-lg font-medium">Selecciona un cliente</p>
                        <p className="text-sm">Para ver o registrar nuevas medidas</p>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Medición">
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Fecha</label>
                            <input required type="date" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                                value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Peso (kg)</label>
                            <input required type="number" step="0.1" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                                value={formData.weight || ''} onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Altura (cm)</label>
                            <input required type="number" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                                value={formData.height || ''} onChange={e => setFormData({...formData, height: parseInt(e.target.value)})} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Cintura (cm)</label>
                            <input required type="number" step="0.5" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                                value={formData.waist || ''} onChange={e => setFormData({...formData, waist: parseFloat(e.target.value)})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Pecho (cm)</label>
                            <input type="number" step="0.5" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                                value={formData.chest || ''} onChange={e => setFormData({...formData, chest: parseFloat(e.target.value)})} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Brazos (cm)</label>
                            <input type="number" step="0.5" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                                value={formData.arms || ''} onChange={e => setFormData({...formData, arms: parseFloat(e.target.value)})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Notas</label>
                        <textarea className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" rows={2}
                            value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-900/20">Guardar</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default Measurements;
