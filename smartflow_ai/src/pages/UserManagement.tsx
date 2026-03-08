import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Role } from '../types';

const ROLE_CONFIG: Record<Role, { label: string; color: string; bg: string; border: string; icon: string }> = {
  admin: { label: 'Administrator', color: 'text-purple-300', bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: '👑' },
  operator: { label: 'Operator', color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: '🔧' },
  viewer: { label: 'Viewer', color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: '👁️' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  active: { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' },
  pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/10', dot: 'bg-yellow-400' },
  suspended: { label: 'Suspended', color: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-400' },
  inactive: { label: 'Inactive', color: 'text-slate-400', bg: 'bg-slate-500/10', dot: 'bg-slate-400' },
};

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: ['view_dashboard', 'manage_signals', 'trigger_emergency', 'manage_users', 'view_analytics', 'resolve_alerts'],
  operator: ['view_dashboard', 'manage_signals', 'trigger_emergency', 'view_analytics', 'resolve_alerts'],
  viewer: ['view_dashboard', 'view_analytics'],
};

const PERM_MATRIX: { label: string; key: string }[] = [
  { label: 'View Dashboard', key: 'view_dashboard' },
  { label: 'Manage Signals', key: 'manage_signals' },
  { label: 'Trigger Emergency', key: 'trigger_emergency' },
  { label: 'Manage Users', key: 'manage_users' },
  { label: 'View Analytics', key: 'view_analytics' },
  { label: 'Resolve Alerts', key: 'resolve_alerts' },
];

type Toast = { id: number; message: string; type: 'success' | 'error' | 'info' };

function EditUserModal({ user, onClose, onSave }: { user: User; onClose: () => void; onSave: (data: Partial<User>) => void }) {
  const [form, setForm] = useState({ name: user.name, role: user.role as Role, department: user.department, phone: user.phone, bio: user.bio, status: user.status });
  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    onSave({
      ...form,
      permissions: ROLE_PERMISSIONS[form.role],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">{user.avatar}</div>
            <div>
              <h3 className="text-white font-bold text-lg">Edit User</h3>
              <p className="text-slate-400 text-xs">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 transition" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Department</label>
              <input value={form.department} onChange={e => set('department', e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 transition" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Phone</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 transition" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(ROLE_CONFIG) as [Role, typeof ROLE_CONFIG[Role]][]).map(([role, conf]) => (
                <button key={role} onClick={() => set('role', role)}
                  className={`p-2 rounded-lg border-2 text-center transition-all ${form.role === role ? `${conf.bg} ${conf.border}` : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}>
                  <div className="text-lg">{conf.icon}</div>
                  <div className={`text-xs font-semibold ${form.role === role ? conf.color : 'text-slate-400'}`}>{conf.label}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Account Status</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(STATUS_CONFIG).map(([status, conf]) => (
                <button key={status} onClick={() => set('status', status)}
                  className={`p-2 rounded-lg border transition-all text-center ${form.status === status ? `${conf.bg} border-current ${conf.color}` : 'bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${conf.dot} mx-auto mb-1`} />
                  <div className="text-xs font-medium">{conf.label}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Bio</label>
            <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={2} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 transition resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition text-sm">Cancel</button>
          <button onClick={handleSave} className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition text-sm">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ user, onClose, onConfirm }: { user: User; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-white font-bold text-lg">Delete Account</h3>
          <p className="text-slate-400 text-sm mt-1">Are you sure you want to permanently delete <span className="text-white font-semibold">{user.name}</span>'s account? This action cannot be undone.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition text-sm">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-500/20 transition text-sm">Delete</button>
        </div>
      </div>
    </div>
  );
}

function UserCard({ u, currentUser, onEdit, onDelete, onStatusChange }: {
  u: User; currentUser: User | null;
  onEdit: (u: User) => void; onDelete: (u: User) => void;
  onStatusChange: (id: string, s: User['status']) => void;
}) {
  const role = ROLE_CONFIG[u.role];
  const status = STATUS_CONFIG[u.status];
  const isSelf = currentUser?.id === u.id;

  return (
    <div className={`bg-slate-800/50 border rounded-xl p-4 transition-all hover:border-slate-600 ${u.status === 'suspended' ? 'border-red-500/20 opacity-70' : u.status === 'pending' ? 'border-yellow-500/20' : 'border-slate-700/50'}`}>
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">{u.avatar}</div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-800 ${status.dot}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm">{u.name}</span>
            {isSelf && <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-full">You</span>}
          </div>
          <p className="text-slate-400 text-xs truncate">{u.email}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${role.bg} ${role.color} border ${role.border}`}>
              {role.icon} {role.label}
            </span>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
              {status.label}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-700/50 grid grid-cols-2 gap-2 text-xs text-slate-500">
        <span>📂 {u.department || 'N/A'}</span>
        <span>📅 {u.createdAt}</span>
        <span>🕐 {u.lastLogin}</span>
        <span>📞 {u.phone || '—'}</span>
      </div>
      {u.bio && <p className="mt-2 text-xs text-slate-500 italic truncate">"{u.bio}"</p>}
      {/* Permissions pills */}
      <div className="mt-3 flex flex-wrap gap-1">
        {PERM_MATRIX.map(({ label, key }) => {
          const has = u.permissions?.includes(key);
          return (
            <span key={key} className={`text-xs px-1.5 py-0.5 rounded font-medium ${has ? `${role.bg} ${role.color}` : 'bg-slate-700/40 text-slate-600 line-through'}`}>
              {label}
            </span>
          );
        })}
      </div>
      {/* Actions */}
      <div className="mt-3 flex gap-2">
        <button onClick={() => onEdit(u)} className="flex-1 text-xs py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition font-medium flex items-center justify-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Edit
        </button>
        {u.status === 'pending' && (
          <button onClick={() => onStatusChange(u.id, 'active')} className="flex-1 text-xs py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition font-medium">
            ✓ Approve
          </button>
        )}
        {u.status === 'active' && !isSelf && (
          <button onClick={() => onStatusChange(u.id, 'suspended')} className="flex-1 text-xs py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg transition font-medium">
            ⊘ Suspend
          </button>
        )}
        {u.status === 'suspended' && (
          <button onClick={() => onStatusChange(u.id, 'active')} className="flex-1 text-xs py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition font-medium">
            ↺ Reactivate
          </button>
        )}
        {!isSelf && (
          <button onClick={() => onDelete(u)} className="text-xs py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}

export function UserManagement() {
  const { user: currentUser, users, updateUser, deleteUser, changeUserStatus } = useAuth();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<Role | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.department?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    admins: users.filter(u => u.role === 'admin').length,
    operators: users.filter(u => u.role === 'operator').length,
    viewers: users.filter(u => u.role === 'viewer').length,
  };

  const handleEdit = (u: User) => setEditUser(u);
  const handleSaveEdit = (data: Partial<User>) => {
    if (!editUser) return;
    const name = data.name || editUser.name;
    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    updateUser(editUser.id, { ...data, avatar: initials });
    setEditUser(null);
    addToast(`${name}'s account updated successfully.`);
  };
  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteUser(deleteTarget.id);
    addToast(`${deleteTarget.name}'s account has been deleted.`, 'error');
    setDeleteTarget(null);
  };
  const handleStatusChange = (id: string, status: User['status']) => {
    changeUserStatus(id, status);
    const u = users.find(u => u.id === id);
    const msgs: Record<string, string> = { active: 'activated', suspended: 'suspended', pending: 'set to pending', inactive: 'deactivated' };
    addToast(`${u?.name}'s account ${msgs[status] || 'updated'}.`, status === 'suspended' ? 'error' : 'success');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl animate-in slide-in-from-right backdrop-blur-sm transition-all
            ${t.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' :
              t.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-300' :
              'bg-blue-500/20 border-blue-500/30 text-blue-300'}`}>
            <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage team members, roles, and account access</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-1 gap-1">
            <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded text-sm transition ${viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
            </button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded text-sm transition ${viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total', val: stats.total, color: 'text-white', bg: 'bg-slate-700/50', border: 'border-slate-600/50' },
          { label: 'Active', val: stats.active, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: 'Pending', val: stats.pending, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
          { label: 'Suspended', val: stats.suspended, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
          { label: '👑 Admins', val: stats.admins, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
          { label: '🔧 Operators', val: stats.operators, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          { label: '👁️ Viewers', val: stats.viewers, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl px-3 py-3 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or department..." className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition" />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value as Role | 'all')} className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400 transition">
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="operator">Operator</option>
          <option value="viewer">Viewer</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400 transition">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Pending Approval Banner */}
      {stats.pending > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <p className="text-yellow-400 font-semibold text-sm">{stats.pending} Account{stats.pending > 1 ? 's' : ''} Awaiting Approval</p>
            <p className="text-yellow-400/70 text-xs">New user registrations are pending your review and activation.</p>
          </div>
          <button onClick={() => setFilterStatus('pending')} className="ml-auto text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/40 px-3 py-1.5 rounded-lg transition font-medium">
            Review Now
          </button>
        </div>
      )}

      {/* User Grid / List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-white text-lg font-semibold">No users found</h3>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filter criteria.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(u => (
            <UserCard key={u.id} u={u} currentUser={currentUser} onEdit={handleEdit} onDelete={setDeleteTarget} onStatusChange={handleStatusChange} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {/* List Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
            <div className="col-span-3">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Department</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Last Login</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {filtered.map(u => {
            const role = ROLE_CONFIG[u.role];
            const status = STATUS_CONFIG[u.status];
            const isSelf = currentUser?.id === u.id;
            return (
              <div key={u.id} className={`grid grid-cols-12 gap-4 items-center px-4 py-3 bg-slate-800/50 border rounded-xl transition hover:border-slate-600 ${u.status === 'suspended' ? 'border-red-500/20 opacity-70' : u.status === 'pending' ? 'border-yellow-500/20' : 'border-slate-700/50'}`}>
                <div className="col-span-3 flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">{u.avatar}</div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800 ${status.dot}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-white text-sm font-medium truncate">{u.name}</p>
                      {isSelf && <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1 rounded-full flex-shrink-0">You</span>}
                    </div>
                    <p className="text-slate-400 text-xs truncate">{u.email}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${role.bg} ${role.color} border ${role.border}`}>{role.icon} {role.label}</span>
                </div>
                <div className="col-span-2 text-slate-400 text-xs truncate">{u.department || '—'}</div>
                <div className="col-span-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>{status.label}</span>
                </div>
                <div className="col-span-2 text-slate-400 text-xs">{u.lastLogin}</div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button onClick={() => handleEdit(u)} className="text-xs px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition">Edit</button>
                  {u.status === 'pending' && <button onClick={() => handleStatusChange(u.id, 'active')} className="text-xs px-2.5 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg transition">Approve</button>}
                  {u.status === 'active' && !isSelf && <button onClick={() => handleStatusChange(u.id, 'suspended')} className="text-xs px-2.5 py-1.5 bg-orange-500/10 text-orange-400 rounded-lg transition">Suspend</button>}
                  {u.status === 'suspended' && <button onClick={() => handleStatusChange(u.id, 'active')} className="text-xs px-2.5 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg transition">Activate</button>}
                  {!isSelf && (
                    <button onClick={() => setDeleteTarget(u)} className="text-xs px-2.5 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Permissions Matrix */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-4">Permissions Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-slate-400 font-medium pb-3 pr-4">Permission</th>
                {(['admin', 'operator', 'viewer'] as Role[]).map(role => (
                  <th key={role} className="text-center pb-3 px-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_CONFIG[role].bg} ${ROLE_CONFIG[role].color} border ${ROLE_CONFIG[role].border}`}>
                      {ROLE_CONFIG[role].icon} {ROLE_CONFIG[role].label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {PERM_MATRIX.map(({ label, key }) => (
                <tr key={key} className="hover:bg-slate-700/20 transition">
                  <td className="py-2.5 pr-4 text-slate-300 font-medium">{label}</td>
                  {(['admin', 'operator', 'viewer'] as Role[]).map(role => {
                    const has = ROLE_PERMISSIONS[role].includes(key);
                    return (
                      <td key={role} className="py-2.5 px-4 text-center">
                        {has
                          ? <span className="inline-flex w-6 h-6 rounded-full bg-emerald-500/20 items-center justify-center mx-auto"><svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>
                          : <span className="inline-flex w-6 h-6 rounded-full bg-slate-700/40 items-center justify-center mx-auto"><svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></span>
                        }
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSave={handleSaveEdit} />}
      {deleteTarget && <DeleteConfirmModal user={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
    </div>
  );
}
