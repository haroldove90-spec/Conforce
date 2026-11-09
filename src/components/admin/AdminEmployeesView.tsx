import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmployeeProfile, Role } from '../../types';
import {
  Briefcase,
  UserPlus,
  Search,
  Mail,
  ShieldCheck,
  Building2,
  Calendar,
  Lock,
  Trash2,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const AdminEmployeesView: React.FC = () => {
  const {
    employees,
    addEmployee,
    toggleSuspendEmployee,
    deleteEmployee
  } = useApp();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<{ [id: string]: boolean }>({});

  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [systemRole, setSystemRole] = useState<Role>('admin');
  const [department, setDepartment] = useState('Operaciones & Soporte');
  const [formError, setFormError] = useState('');

  const departments = [
    'all',
    'Dirección General & Tecnología',
    'Operaciones & Soporte',
    'Logística & Despacho',
    'Finanzas & Cobranza',
    'Comercial & Afiliaciones'
  ];

  const filteredEmployees = employees.filter((emp) => {
    const q = search.toLowerCase();
    const matchSearch =
      emp.fullName.toLowerCase().includes(q) ||
      emp.roleTitle.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.username.toLowerCase().includes(q);

    const matchDept = deptFilter === 'all' || emp.department === deptFilter;
    return matchSearch && matchDept;
  });

  const togglePasswordVisibility = (id: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim() || !roleTitle.trim()) {
      setFormError('Por favor llena todos los datos requeridos.');
      return;
    }

    if (employees.some((emp) => emp.username.toLowerCase() === username.trim().toLowerCase())) {
      setFormError('Ya existe un colaborador con este usuario.');
      return;
    }

    addEmployee({
      userId: `usr-emp-${Date.now()}`,
      fullName: fullName.trim(),
      username: username.trim(),
      email: email.trim(),
      password: password.trim(),
      roleTitle: roleTitle.trim(),
      systemRole,
      department: department.trim(),
      status: 'active'
    });

    setFullName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setRoleTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 border border-zinc-800 p-5 rounded-3xl text-white shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#D4021D] flex items-center justify-center text-white shadow-lg shadow-red-950">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-[10px] font-bold text-red-300 uppercase">
              Plantilla de Colaboradores y Staff
            </div>
            <h2 className="text-lg font-black text-white mt-1">
              Nómina & Cuentas de Empleados ({employees.length})
            </h2>
            <p className="text-xs text-zinc-400">
              Control de perfiles internos, credenciales seguras y roles corporativos autorizados
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D4021D] hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-950 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Agregar Colaborador</span>
        </button>
      </div>

      {/* Search and Dept Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar colaborador por nombre, cargo, usuario o email..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D4021D]"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#D4021D] cursor-pointer"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'Todos los Departamentos' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          const isPresetSuperadmin = emp.username === 'haroldo90' || emp.username === 'anyl_admin' || emp.username === 'anyel_admin';
          const isPasswordVisible = revealedPasswords[emp.id];

          return (
            <div
              key={emp.id}
              className="bg-white border border-slate-200 hover:border-zinc-400 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-zinc-950 text-white font-black text-sm flex items-center justify-center shadow-xs">
                      {(emp.fullName || emp.username || 'E').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        {emp.fullName || emp.username || 'Empleado'}
                        {isPresetSuperadmin && (
                          <span className="text-[10px] text-red-600 font-black">★</span>
                        )}
                      </h3>
                      <p className="text-xs font-semibold text-[#D4021D]">{emp.roleTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleSuspendEmployee(emp.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        emp.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {emp.status === 'active' ? 'Activo' : 'Inactivo'}
                    </button>
                    {!isPresetSuperadmin && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar al colaborador ${emp.fullName}?`)) {
                            deleteEmployee(emp.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Eliminar colaborador"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-3 text-xs text-slate-600 border-t border-slate-100 mt-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700">{emp.department}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="font-mono text-slate-700 font-bold">
                        {isPasswordVisible ? emp.password : '••••••••••••'}
                      </span>
                    </div>
                    <button
                      onClick={() => togglePasswordVisibility(emp.id)}
                      className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                      title={isPasswordVisible ? 'Ocultar contraseña' : 'Ver credencial'}
                    >
                      {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Alta: {emp.createdAt}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-zinc-900 text-zinc-200 text-[10px] font-bold">
                  {emp.systemRole.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#D4021D]" />
                Registrar Nuevo Colaborador
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/80 border border-red-700 text-xs text-red-200 rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateEmployee} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ej. Lic. Fernando Morales"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Usuario de Acceso *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ej. fernandom"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="fernando@conforce.com"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Cargo / Puesto *
                  </label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="ej. Coordinador de Rutas"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Rol en Sistema
                  </label>
                  <select
                    value={systemRole}
                    onChange={(e) => setSystemRole(e.target.value as Role)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none cursor-pointer"
                  >
                    <option value="admin">Administrador (Admin)</option>
                    <option value="seller">Operador Negocio (Seller)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Departamento
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none cursor-pointer"
                >
                  <option value="Dirección General & Tecnología">Dirección General & Tecnología</option>
                  <option value="Operaciones & Soporte">Operaciones & Soporte</option>
                  <option value="Logística & Despacho">Logística & Despacho</option>
                  <option value="Finanzas & Cobranza">Finanzas & Cobranza</option>
                  <option value="Comercial & Afiliaciones">Comercial & Afiliaciones</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4021D] hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Guardar Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
