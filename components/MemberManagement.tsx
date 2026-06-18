import React, { useState } from 'react';
import { Member, MembershipStatus } from '../types';
import { Plus, Search, Trash2, Edit2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Props {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
}

export const MemberManagement: React.FC<Props> = ({ members, setMembers }) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState<Partial<Member>>({
    fullName: '',
    email: '',
    planType: 'Basic',
    status: MembershipStatus.ACTIVE,
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;

    const newMember: Member = {
      id: crypto.randomUUID(),
      fullName: formData.fullName,
      email: formData.email,
      joinDate: new Date().toISOString().split('T')[0],
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
      status: formData.status as MembershipStatus,
      planType: formData.planType as 'Basic' | 'Premium' | 'VIP',
    };

    setMembers([...members, newMember]);
    setShowForm(false);
    setFormData({ fullName: '', email: '', planType: 'Basic', status: MembershipStatus.ACTIVE });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este miembro?')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const filteredMembers = members.filter(m => 
    m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: MembershipStatus) => {
    switch (status) {
      case MembershipStatus.ACTIVE: return 'bg-green-100 text-green-700 border-green-200';
      case MembershipStatus.INACTIVE: return 'bg-red-100 text-red-700 border-red-200';
      case MembershipStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Control de Membresías</h2>
          <p className="text-slate-500">Administra accesos y planes de tus clientes</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Miembro
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <h3 className="font-semibold text-lg mb-4">Registrar Nuevo Miembro</h3>
          <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
              <input 
                required
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                required
                type="email" 
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
              <select 
                className="w-full border border-slate-300 rounded-lg p-2"
                value={formData.planType}
                onChange={e => setFormData({...formData, planType: e.target.value as any})}
              >
                <option value="Basic">Básico</option>
                <option value="Premium">Premium</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select 
                className="w-full border border-slate-300 rounded-lg p-2"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
              >
                <option value={MembershipStatus.ACTIVE}>Activo</option>
                <option value={MembershipStatus.PENDING}>Pendiente</option>
                <option value={MembershipStatus.INACTIVE}>Inactivo</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Guardar Miembro
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o email..." 
            className="flex-1 outline-none text-slate-700"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 text-sm">
              <tr>
                <th className="p-4 font-semibold">Miembro</th>
                <th className="p-4 font-semibold">Plan</th>
                <th className="p-4 font-semibold">Vencimiento</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map(member => (
                <tr key={member.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="font-medium text-slate-900">{member.fullName}</div>
                    <div className="text-sm text-slate-500">{member.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold border border-slate-200">
                      {member.planType}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">
                    {member.expirationDate}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${getStatusColor(member.status)}`}>
                      {member.status === MembershipStatus.ACTIVE ? <CheckCircle className="w-3 h-3"/> : member.status === MembershipStatus.INACTIVE ? <XCircle className="w-3 h-3"/> : <AlertCircle className="w-3 h-3"/>}
                      {member.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(member.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No se encontraron miembros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
