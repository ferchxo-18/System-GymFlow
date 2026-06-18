import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Users, TrendingUp, AlertTriangle, DollarSign, Download, Clock, ChevronRight } from 'lucide-react';
import { MembershipStatus } from '../types';
import { useGym } from '../context/GymContext';
import { useNavigate } from 'react-router-dom';

// Declare jsPDF on Window interface
declare global {
  interface Window {
    jspdf: any;
  }
}

const Dashboard: React.FC = () => {
  const { clients, payments, inventory } = useGym();
  const navigate = useNavigate();

  // Calculated Metrics
  const activeMembers = clients.filter(c => c.status === MembershipStatus.ACTIVE).length;
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const lowStockItems = inventory.filter(p => p.stock <= p.minStock);
  
  // Logic: Expiring within 7 days
  const upcomingExpirations = clients.filter(c => {
    if (c.status !== MembershipStatus.ACTIVE) return false;
    const expiry = new Date(c.membershipExpiry);
    const today = new Date();
    // Normalize time to compare dates only
    today.setHours(0,0,0,0);
    expiry.setHours(0,0,0,0);
    
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 7;
  }).sort((a,b) => new Date(a.membershipExpiry).getTime() - new Date(b.membershipExpiry).getTime());

  const handleDownloadPDF = () => {
    if (!window.jspdf) {
      alert("La librería PDF aún está cargando. Intente de nuevo en unos segundos.");
      return;
    }

    const doc = new window.jspdf.jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129); // Emerald color
    doc.text("GymFlow Pro", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Reporte General - ${new Date().toLocaleDateString()}`, 14, 30);

    // KPI Section
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Métricas Clave", 14, 45);
    
    const kpiData = [
      ["Miembros Activos", activeMembers.toString()],
      ["Ingresos Totales", `S/ ${totalRevenue.toLocaleString()}`],
      ["Productos en Stock Bajo", lowStockItems.length.toString()],
      ["Membresías por Vencer (7 días)", upcomingExpirations.length.toString()]
    ];

    doc.autoTable({
      startY: 50,
      head: [['Métrica', 'Valor']],
      body: kpiData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 10 }
    });

    // Low Stock Alert Section
    let finalY = doc.lastAutoTable.finalY + 15;
    
    if (lowStockItems.length > 0) {
        doc.text("Alerta de Stock Bajo", 14, finalY);
        doc.autoTable({
            startY: finalY + 5,
            head: [['Producto', 'Stock Actual', 'Mínimo']],
            body: lowStockItems.map(i => [i.name, i.stock, i.minStock]),
            theme: 'striped',
            headStyles: { fillColor: [239, 68, 68] } // Red for alert
        });
        finalY = doc.lastAutoTable.finalY + 15;
    }

    // Expirations Section
    if (upcomingExpirations.length > 0) {
        doc.text("Próximos Vencimientos (7 días)", 14, finalY);
        doc.autoTable({
            startY: finalY + 5,
            head: [['Cliente', 'Vence', 'Teléfono']],
            body: upcomingExpirations.map(c => [c.fullName, c.membershipExpiry, c.phone]),
            theme: 'striped',
            headStyles: { fillColor: [245, 158, 11] } // Amber
        });
    }

    doc.save(`gym-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Chart Data Preparation (Static for demo visuals)
  const revenueData = [
    { name: 'Ene', income: 4000 },
    { name: 'Feb', income: 3500 },
    { name: 'Mar', income: 5200 },
    { name: 'Abr', income: 4800 },
    { name: 'May', income: 6100 },
  ];

  const attendanceData = [
    { name: 'Lun', users: 120 },
    { name: 'Mar', users: 145 },
    { name: 'Mie', users: 132 },
    { name: 'Jue', users: 150 },
    { name: 'Vie', users: 160 },
    { name: 'Sab', users: 90 },
    { name: 'Dom', users: 45 },
  ];

  const StatCard = ({ title, value, icon, color, subtext }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
        <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
          {React.cloneElement(icon, { className: `w-5 h-5 ${color.replace('bg-', 'text-')}` })}
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        {subtext && <span className="text-xs text-slate-500 mt-1">{subtext}</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Panel General</h1>
        <div className="flex gap-2">
           <button 
             onClick={handleDownloadPDF}
             className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-sm"
           >
             <Download size={18} />
             Descargar Reporte PDF
           </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Miembros Activos" 
          value={activeMembers} 
          icon={<Users />} 
          color="bg-blue-500"
          subtext="+12% vs mes anterior"
        />
        <StatCard 
          title="Ingresos (Mes)" 
          value={`S/ ${totalRevenue.toLocaleString()}`} 
          icon={<DollarSign />} 
          color="bg-emerald-500"
          subtext="Meta mensual al 85%"
        />
        <StatCard 
          title="Por Vencer (7 días)" 
          value={upcomingExpirations.length} 
          icon={<AlertTriangle />} 
          color="bg-amber-500"
          subtext="Acción requerida"
        />
        <StatCard 
          title="Stock Crítico" 
          value={lowStockItems.length} 
          icon={<TrendingUp />} 
          color="bg-red-500"
          subtext="Productos bajo mínimo"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Charts Column */}
        <div className="xl:col-span-2 space-y-6">
            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Ingresos Financieros</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                        <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f1f5f9' }}
                        />
                        <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Weekly Attendance */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Afluencia Semanal</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                        <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
                    </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Alerts & Notifications Column */}
        <div className="space-y-6">
             {/* Expiration Alerts */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-amber-50 flex justify-between items-center">
                    <h3 className="font-semibold text-amber-900 flex items-center gap-2">
                        <AlertTriangle size={18} />
                        Vencimientos Próximos
                    </h3>
                    <span className="bg-white text-amber-700 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        {upcomingExpirations.length}
                    </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                    {upcomingExpirations.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-sm">
                            <Clock size={24} className="mx-auto mb-2 opacity-30" />
                            No hay membresías por vencer en los próximos 7 días.
                        </div>
                    ) : (
                        upcomingExpirations.map(client => {
                            const daysLeft = Math.ceil((new Date(client.membershipExpiry).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
                            return (
                                <div key={client.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img src={client.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-slate-200" />
                                        <div>
                                            <p className="font-medium text-slate-900 text-sm">{client.fullName}</p>
                                            <p className="text-xs text-slate-500">Vence: {client.membershipExpiry}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xs font-bold text-amber-600">{daysLeft} días</span>
                                        <button 
                                            onClick={() => navigate('/clients')}
                                            className="text-[10px] text-blue-600 hover:underline flex items-center justify-end gap-1 mt-1"
                                        >
                                            Ver <ChevronRight size={10} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
             </div>

             {/* Quick Actions or Other Info */}
             <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl shadow-lg text-white">
                <h3 className="font-bold mb-2">Acciones Rápidas</h3>
                <p className="text-slate-400 text-sm mb-4">Gestione las alertas prioritarias directamente desde los módulos correspondientes.</p>
                <button 
                    onClick={() => navigate('/payments')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                >
                    <DollarSign size={16} /> Registrar Renovación
                </button>
             </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;