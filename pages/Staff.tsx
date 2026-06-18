
import React, { useState } from 'react';
import { UserCog, Clock, CheckCircle, Plus, Pencil, LogIn, LogOut, Calendar, Download, FileText, Trash2 } from 'lucide-react';
import { useGym } from '../context/GymContext';
import { Staff } from '../types';
import Modal from '../components/Modal';

// Declare jsPDF on Window interface
declare global {
  interface Window {
    jspdf: any;
  }
}

const StaffPage: React.FC = () => {
    const { staff, attendance, addStaff, updateStaff, deleteStaff, markAttendance } = useGym();
    const [activeTab, setActiveTab] = useState<'list' | 'attendance'>('list');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<Partial<Staff>>({});

    // Filter State for Attendance
    const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of month
        end: new Date().toISOString().split('T')[0]
    });

    const openAddModal = () => {
        setIsEditMode(false);
        setFormData({ 
            status: 'Active', 
            hiredDate: new Date().toISOString().split('T')[0],
            shiftStart: '08:00',
            shiftEnd: '17:00'
        });
        setIsModalOpen(true);
    };

    const openEditModal = (s: Staff) => {
        setIsEditMode(true);
        setFormData(s);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar a este miembro del personal?")) {
            deleteStaff(id);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode && formData.id) {
            updateStaff(formData as Staff);
        } else {
            addStaff({ ...formData, id: Math.random().toString(36).substr(2, 9) } as Staff);
        }
        setIsModalOpen(false);
    };

    const handleMarkAttendance = (staffId: string) => {
        markAttendance(staffId);
    };

    // Helper to check if currently clocked in
    const isClockedIn = (staffId: string) => {
        const today = new Date().toISOString().split('T')[0];
        return attendance.some(a => a.staffId === staffId && a.date === today && !a.checkOut);
    };

    // Helper: Calculate Minutes from "HH:MM"
    const getMinutes = (timeStr: string) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    const filteredAttendanceList = attendance.filter(r => {
        const matchesDate = r.date >= dateRange.start && r.date <= dateRange.end;
        const matchesStaff = selectedStaffId === 'all' || r.staffId === selectedStaffId;
        return matchesDate && matchesStaff;
    });

    // Export Logic CSV
    const handleExportExcel = () => {
        if (filteredAttendanceList.length === 0) {
            alert("No hay registros en el rango de fechas seleccionado.");
            return;
        }

        let csvContent = "Fecha,Empleado,Horario Entrada,Entrada Real,Estado Puntualidad,Horario Salida,Salida Real,Total Horas,Horas Extra\n";

        filteredAttendanceList.forEach(record => {
            const employee = staff.find(s => s.id === record.staffId);
            if (!employee) return;

            let punctualityStatus = "Puntual";
            if (record.checkIn > employee.shiftStart) {
                const lateBy = getMinutes(record.checkIn) - getMinutes(employee.shiftStart);
                punctualityStatus = `Tarde (${lateBy}m)`;
            }

            let overtime = "No";
            if (record.checkOut && record.checkOut > employee.shiftEnd) {
                const extra = getMinutes(record.checkOut) - getMinutes(employee.shiftEnd);
                if (extra > 0) overtime = `Si (${extra}m)`;
            }

            const row = [
                record.date,
                `"${employee.fullName}"`,
                employee.shiftStart,
                record.checkIn,
                punctualityStatus,
                employee.shiftEnd,
                record.checkOut || "Sin marcar",
                record.hoursWorked ? record.hoursWorked.toFixed(2) : "0",
                overtime
            ].join(",");

            csvContent += row + "\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `asistencia_gym_${dateRange.start}_${dateRange.end}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Export Logic PDF
    const handleExportPDF = () => {
        if (!window.jspdf) {
            alert("Librería PDF cargando... intente de nuevo.");
            return;
        }
        if (filteredAttendanceList.length === 0) {
            alert("No hay registros para exportar.");
            return;
        }

        const doc = new window.jspdf.jsPDF();

        // Calculate Stats
        let totalLate = 0;
        let totalOnTime = 0;
        let totalOvertime = 0;

        const tableBody = filteredAttendanceList.map(record => {
            const emp = staff.find(s => s.id === record.staffId);
            if (!emp) return [];

            const isLate = record.checkIn > emp.shiftStart;
            if (isLate) totalLate++; else totalOnTime++;

            const isOvertime = record.checkOut && record.checkOut > emp.shiftEnd;
            if (isOvertime) totalOvertime++;

            return [
                record.date,
                emp.fullName,
                record.checkIn,
                isLate ? "TARDE" : "Puntual",
                record.checkOut || "--",
                record.hoursWorked ? `${record.hoursWorked.toFixed(2)}h` : "-",
                isOvertime ? "SI" : "NO"
            ];
        });

        // Header
        doc.setFontSize(18);
        doc.setTextColor(16, 185, 129); // Emerald
        doc.text("Reporte de Asistencia", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 26);
        doc.text(`Rango: ${dateRange.start} al ${dateRange.end}`, 14, 32);

        // Summary Box
        const employeeLabel = selectedStaffId === 'all' ? "Todo el Personal" : staff.find(s => s.id === selectedStaffId)?.fullName;
        
        doc.setDrawColor(203, 213, 225);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, 40, 180, 25, 3, 3, 'FD');
        
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(`Resumen: ${employeeLabel}`, 20, 50);
        
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text(`Días Trabajados: ${filteredAttendanceList.length}`, 20, 58);
        doc.text(`Puntualidad: ${totalOnTime} veces`, 70, 58);
        doc.setTextColor(180, 83, 9); // Amber
        doc.text(`Tardanzas: ${totalLate} veces`, 120, 58);
        doc.setTextColor(59, 130, 246); // Blue
        doc.text(`Con Extras: ${totalOvertime} días`, 160, 58);

        // Table
        doc.autoTable({
            startY: 75,
            head: [['Fecha', 'Empleado', 'Entrada', 'Estado', 'Salida', 'Horas', 'Extra']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59], textColor: 255 }, // Slate 800
            styles: { fontSize: 9, cellPadding: 3 },
            didParseCell: (data: any) => {
                // Color status column
                if (data.section === 'body' && data.column.index === 3) {
                    if (data.cell.raw === 'TARDE') {
                        data.cell.styles.textColor = [220, 38, 38]; // Red
                        data.cell.styles.fontStyle = 'bold';
                    } else {
                        data.cell.styles.textColor = [21, 128, 61]; // Emerald
                    }
                }
                // Color overtime column
                if (data.section === 'body' && data.column.index === 6 && data.cell.raw === 'SI') {
                    data.cell.styles.textColor = [37, 99, 235]; // Blue
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });

        doc.save(`Reporte_Asistencia_${dateRange.start}.pdf`);
    };

    return (
        <div className="space-y-6">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900">Gestión de Personal</h1>
                <div className="flex gap-4">
                    <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                        <button 
                            onClick={() => setActiveTab('list')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'list' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Personal
                        </button>
                        <button 
                            onClick={() => setActiveTab('attendance')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'attendance' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Asistencia
                        </button>
                    </div>
                    {activeTab === 'list' && (
                        <button onClick={openAddModal} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm">
                            <Plus size={16} /> Nuevo Personal
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staff.map(s => {
                        const working = isClockedIn(s.id);
                        return (
                            <div key={s.id} className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col gap-4 relative group transition hover:shadow-md ${working ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-slate-200'}`}>
                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                    <button onClick={() => openEditModal(s)} className="text-slate-400 hover:text-blue-600 p-1 hover:bg-slate-100 rounded" title="Editar">
                                        <Pencil size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(s.id)} className="text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded" title="Eliminar">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${working ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                                            <UserCog size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{s.fullName}</h3>
                                            <p className="text-sm text-slate-500">{s.role}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-slate-600 space-y-1">
                                    <p>📞 {s.phone}</p>
                                    <p>✉️ {s.email}</p>
                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                                        <Clock size={14} className="text-slate-400" />
                                        <span className="font-medium text-slate-700">Turno: {s.shiftStart} - {s.shiftEnd}</span>
                                    </div>
                                </div>
                                <div className="pt-2 mt-auto border-t border-slate-100 flex items-center justify-between">
                                     <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${working ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {working ? 'Trabajando' : 'Sin turno activo'}
                                     </span>
                                     <button 
                                        onClick={() => handleMarkAttendance(s.id)}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition
                                            ${working 
                                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}
                                        `}
                                     >
                                        {working ? (
                                            <><LogOut size={14} /> Salida</>
                                        ) : (
                                            <><LogIn size={14} /> Entrada</>
                                        )}
                                     </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'attendance' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Controls Toolbar */}
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2 min-w-max">
                            <Clock size={18} /> Historial y Reportes
                        </h3>
                        
                        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                            {/* Staff Selector */}
                            <select 
                                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={selectedStaffId}
                                onChange={(e) => setSelectedStaffId(e.target.value)}
                            >
                                <option value="all">Todo el Personal</option>
                                {staff.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                            </select>

                            {/* Date Range */}
                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm flex-1 md:flex-none">
                                <span className="text-xs text-slate-500 font-medium uppercase">Desde</span>
                                <input 
                                    type="date" 
                                    className="text-sm bg-transparent border-none focus:ring-0 text-slate-700 p-0 w-full md:w-auto"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                />
                                <span className="text-slate-300">|</span>
                                <span className="text-xs text-slate-500 font-medium uppercase">Hasta</span>
                                <input 
                                    type="date" 
                                    className="text-sm bg-transparent border-none focus:ring-0 text-slate-700 p-0 w-full md:w-auto"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                />
                            </div>
                            
                            {/* Export Buttons */}
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleExportPDF}
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition shadow-sm text-sm font-medium flex-1 md:flex-none"
                                    title="Descargar Reporte PDF con estadísticas"
                                >
                                    <FileText size={16} /> PDF
                                </button>
                                <button 
                                    onClick={handleExportExcel}
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm text-sm font-medium flex-1 md:flex-none"
                                    title="Exportar datos a Excel"
                                >
                                    <Download size={16} /> Excel
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white text-slate-500 text-sm font-semibold border-b border-slate-200">
                                    <th className="p-4">Empleado</th>
                                    <th className="p-4">Fecha</th>
                                    <th className="p-4">Turno</th>
                                    <th className="p-4">Entrada</th>
                                    <th className="p-4">Salida</th>
                                    <th className="p-4">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAttendanceList.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400">No hay registros para los filtros seleccionados.</td>
                                    </tr>
                                ) : (
                                    filteredAttendanceList.map(record => {
                                        const s = staff.find(st => st.id === record.staffId);
                                        const isOpen = !record.checkOut;
                                        
                                        // Punctuality Check for UI
                                        let statusColor = "text-emerald-600";
                                        let statusText = "Puntual";
                                        if (s && record.checkIn > s.shiftStart) {
                                            statusColor = "text-amber-600";
                                            statusText = "Tarde";
                                        }

                                        return (
                                            <tr key={record.id} className="text-sm hover:bg-slate-50 transition">
                                                <td className="p-4 font-medium text-slate-900">{s?.fullName || 'Desconocido'}</td>
                                                <td className="p-4 text-slate-600">{record.date}</td>
                                                <td className="p-4 text-xs text-slate-400">{s?.shiftStart} - {s?.shiftEnd}</td>
                                                <td className={`p-4 font-medium ${statusColor}`}>
                                                    {record.checkIn} 
                                                    {statusText === "Tarde" && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Tarde</span>}
                                                </td>
                                                <td className="p-4 text-slate-600">{record.checkOut || '--:--'}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isOpen ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {isOpen ? 'En curso' : 'Finalizado'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Editar Personal" : "Nuevo Personal"}>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                        <input required type="text" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition" 
                            value={formData.fullName || ''} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Cargo</label>
                        <select className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                            value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                            <option value="Entrenador">Entrenador</option>
                            <option value="Recepción">Recepción</option>
                            <option value="Limpieza">Limpieza</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    
                    {/* Shift Inputs */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase">Horario Laboral</div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Hora Entrada</label>
                            <input type="time" required className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition" 
                                value={formData.shiftStart || ''} onChange={e => setFormData({...formData, shiftStart: e.target.value})} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Hora Salida</label>
                            <input type="time" required className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition" 
                                value={formData.shiftEnd || ''} onChange={e => setFormData({...formData, shiftEnd: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Teléfono</label>
                            <input type="text" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition" 
                                value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <input type="email" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition" 
                                value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Fecha Contratación</label>
                        <input type="date" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition" 
                            value={formData.hiredDate || ''} onChange={e => setFormData({...formData, hiredDate: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Estado</label>
                        <select className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                            value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                            <option value="Active">Activo</option>
                            <option value="Inactive">Inactivo</option>
                        </select>
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

export default StaffPage;
