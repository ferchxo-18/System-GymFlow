
import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Plus, Pencil, ShoppingBag, Dumbbell, Search, Filter, Calendar, X, Trash2 } from 'lucide-react';
import { useGym } from '../context/GymContext';
import { Payment, PaymentMethod } from '../types';
import Modal from '../components/Modal';

const Payments: React.FC = () => {
  const { payments, clients, inventory, addPayment, updatePayment, deletePayment, sellProduct } = useGym();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Start of current month
      end: new Date().toISOString().split('T')[0] // Today
  });
  
  // Payment Type State (Service vs Product)
  const [paymentType, setPaymentType] = useState<'service' | 'product'>('service');
  
  // Product Sale State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [productQuantity, setProductQuantity] = useState<number>(1);

  const [formData, setFormData] = useState<Partial<Payment>>({
    date: new Date().toISOString().split('T')[0],
    status: 'Paid',
    method: PaymentMethod.CASH
  });

  // Auto-calculate amount when product or quantity changes
  useEffect(() => {
    if (paymentType === 'product' && selectedProductId) {
        const product = inventory.find(p => p.id === selectedProductId);
        if (product) {
            setFormData(prev => ({
                ...prev,
                amount: product.price * productQuantity,
                concept: `Venta: ${product.name} x${productQuantity}`
            }));
        }
    }
  }, [selectedProductId, productQuantity, paymentType, inventory]);

  // Filter Logic
  const filteredPayments = payments.filter(payment => {
      const matchesSearch = 
        payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.concept.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
      const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
      const matchesDate = payment.date >= dateRange.start && payment.date <= dateRange.end;

      return matchesSearch && matchesMethod && matchesStatus && matchesDate;
  });

  const clearFilters = () => {
      setSearchTerm('');
      setFilterMethod('all');
      setFilterStatus('all');
      setDateRange({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este registro de pago?")) {
        deletePayment(id);
    }
  };

  const handleExport = () => {
    const headers = ["Fecha", "Cliente", "Concepto", "Método", "Monto", "Estado"];
    const csvContent = [
      headers.join(","),
      ...filteredPayments.map(p => [
        p.date,
        `"${p.clientName}"`,
        `"${p.concept}"`,
        p.method,
        p.amount,
        p.status
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `pagos_filtrados_${dateRange.start}_${dateRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setPaymentType('service');
    setSelectedProductId('');
    setProductQuantity(1);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      status: 'Paid',
      method: PaymentMethod.CASH,
      amount: 0,
      concept: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (payment: Payment) => {
    setIsEditMode(true);
    // Editing is treated as generic service edit to avoid complex stock rollback logic
    setPaymentType('service'); 
    setFormData(payment);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClient = clients.find(c => c.id === formData.clientId);
    const clientName = selectedClient?.fullName || formData.clientName || 'Cliente General';
    
    if (isEditMode && formData.id) {
        // Update existing payment
        const updatedPayment = {
            ...formData,
            clientName,
            amount: Number(formData.amount)
        } as Payment;
        updatePayment(updatedPayment);
    } else {
        // Create new payment
        const newPayment = {
            ...formData,
            id: Math.random().toString(36).substr(2, 9),
            clientName,
            amount: Number(formData.amount)
        } as Payment;
        
        addPayment(newPayment);

        // Deduct Stock if it was a product sale
        if (paymentType === 'product' && selectedProductId) {
            sellProduct(selectedProductId, productQuantity);
        }
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Historial de Pagos</h1>
        <div className="flex gap-2">
            <button 
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition"
                title="Exportar vista actual a CSV"
            >
            <Download size={20} />
            <span className="hidden sm:inline">Exportar</span>
            </button>
            <button 
                onClick={openAddModal}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
            >
            <Plus size={20} />
            <span>Registrar Pago</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Summary Cards */}
         <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm">Ingresos Hoy</p>
                <p className="text-2xl font-bold text-slate-900">
                    S/ {payments.filter(p => p.date === new Date().toISOString().split('T')[0]).reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm">Total (Vista Actual)</p>
                <p className="text-2xl font-bold text-emerald-600">
                    S/ {filteredPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm">Pendientes (Vista Actual)</p>
                <p className="text-2xl font-bold text-amber-500">
                    {filteredPayments.filter(p => p.status === 'Pending').length}
                </p>
            </div>
         </div>

         {/* Filter Toolbar */}
         <div className="lg:col-span-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-4 items-end xl:items-center">
             {/* Search */}
             <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Buscar cliente o concepto..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>

             <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                 {/* Date Range */}
                 <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                    <Calendar size={16} className="text-slate-500" />
                    <input 
                        type="date" 
                        className="text-sm bg-transparent border-none focus:ring-0 text-slate-700 p-0 w-24 sm:w-auto"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    />
                    <span className="text-slate-400 text-xs">a</span>
                    <input 
                        type="date" 
                        className="text-sm bg-transparent border-none focus:ring-0 text-slate-700 p-0 w-24 sm:w-auto"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    />
                 </div>

                 {/* Dropdowns */}
                 <div className="relative">
                     <select 
                        className="appearance-none pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        value={filterMethod}
                        onChange={(e) => setFilterMethod(e.target.value)}
                     >
                        <option value="all">Todos Métodos</option>
                        {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                     </select>
                     <CreditCard className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 </div>

                 <div className="relative">
                     <select 
                        className="appearance-none pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                     >
                        <option value="all">Todos Estados</option>
                        <option value="Paid">Pagado</option>
                        <option value="Pending">Pendiente</option>
                     </select>
                     <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 </div>

                 {/* Clear Filters */}
                 <button 
                    onClick={clearFilters}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Limpiar Filtros"
                 >
                     <X size={18} />
                 </button>
             </div>
         </div>

         {/* Transactions Table */}
         <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 font-semibold text-slate-900 flex justify-between items-center">
                <span>Resultados ({filteredPayments.length})</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-sm font-semibold border-b border-slate-200">
                            <th className="p-4">Fecha</th>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Concepto</th>
                            <th className="p-4">Método</th>
                            <th className="p-4">Monto</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredPayments.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-500">
                                    No se encontraron pagos con los filtros seleccionados.
                                </td>
                            </tr>
                        ) : (
                            filteredPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-slate-50 transition text-sm">
                                    <td className="p-4 text-slate-600 whitespace-nowrap">{payment.date}</td>
                                    <td className="p-4 font-medium text-slate-900">{payment.clientName}</td>
                                    <td className="p-4 text-slate-600">{payment.concept}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <CreditCard size={14} />
                                            {payment.method}
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-slate-900">S/ {payment.amount.toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${payment.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                            {payment.status === 'Paid' ? 'Pagado' : 'Pendiente'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            {payment.status === 'Pending' && (
                                                <button 
                                                    onClick={() => openEditModal(payment)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                    title="Editar / Finalizar Pago"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(payment.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                                title="Eliminar registro"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
         </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Editar Pago" : "Registrar Pago"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Payment Type Selector (Only in Create Mode) */}
            {!isEditMode && (
                <div className="flex p-1 bg-slate-100 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setPaymentType('service')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition ${paymentType === 'service' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                    >
                        <Dumbbell size={16} /> Servicio / Membresía
                    </button>
                    <button
                        type="button"
                        onClick={() => setPaymentType('product')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition ${paymentType === 'product' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                    >
                        <ShoppingBag size={16} /> Producto
                    </button>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-700">Cliente</label>
                <select 
                    required={paymentType === 'service'} // Optional for products (could be walk-in)
                    disabled={isEditMode}
                    className={`w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition ${isEditMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                    value={formData.clientId || ''} 
                    onChange={e => setFormData({...formData, clientId: e.target.value})}
                >
                    <option value="">Cliente Casual / General</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                </select>
            </div>

            {paymentType === 'service' ? (
                <div>
                    <label className="block text-sm font-medium text-slate-700">Concepto</label>
                    <input required type="text" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition" placeholder="Ej. Mensualidad Mayo"
                        value={formData.concept || ''} onChange={e => setFormData({...formData, concept: e.target.value})} />
                </div>
            ) : (
                // Product Selection Fields
                <div className="grid grid-cols-3 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="col-span-3">
                         <label className="block text-sm font-medium text-slate-700">Seleccionar Producto</label>
                         <select 
                            required
                            className="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                            value={selectedProductId}
                            onChange={e => setSelectedProductId(e.target.value)}
                         >
                            <option value="">-- Elegir --</option>
                            {inventory.map(p => (
                                <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                                    {p.name} (S/ {p.price}) - Stock: {p.stock}
                                </option>
                            ))}
                         </select>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-700">Cantidad</label>
                         <input 
                            type="number" 
                            min="1" 
                            className="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                            value={productQuantity}
                            onChange={e => setProductQuantity(Number(e.target.value))}
                         />
                    </div>
                    <div className="col-span-2">
                         <label className="block text-sm font-medium text-slate-700">Concepto Auto.</label>
                         <input type="text" disabled className="w-full mt-1 p-2.5 bg-slate-200 text-slate-500 border border-slate-200 rounded-lg"
                            value={formData.concept || 'Seleccione producto...'} />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Monto (S/)</label>
                    <input 
                        required 
                        type="number" 
                        step="0.01" 
                        disabled={paymentType === 'product'} // Auto-calculated for products
                        className={`w-full mt-1 p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition ${paymentType === 'product' ? 'bg-slate-100 text-slate-500' : 'bg-slate-50'}`}
                        value={formData.amount || 0} 
                        onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Fecha</label>
                    <input required type="date" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                        value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Método de Pago</label>
                    <select className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                        value={formData.method} onChange={e => setFormData({...formData, method: e.target.value as PaymentMethod})}>
                        {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Estado</label>
                    <select className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                        value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                        <option value="Paid">Pagado</option>
                        <option value="Pending">Pendiente</option>
                    </select>
                </div>
            </div>
            <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">
                    {isEditMode ? 'Actualizar Pago' : 'Registrar'}
                </button>
            </div>
          </form>
      </Modal>
    </div>
  );
};

export default Payments;
