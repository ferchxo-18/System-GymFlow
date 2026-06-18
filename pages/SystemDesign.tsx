import React from 'react';

const SystemDesign: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Documentación Técnica del Sistema</h1>
            <p className="text-slate-500">Diseño estructural, modelo de base de datos y flujos lógicos para GymFlow Pro.</p>
        </div>

        {/* Database Schema */}
        <section className="space-y-4">
            <h2 className="text-xl font-bold text-indigo-700 border-l-4 border-indigo-700 pl-3">1. Modelo de Base de Datos Relacional</h2>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                <div className="font-mono text-sm text-slate-700 whitespace-pre">
{`
// TABLA CLIENTES (clients)
PK  id: UUID
    full_name: VARCHAR(100)
    dni: VARCHAR(20) [UNIQUE]
    phone: VARCHAR(20)
    email: VARCHAR(100)
    join_date: DATE
    status: ENUM('active', 'inactive')
    
// TABLA MEMBRESIAS (memberships)
PK  id: UUID
FK  client_id: UUID -> clients.id
    type_name: VARCHAR(50)  // "Mensual", "Anual"
    start_date: DATE
    end_date: DATE
    price: DECIMAL(10,2)
    is_active: BOOLEAN

// TABLA PAGOS (payments)
PK  id: UUID
FK  client_id: UUID -> clients.id
    amount: DECIMAL(10,2)
    payment_date: DATETIME
    method: ENUM('cash', 'card', 'yape', 'transfer')
    concept: VARCHAR(100)
    status: ENUM('paid', 'pending')

// TABLA MEDIDAS (measurements)
PK  id: UUID
FK  client_id: UUID -> clients.id
    date_taken: DATE
    weight_kg: DECIMAL(5,2)
    height_cm: INT
    waist_cm: DECIMAL(5,2)
    chest_cm: DECIMAL(5,2)
    notes: TEXT

// TABLA PERSONAL (staff)
PK  id: UUID
    full_name: VARCHAR(100)
    role: ENUM('trainer', 'admin', 'reception')
    hired_date: DATE

// TABLA ASISTENCIA (attendance)
PK  id: UUID
FK  staff_id: UUID -> staff.id
    check_in: DATETIME
    check_out: DATETIME [NULLABLE]
    work_date: DATE

// TABLA INVENTARIO (products)
PK  id: UUID
    code: VARCHAR(20) [UNIQUE]
    name: VARCHAR(100)
    category: VARCHAR(50)
    stock_qty: INT
    min_stock_alert: INT
    unit_price: DECIMAL(10,2)
`}
                </div>
            </div>
        </section>

        {/* Logic Flowcharts */}
        <section className="space-y-4">
            <h2 className="text-xl font-bold text-indigo-700 border-l-4 border-indigo-700 pl-3">2. Flujogramas de Procesos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4">Registro de Nuevo Miembro</h3>
                    <div className="space-y-3 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">1</span>
                            <span>Recepcionista ingresa datos DNI + Nombre.</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">2</span>
                            <span>Selecciona Plan (Mensual/Anual).</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">3</span>
                            <span>Registra el Pago inicial.</span>
                        </div>
                        <div className="pl-3 border-l-2 border-slate-200 ml-3 py-1">
                             <p className="text-xs text-slate-400 italic">Si Pago = OK → Estado Activo</p>
                             <p className="text-xs text-slate-400 italic">Si Pago = Pendiente → Estado Pendiente</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">4</span>
                            <span>Sistema calcula fecha Vencimiento.</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4">Alerta de Stock Bajo</h3>
                    <div className="space-y-3 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">1</span>
                            <span>Venta de Producto en Recepción.</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">2</span>
                            <span>Sistema resta cantidad vendida.</span>
                        </div>
                         <div className="pl-3 border-l-2 border-slate-200 ml-3 py-1">
                             <p className="text-xs text-slate-400 italic">¿Stock actual &lt; Stock Mínimo?</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-red-100 text-red-800 flex items-center justify-center font-bold text-xs">!</span>
                            <span>SI: Generar Notificación Dashboard (Rojo).</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Stack Recommendations */}
         <section className="space-y-4">
            <h2 className="text-xl font-bold text-indigo-700 border-l-4 border-indigo-700 pl-3">3. Recomendaciones de Implementación</h2>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <ul className="list-disc list-inside space-y-2 text-slate-700 text-sm">
                    <li><strong>Backend:</strong> Node.js con NestJS o Python con FastAPI para escalabilidad.</li>
                    <li><strong>Base de Datos:</strong> PostgreSQL (Relacional, ideal para pagos y estructuras rígidas).</li>
                    <li><strong>Frontend:</strong> React (como esta demo) o Next.js para renderizado híbrido.</li>
                    <li><strong>Infraestructura:</strong> Docker containers orquestados en AWS o Google Cloud Run.</li>
                    <li><strong>AppSheet/No-Code:</strong> Viable solo para prototipos (MVP), no recomendado para escalabilidad a largo plazo (&gt;500 miembros).</li>
                </ul>
            </div>
        </section>
    </div>
  );
};

export default SystemDesign;
