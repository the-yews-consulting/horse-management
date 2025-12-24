import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, Users, Shield, Search, X, UserCog } from 'lucide-react';
import { Toast } from '../components/Toast';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  hire_date: string | null;
  notes: string;
  created_at: string;
}

interface UserAccount {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
  raw_user_meta_data: any;
  raw_app_meta_data: any;
}

type AccountStatus = 'pending' | 'enabled' | 'disabled';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  account_status: AccountStatus;
  created_at: string;
  updated_at: string;
}

interface TeamMemberFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  hire_date: string;
  notes: string;
}

interface UserAccountFormData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

const teamRoles = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'trainer', label: 'Trainer' },
  { value: 'groom', label: 'Groom' },
  { value: 'vet', label: 'Veterinarian' },
  { value: 'farrier', label: 'Farrier' },
  { value: 'other', label: 'Other' },
];

const userRoles: { value: UserRole; label: string; description: string }[] = [
  { value: 'super_admin', label: 'Super Admin', description: 'Full system access and control' },
  { value: 'admin', label: 'Admin', description: 'Manage content and users' },
  { value: 'moderator', label: 'Moderator', description: 'Edit specific data with limited access' },
  { value: 'user', label: 'User', description: 'Standard user access' },
];

export function Admin() {
  const { user, isSuperAdmin, isAdmin, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'team' | 'users' | 'roles'>('team');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [assigningRole, setAssigningRole] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');

  const [formData, setFormData] = useState<TeamMemberFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'other',
    is_active: true,
    hire_date: '',
    notes: '',
  });

  const [userFormData, setUserFormData] = useState<UserAccountFormData>({
    email: '',
    password: '',
    full_name: '',
    role: 'user',
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  async function fetchData() {
    try {
      setLoading(true);

      if (activeTab === 'team') {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .order('last_name');

        if (error) throw error;
        setTeamMembers(data || []);
      } else if (activeTab === 'users') {
        const { data, error } = await supabase.rpc('get_all_user_accounts');

        if (error) {
          console.error('Error fetching user accounts:', error);
          setToast({ message: 'Failed to load user accounts', type: 'error' });
          setUserAccounts([]);
        } else {
          setUserAccounts(data || []);
        }
      } else if (activeTab === 'roles') {
        const [profilesResult, accountsResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase.rpc('get_all_user_accounts')
        ]);

        if (profilesResult.error) {
          console.error('Error fetching profiles:', profilesResult.error);
          setToast({ message: 'Failed to load user roles', type: 'error' });
          setUserProfiles([]);
        } else {
          setUserProfiles(profilesResult.data || []);
        }

        if (accountsResult.error) {
          console.error('Error fetching user accounts:', accountsResult.error);
          setUserAccounts([]);
        } else {
          setUserAccounts(accountsResult.data || []);
        }
      }
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  function openModal(member?: TeamMember) {
    if (member) {
      setEditingMember(member);
      setFormData({
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        phone: member.phone,
        role: member.role,
        is_active: member.is_active,
        hire_date: member.hire_date || '',
        notes: member.notes,
      });
    } else {
      setEditingMember(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'other',
        is_active: true,
        hire_date: '',
        notes: '',
      });
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingMember(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingMember) {
        const { error } = await supabase
          .from('team_members')
          .update({
            ...formData,
            hire_date: formData.hire_date || null,
          })
          .eq('id', editingMember.id);

        if (error) throw error;
        setToast({ message: 'Team member updated successfully', type: 'success' });
      } else {
        const { error } = await supabase
          .from('team_members')
          .insert([{
            ...formData,
            hire_date: formData.hire_date || null,
            created_by: user?.id,
          }]);

        if (error) throw error;
        setToast({ message: 'Team member added successfully', type: 'success' });
      }

      closeModal();
      fetchData();
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' });
    }
  }

  async function confirmDelete() {
    if (!deletingMember) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', deletingMember.id);

      if (error) throw error;
      setToast({ message: 'Team member deleted successfully', type: 'success' });
      setDeletingMember(null);
      fetchData();
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' });
    }
  }

  const filteredTeamMembers = teamMembers.filter(member =>
    member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUserAccounts = userAccounts.filter(account =>
    account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.phone && account.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredUserProfiles = userProfiles.filter(profile =>
    profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (profile.full_name && profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  async function handleRoleChange(profileId: string, newRole: UserRole) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', profileId);

      if (error) throw error;

      setToast({ message: 'User role updated successfully', type: 'success' });
      setEditingProfile(null);
      fetchData();

      if (profileId === user?.id) {
        await refreshProfile();
      }
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' });
    }
  }

  async function handleActiveToggle(profileId: string, isActive: boolean) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', profileId);

      if (error) throw error;

      setToast({ message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, type: 'success' });
      fetchData();
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' });
    }
  }

  async function handleAccountStatusChange(profileId: string, newStatus: AccountStatus) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_status: newStatus })
        .eq('id', profileId);

      if (error) throw error;

      const statusLabel = newStatus === 'enabled' ? 'enabled' : newStatus === 'disabled' ? 'disabled' : 'set to pending';
      setToast({ message: `Account ${statusLabel} successfully`, type: 'success' });
      fetchData();
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' });
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreatingUser(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setToast({ message: 'You must be logged in to create users', type: 'error' });
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(userFormData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Create user error:', result);
        throw new Error(result.error || `Failed to create user (${response.status})`);
      }

      setToast({ message: 'User account created successfully', type: 'success' });
      setShowUserModal(false);
      setUserFormData({
        email: '',
        password: '',
        full_name: '',
        role: 'user',
      });
      fetchData();
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setCreatingUser(false);
    }
  }

  async function handleAssignRole(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedUserForRole) {
      setToast({ message: 'Please select a user', type: 'error' });
      return;
    }

    setAssigningRole(true);

    try {
      const selectedAccount = userAccounts.find(acc => acc.id === selectedUserForRole);
      if (!selectedAccount) {
        throw new Error('Selected user not found');
      }

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: selectedUserForRole,
          email: selectedAccount.email,
          role: selectedRole,
          is_active: true,
        }, {
          onConflict: 'id'
        });

      if (upsertError) throw upsertError;

      setToast({ message: 'Role assigned successfully', type: 'success' });
      setShowAssignRoleModal(false);
      setSelectedUserForRole('');
      setSelectedRole('user');
      fetchData();
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setAssigningRole(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-1">Manage team members and user accounts</p>
        </div>
        {activeTab === 'team' && (
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Team Member
          </button>
        )}
        {activeTab === 'users' && (isAdmin || isSuperAdmin) && (
          <button
            onClick={() => setShowUserModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add User Account
          </button>
        )}
        {activeTab === 'roles' && isSuperAdmin && (
          <button
            onClick={() => {
              setShowAssignRoleModal(true);
              setSelectedUserForRole('');
              setSelectedRole('user');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Assign Role
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <button
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${
              activeTab === 'team'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" />
            Team Members
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            User Accounts
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${
                activeTab === 'roles'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <UserCog className="w-4 h-4" />
              Role Management
            </button>
          )}
        </div>

        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={
              activeTab === 'team'
                ? 'Search team members...'
                : activeTab === 'users'
                ? 'Search user accounts...'
                : 'Search user profiles...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {activeTab === 'team' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hire Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTeamMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No team members found matching your search' : 'No team members yet'}
                    </td>
                  </tr>
                ) : (
                  filteredTeamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.first_name} {member.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.email || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {teamRoles.find(r => r.value === member.role)?.label || member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.hire_date ? new Date(member.hire_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openModal(member)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingMember(member)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Sign In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUserAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No user accounts found matching your search' : 'No user accounts found'}
                    </td>
                  </tr>
                ) : (
                  filteredUserAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{account.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{account.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          account.email_confirmed_at
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {account.email_confirmed_at ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(account.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(account.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {account.last_sign_in_at
                            ? new Date(account.last_sign_in_at).toLocaleDateString()
                            : 'Never'}
                        </div>
                        {account.last_sign_in_at && (
                          <div className="text-xs text-gray-500">
                            {new Date(account.last_sign_in_at).toLocaleTimeString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500 font-mono">{account.id.slice(0, 8)}...</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUserProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No user profiles found matching your search' : 'No user profiles found'}
                    </td>
                  </tr>
                ) : (
                  filteredUserProfiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{profile.email}</div>
                        <div className="text-xs text-gray-500 font-mono">{profile.id.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{profile.full_name || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingProfile?.id === profile.id ? (
                          <select
                            value={editingProfile.role}
                            onChange={(e) => setEditingProfile({ ...editingProfile, role: e.target.value as UserRole })}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {userRoles.map(role => (
                              <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            profile.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                            profile.role === 'admin' ? 'bg-orange-100 text-orange-800' :
                            profile.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {userRoles.find(r => r.value === profile.role)?.label || profile.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={profile.account_status}
                          onChange={(e) => handleAccountStatusChange(profile.id, e.target.value as AccountStatus)}
                          disabled={profile.id === user?.id}
                          className={`text-xs px-2 py-1 border rounded font-semibold cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                            profile.account_status === 'enabled' ? 'bg-green-50 text-green-800 border-green-200' :
                            profile.account_status === 'pending' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                            'bg-red-50 text-red-800 border-red-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="enabled">Enabled</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleActiveToggle(profile.id, !profile.is_active)}
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition ${
                            profile.is_active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {profile.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(profile.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingProfile?.id === profile.id ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleRoleChange(profile.id, editingProfile.role)}
                              className="text-green-600 hover:text-green-900 font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingProfile(null)}
                              className="text-gray-600 hover:text-gray-900 font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingProfile(profile)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            disabled={profile.id === user?.id && profile.role === 'super_admin'}
                            title={profile.id === user?.id && profile.role === 'super_admin' ? 'Cannot change your own super admin role' : 'Change role'}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="team-first-name" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      id="team-first-name"
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="team-last-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      id="team-last-name"
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="team-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="team-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="team-phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      id="team-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="team-role" className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      id="team-role"
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {teamRoles.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="team-hire-date" className="block text-sm font-medium text-gray-700 mb-1">
                      Hire Date
                    </label>
                    <input
                      id="team-hire-date"
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active Team Member</span>
                  </label>
                </div>

                <div>
                  <label htmlFor="team-notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="team-notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional information about this team member"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingMember ? 'Update Team Member' : 'Add Team Member'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deletingMember && (
        <DeleteConfirmModal
          title="Delete Team Member"
          message={`Are you sure you want to delete ${deletingMember.first_name} ${deletingMember.last_name}? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingMember(null)}
        />
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Create User Account
              </h2>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    id="user-email"
                    type="email"
                    required
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="user-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    id="user-password"
                    type="password"
                    required
                    minLength={6}
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Minimum 6 characters"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>

                <div>
                  <label htmlFor="user-full-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="user-full-name"
                    type="text"
                    value={userFormData.full_name}
                    onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="user-role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    id="user-role"
                    required
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {userRoles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={creatingUser}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingUser ? 'Creating...' : 'Create User Account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserModal(false);
                      setUserFormData({
                        email: '',
                        password: '',
                        full_name: '',
                        role: 'user',
                      });
                    }}
                    disabled={creatingUser}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAssignRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Assign Role to User
              </h2>

              <form onSubmit={handleAssignRole} className="space-y-4">
                <div>
                  <label htmlFor="select-user" className="block text-sm font-medium text-gray-700 mb-1">
                    Select User Account *
                  </label>
                  <select
                    id="select-user"
                    required
                    value={selectedUserForRole}
                    onChange={(e) => setSelectedUserForRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a user...</option>
                    {userAccounts
                      .filter(account => !userProfiles.find(p => p.id === account.id))
                      .map(account => (
                        <option key={account.id} value={account.id}>
                          {account.email}
                          {account.raw_user_meta_data?.full_name ? ` (${account.raw_user_meta_data.full_name})` : ''}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Only showing users without assigned roles
                  </p>
                </div>

                <div>
                  <label htmlFor="assign-role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    id="assign-role"
                    required
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {userRoles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={assigningRole}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {assigningRole ? 'Assigning...' : 'Assign Role'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignRoleModal(false);
                      setSelectedUserForRole('');
                      setSelectedRole('user');
                    }}
                    disabled={assigningRole}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}