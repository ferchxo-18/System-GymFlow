
import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { User, UserRole } from '../types';
import { Shield, ShieldCheck, UserPlus, Trash2, Key, Pencil } from 'lucide-react';
import Modal from '../components/Modal';

const UsersPage: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser } = useGym();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    role: 'staff',
    avatarUrl: `https://picsum.photos/seed/${Math.random()}/100/100`
  });

  const openAddModal = () => {
      setIsEditMode(false);
      setFormData({
        role: 'staff',
        avatarUrl: `https://picsum.photos/seed/${Math.random()}/100/100`,
        username: '',
        password: '',
        fullName: ''
      });
      setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
      setIsEditMode(true);
      setFormData(user);
      setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.fullName) return;

    if (isEditMode && formData.id) {
        updateUser(formData as User);
    } else {
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          role: formData.role as UserRole,
          avatarUrl: `https://picsum.photos/seed/${formData.username}/100/100`
        };
        addUser(newUser);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (id === currentUser?.id) {
        alert("No puedes eliminar tu propio usuario mientras estás conectado.");
        return;
    }
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
        deleteUser(id);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h1>
            <p className="text-slate-500">Administra el acceso al sistema GymFlow Pro</p>
        </div>
        <button 
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
        >
          <UserPlus size={20} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 flex flex-col items-center text-center border-b border-slate-100 flex-1">
               <div className="relative mb-4">
                   <img 
                    src={user.avatarUrl} 
                    alt={user.fullName} 
                    className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-sm"
                   />
                   <div className={`absolute bottom-0 right-0 p-1.5 rounded-full border-2 border-white ${user.role === 'admin' ? 'bg-purple-500' : 'bg-emerald-500'}`}>
                      {user.role === 'admin' ? <ShieldCheck size={14} className="text-white"/> : <Shield size={14} className="text-white"/>}
                   </div>
               </div>
               <h3 className="font-bold text-lg text-slate-900">{user.fullName}</h3>
               <p className="text-sm text-slate-500 mb-4">@{user.username}</p>
               <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                 ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}
               `}>
                 {user.role}
               </span>
            </div>
            <div className="p-4 bg-slate-50 flex justify-between items-center text-sm">
                <div className="flex items-center gap-1 text-slate-500">
                    <Key size={14} />
                    <span className="font-mono">******</span>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => openEditModal(user)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded transition"
                        title="Editar Usuario"
                    >
                        <Pencil size={18} />
                    </button>
                    {user.id !== currentUser?.id && (
                        <button 
                            onClick={() => handleDelete(user.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"
                            title="Eliminar Usuario"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Editar Usuario" : "Crear Nuevo Usuario"}>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                <input required type="text" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                    value={formData.fullName || ''} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Usuario (Login)</label>
                    <input required type="text" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                        value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Contraseña</label>
                    <input required type="text" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                        value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Rol</label>
                <select 
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                >
                    <option value="staff">Staff (Acceso Limitado)</option>
                    <option value="admin">Administrador (Acceso Total)</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                    * Los administradores pueden gestionar usuarios y configuraciones.
                </p>
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">
                    {isEditMode ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
