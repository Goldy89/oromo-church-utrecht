import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { UserPlus, Trash2, Loader2, AlertCircle, CheckCircle, Shield, ShieldCheck } from 'lucide-react';
import { getUsers, addUser, deleteUser } from './api';

export default function AdminUsers() {
  const [users, setUsers] = useState<{ username: string; role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await addUser(newUsername, newPassword);
      setNewUsername('');
      setNewPassword('');
      setStatus({ type: 'success', message: `User "${newUsername}" created` });
      await loadUsers();
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to add user' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (username: string) => {
    if (!confirm(`Delete user "${username}"?`)) return;
    try {
      await deleteUser(username);
      setStatus({ type: 'success', message: `User "${username}" deleted` });
      await loadUsers();
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete user' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {status && (
        <div className={`mb-6 p-3 rounded-xl flex items-center gap-2 text-sm ${
          status.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {status.message}
        </div>
      )}

      {/* Current Users */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <h2 className="font-serif text-xl font-bold text-primary mb-4">Admin Users</h2>
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.username} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                {user.role === 'owner' ? (
                  <ShieldCheck size={18} className="text-accent-dark" />
                ) : (
                  <Shield size={18} className="text-gray-400" />
                )}
                <div>
                  <span className="font-medium text-gray-800">{user.username}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                    user.role === 'owner'
                      ? 'bg-accent/20 text-accent-dark'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
              {user.role !== 'owner' && (
                <button
                  onClick={() => handleDelete(user.username)}
                  className="text-red-400 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none p-1"
                  title="Delete user"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add User Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-serif text-xl font-bold text-primary mb-4">Add New Admin</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              placeholder="Minimum 6 characters"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-primary-light disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-2 cursor-pointer border-none text-sm"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            {submitting ? 'Creating...' : 'Add User'}
          </button>
        </form>
      </div>
    </div>
  );
}
