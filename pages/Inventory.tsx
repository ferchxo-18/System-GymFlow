
import React, { useState } from 'react';
import { AlertCircle, Package, Pencil, Plus, Download, Trash2 } from 'lucide-react';
import { useGym } from '../context/GymContext';
import { Product } from '../types';
import Modal from '../components/Modal';

const Inventory: React.FC = () => {
    const { inventory, addProduct, updateProduct, deleteProduct } = useGym();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({});

    const openAddModal = () => {
        setIsEditMode(false);
        setFormData({ lastRestock: new Date().toISOString().split('T')[0] });
        setIsModalOpen(true);
    };

    const openEditModal = (p: Product) => {
        setIsEditMode(true);
        setFormData(p);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este producto del inventario?")) {
            deleteProduct(id);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode && formData.id) {
            updateProduct(formData as Product);
        } else {
            addProduct({ ...formData, id: Math.random().toString(36).substr(2, 9) } as Product);
        }
        setIsModalOpen(false);
    };

    const handleExport = () => {
        const headers = ["Código", "Producto", "Categoría", "Stock", "Mínimo", "Precio", "Estado", "Último Ingreso"];
        const csvContent = [
            headers.join(","),
            ...inventory.map(item => {
                const isLowStock = item.stock <= item.minStock;
                return [
                    `"${item.code}"`,
                    `"${item.name}"`,
                    item.category,
                    item.stock,
                    item.minStock,
                    item.price.toFixed(2),
                    isLowStock ? "Stock Bajo" : "OK",
                    item.lastRestock
                ].join(",")
            })
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `inventario_gym_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900">Control de Inventario</h1>
                <div className="flex gap-2">
                    <button 
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition shadow-sm"
                    >
                        <Download size={20} />
                        <span className="hidden sm:inline">Exportar Excel</span>
                    </button>
                    <button 
                        onClick={openAddModal}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
                    >
                        <Plus size={20} />
                        <span>Nuevo Producto</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-sm font-semibold border-b border-slate-200">
                            <th className="p-4">Código</th>
                            <th className="p-4">Producto</th>
                            <th className="p-4">Categoría</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4">Mínimo</th>
                            <th className="p-4">Precio</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {inventory.map((item) => {
                            const isLowStock = item.stock <= item.minStock;
                            return (
                                <tr key={item.id} className="hover:bg-slate-50 transition text-sm">
                                    <td className="p-4 font-mono text-xs text-slate-500">{item.code}</td>
                                    <td className="p-4 font-medium text-slate-900">{item.name}</td>
                                    <td className="p-4 text-slate-600">{item.category}</td>
                                    <td className={`p-4 font-bold ${isLowStock ? 'text-red-600' : 'text-slate-700'}`}>
                                        {item.stock}
                                    </td>
                                    <td className="p-4 text-slate-500">{item.minStock}</td>
                                    <td className="p-4 text-slate-900">S/ {item.price.toFixed(2)}</td>
                                    <td className="p-4">
                                        {isLowStock ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                <AlertCircle size={12} /> Stock Bajo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                OK
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => openEditModal(item)} className="p-2 text-slate-400 hover:text-blue-600 transition hover:bg-blue-50 rounded" title="Editar">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 transition hover:bg-red-50 rounded" title="Eliminar">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Editar Producto" : "Nuevo Producto"}>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-medium text-slate-700">Código</label>
                             <input required type="text" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition" 
                                value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700">Categoría</label>
                             <select className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                                <option value="Suplemento">Suplemento</option>
                                <option value="Bebida">Bebida</option>
                                <option value="Accesorio">Accesorio</option>
                                <option value="Máquina">Máquina</option>
                             </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Nombre del Producto</label>
                        <input required type="text" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition" 
                            value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                         <div>
                             <label className="block text-sm font-medium text-slate-700">Stock</label>
                             <input required type="number" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition" 
                                value={formData.stock || ''} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700">Mínimo</label>
                             <input required type="number" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition" 
                                value={formData.minStock || ''} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value)})} />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700">Precio (S/)</label>
                             <input required type="number" step="0.1" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition" 
                                value={formData.price || ''} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Último Ingreso</label>
                        <input type="date" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition" 
                            value={formData.lastRestock || ''} onChange={e => setFormData({...formData, lastRestock: e.target.value})} />
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">Guardar</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default Inventory;
