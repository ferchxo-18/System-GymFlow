
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  UserPlus, 
  ArrowLeft,
  FileText,
  Sparkles,
  Pencil,
  Trash2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Client, MembershipStatus } from '../types';
import { generateWorkoutPlan } from '../services/geminiService';
import { useGym } from '../context/GymContext';
import Modal from '../components/Modal';

// Declare jsPDF on Window interface
declare global {
  interface Window {
    jspdf: any;
  }
}

const Members: React.FC = () => {
  const { clients, measurements, addClient, updateClient, deleteClient } = useGym();
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [aiPlan, setAiPlan] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({});

  // Helper to check for expiration (7 days)
  const isExpiringSoon = (expiryDate: string, status: MembershipStatus) => {
    if (status !== MembershipStatus.ACTIVE) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    expiry.setHours(0,0,0,0);
    
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 7;
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          client.dni.includes(searchTerm);
    
    let matchesStatus = true;
    if (filterStatus === 'all') {
        matchesStatus = true;
    } else if (filterStatus === 'expiring') {
        matchesStatus = isExpiringSoon(client.membershipExpiry, client.status);
    } else {
        matchesStatus = client.status === filterStatus;
    }

    return matchesSearch && matchesStatus;
  });

  const handleGenerateAiPlan = async () => {
    if(!selectedClient) return;
    setIsLoadingAi(true);
    const clientMeasurements = measurements.filter(m => m.clientId === selectedClient.id);
    const plan = await generateWorkoutPlan(selectedClient.fullName, clientMeasurements);
    setAiPlan(plan);
    setIsLoadingAi(false);
  };

  const calculateExpiryDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const openAddModal = () => {
    setIsEditMode(false);
    // Initialize with default Plan Mensual (30 days)
    setFormData({
      status: MembershipStatus.ACTIVE,
      avatarUrl: `https://picsum.photos/seed/${Math.random()}/100/100`,
      membershipType: 'Plan Mensual',
      membershipExpiry: calculateExpiryDate(30)
    });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setIsEditMode(true);
    setFormData(client);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      deleteClient(id);
      if (selectedClient?.id === id) setSelectedClient(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && formData.id) {
      updateClient(formData as Client);
    } else {
      const newClient = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        joinDate: new Date().toISOString().split('T')[0]
      } as Client;
      addClient(newClient);
    }
    setIsModalOpen(false);
  };

  const handleMembershipTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    let daysToAdd = 30;
    
    if (type === 'Plan Trimestral') daysToAdd = 90;
    else if (type === 'Plan Anual') daysToAdd = 365;

    setFormData({
        ...formData,
        membershipType: type,
        membershipExpiry: calculateExpiryDate(daysToAdd)
    });
  };

  const handleExportClientPDF = (client: Client) => {
    if (!window.jspdf) {
      alert("Librería PDF cargando...");
      return;
    }
    const doc = new window.jspdf.jsPDF();
    const clientMeasurements = measurements.filter(m => m.clientId === client.id);

    // Header
    doc.setFontSize(18);
    doc.setTextColor(16, 185, 129);
    doc.text("Ficha de Cliente - GymFlow Pro", 14, 20);

    // Client Info
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Nombre: ${client.fullName}`, 14, 35);
    doc.text(`DNI: ${client.dni}`, 14, 42);
    doc.text(`Membresía: ${client.membershipType} (${client.status})`, 14, 49);
    doc.text(`Vencimiento: ${client.membershipExpiry}`, 14, 56);
    doc.text(`Email: ${client.email}`, 14, 63);

    // Measurements Table
    doc.text("Historial de Medidas", 14, 80);
    
    const tableData = clientMeasurements.map(m => [
      m.date,
      `${m.weight} kg`,
      m.imc,
      `${m.waist} cm`,
      `${m.chest} cm`
    ]);

    doc.autoTable({
      startY: 85,
      head: [['Fecha', 'Peso', 'IMC', 'Cintura', 'Pecho']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
    });

    doc.save(`Ficha_${client.fullName.replace(/\s+/g, '_')}.pdf`);
  };

  const ClientDetail = ({ client }: { client: Client }) => {
    const clientMeasurements = measurements.filter(m => m.clientId === client.id);

    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => { setSelectedClient(null); setAiPlan(null); }}
          className="flex items-center text-slate-500 hover:text-slate-900 transition mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a la lista
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <img src={client.avatarUrl} alt={client.fullName} className="w-16 h-16 rounded-full border-2 border-slate-100" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{client.fullName}</h2>
                <div className="flex gap-2 text-sm text-slate-500">
                  <span>DNI: {client.dni}</span>
                  <span>•</span>
                  <span>{client.membershipType}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium
                  ${client.status === MembershipStatus.ACTIVE ? 'bg-emerald-100 text-emerald-700' : 
                    client.status === MembershipStatus.EXPIRED ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}
                `}>
                  {client.status}
                </span>
                <button onClick={() => openEditModal(client)} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded transition" title="Editar">
                  <Pencil size={18} />
                </button>
                <button onClick={() => handleDelete(client.id)} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600 rounded transition" title="Eliminar">
                  <Trash2 size={18} />
                </button>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Info Column */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 border-b pb-2">Datos Personales</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Teléfono</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
                <div>
                  <p className="text-slate-500">Email</p>
                  <p className="font-medium">{client.email}</p>
                </div>
                <div>
                  <p className="text-slate-500">Ingreso</p>
                  <p className="font-medium">{client.joinDate}</p>
                </div>
                <div>
                  <p className="text-slate-500">Vencimiento</p>
                  <p className={`font-medium ${client.status === MembershipStatus.EXPIRED ? 'text-red-600' : ''}`}>
                    {client.membershipExpiry}
                  </p>
                </div>
              </div>

               <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                 <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-indigo-700 flex items-center gap-2">
                        <Sparkles size={16} /> Coach AI
                    </h4>
                    <button 
                        onClick={handleGenerateAiPlan}
                        disabled={isLoadingAi}
                        className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                        {isLoadingAi ? 'Pensando...' : 'Generar Plan'}
                    </button>
                 </div>
                 {aiPlan ? (
                     <div className="text-sm text-slate-700 whitespace-pre-line prose prose-sm">
                         {aiPlan}
                     </div>
                 ) : (
                     <p className="text-xs text-slate-500">Genera un resumen semanal basado en las métricas actuales.</p>
                 )}
               </div>
            </div>

            {/* Metrics Chart */}
            <div className="lg:col-span-2 space-y-4">
               <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-semibold text-slate-900">Evolución Física</h3>
                  <button 
                    onClick={() => handleExportClientPDF(client)} 
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition font-medium text-sm" 
                    title="Descargar Ficha PDF"
                  >
                      <FileText size={18} /> Exportar PDF
                  </button>
               </div>
               
               <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={clientMeasurements}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} fontSize={12} />
                    <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" tick={{fill: '#3b82f6'}} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{fill: '#10b981'}} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{borderRadius:'8px'}}/>
                    <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso (kg)" stroke="#3b82f6" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="waist" name="Cintura (cm)" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="p-2">Fecha</th>
                            <th className="p-2">Peso</th>
                            <th className="p-2">IMC</th>
                            <th className="p-2">Cintura</th>
                            <th className="p-2">Pecho</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {clientMeasurements.map(m => (
                            <tr key={m.id}>
                                <td className="p-2">{m.date}</td>
                                <td className="p-2 font-medium">{m.weight}kg</td>
                                <td className="p-2">{m.imc}</td>
                                <td className="p-2">{m.waist}cm</td>
                                <td className="p-2">{m.chest}cm</td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (selectedClient) {
    return <ClientDetail client={selectedClient} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Control de Miembros</h1>
        <button 
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-900/20"
        >
          <UserPlus size={20} />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Buscar por nombre o DNI..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
                <select 
                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">Todos los estados</option>
                    <option value={MembershipStatus.ACTIVE}>Activos</option>
                    <option value="expiring">Por Vencer (7 días)</option>
                    <option value={MembershipStatus.EXPIRED}>Vencidos</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm font-semibold border-b border-slate-200">
                <th className="p-4">Cliente</th>
                <th className="p-4 hidden md:table-cell">Membresía</th>
                <th className="p-4 hidden sm:table-cell">Vencimiento</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.map((client) => {
                const expiring = isExpiringSoon(client.membershipExpiry, client.status);
                
                return (
                <tr key={client.id} className="hover:bg-slate-50 transition group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={client.avatarUrl} alt="" className="w-10 h-10 rounded-full bg-slate-200" />
                      <div>
                        <p className="font-medium text-slate-900 group-hover:text-emerald-700 transition">{client.fullName}</p>
                        <p className="text-xs text-slate-500">{client.dni}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-sm text-slate-600">{client.membershipType}</td>
                  <td className="p-4 hidden sm:table-cell text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                        {client.membershipExpiry}
                        {expiring && (
                            <span className="text-amber-500" title="Vence pronto">
                                <Clock size={14} />
                            </span>
                        )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${client.status === MembershipStatus.ACTIVE ? 'bg-emerald-100 text-emerald-800' : 
                            client.status === MembershipStatus.EXPIRED ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}
                        `}>
                        {client.status}
                        </span>
                        {expiring && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                <AlertTriangle size={10} /> Por Vencer
                            </span>
                        )}
                    </div>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-1">
                    <button 
                      onClick={() => setSelectedClient(client)}
                      className="p-2 text-slate-400 hover:text-emerald-600 transition hover:bg-emerald-50 rounded"
                      title="Ver Detalles"
                    >
                      <Eye size={20} />
                    </button>
                    <button 
                        onClick={() => openEditModal(client)}
                        className="p-2 text-slate-400 hover:text-blue-600 transition hover:bg-blue-50 rounded"
                        title="Editar"
                    >
                        <Pencil size={18} />
                    </button>
                    <button 
                        onClick={() => handleDelete(client.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition hover:bg-red-50 rounded"
                        title="Eliminar"
                    >
                        <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Editar Cliente" : "Nuevo Cliente"}>
        <form onSubmit={handleSave} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                <input required type="text" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                    value={formData.fullName || ''} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">DNI</label>
                <input required type="text" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                    value={formData.dni || ''} onChange={e => setFormData({...formData, dni: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Teléfono</label>
                    <input type="text" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                        value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Email</label>
                    <input type="email" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                        value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Tipo de Membresía</label>
                <select 
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    value={formData.membershipType || 'Plan Mensual'} 
                    onChange={handleMembershipTypeChange}
                >
                    <option value="Plan Mensual">Plan Mensual (30 días)</option>
                    <option value="Plan Trimestral">Plan Trimestral (90 días)</option>
                    <option value="Plan Anual">Plan Anual (365 días)</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Vencimiento (Auto-calculado)</label>
                <input 
                    type="date" 
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                    value={formData.membershipExpiry || ''} 
                    onChange={e => setFormData({...formData, membershipExpiry: e.target.value})} 
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Estado</label>
                <select className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as MembershipStatus})}>
                    <option value={MembershipStatus.ACTIVE}>Activo</option>
                    <option value={MembershipStatus.INACTIVE}>Inactivo</option>
                    <option value={MembershipStatus.EXPIRED}>Vencido</option>
                </select>
            </div>
            <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-900/20">Guardar</button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default Members;
