import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { updateProfile, updatePassword, getGroupData, startNewCycle } from '../services/api';
import { ArrowLeft, User, Mail, CreditCard, Lock, ShieldCheck, Users, RefreshCw, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, login } = useContext(AppContext);
  
  // State for Personal Info
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    upiId: user?.upiId || ''
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // State for Password
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // State for Flat Data
  const [groupData, setGroupData] = useState(null);
  const [isGroupLoading, setIsGroupLoading] = useState(true);

  // Custom Modal State
  const [confirmModal, setConfirmModal] = useState(null);

  // Load Group Data (to see roommates and admin status)
  useEffect(() => {
    const fetchGroup = async () => {
      if (user?.groupId) {
        try {
          const res = await getGroupData(user.groupId);
          setGroupData(res.data.group);
        } catch (error) {
          console.error("Failed to load group");
        }
      }
      setIsGroupLoading(false);
    };
    fetchGroup();
  }, [user]);

  // ==========================================
  // ACTION EXECUTION FUNCTIONS
  // ==========================================
  const executeProfileUpdate = async () => {
    setConfirmModal(null);
    setIsUpdatingProfile(true);
    try {
      const res = await updateProfile(profileData);
      login(res.data, localStorage.getItem('token'));
      toast.success("Profile updated perfectly! ✨");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const executePasswordUpdate = async () => {
    setConfirmModal(null);
    setIsUpdatingPassword(true);
    try {
      await updatePassword({ 
        currentPassword: passwordData.currentPassword, 
        newPassword: passwordData.newPassword 
      });
      toast.success("Password changed securely! 🔒");
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const executeStartNewCycle = async () => {
    setConfirmModal(null);
    try {
      await startNewCycle(user.groupId);
      toast.success("Dashboard wiped! New cycle started. 🚀");
    } catch (error) {
      toast.error("Failed to start new cycle.");
    }
  };

  // ==========================================
  // MODAL TRIGGERS
  // ==========================================
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setConfirmModal({
      type: 'primary',
      icon: User,
      title: 'Update Profile?',
      desc: 'Are you sure you want to save these changes to your personal information?',
      action: executeProfileUpdate,
      btnText: 'Save Changes'
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match!");
    }
    setConfirmModal({
      type: 'primary',
      icon: Lock,
      title: 'Change Password?',
      desc: 'You will be using this new password the next time you log in.',
      action: executePasswordUpdate,
      btnText: 'Update Password'
    });
  };

  const handleStartNewCycleTrigger = () => {
    setConfirmModal({
      type: 'danger',
      icon: AlertTriangle,
      title: 'Start New Cycle?',
      desc: 'This will archive all current expenses and reset the dashboard balances to zero. Make sure everyone has settled up!',
      action: executeStartNewCycle,
      btnText: 'Yes, Archive Data'
    });
  };

  // Input Field Component for ultra-clean code
  const InputField = ({ icon: Icon, label, type, value, onChange, placeholder }) => (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">{label}</label>
      <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-4 py-3.5 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all group">
        <Icon className="text-slate-400 group-focus-within:text-indigo-500 transition-colors mr-3 flex-shrink-0" size={18} />
        <input 
          type={type} placeholder={placeholder} value={value} onChange={onChange} required
          className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium w-full min-w-0" 
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] font-sans pb-24 md:pb-12 overflow-x-hidden transition-colors">
      
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 pt-8 sm:pt-12 pb-24 px-4 sm:px-6 md:px-8 rounded-b-[2.5rem] shadow-lg relative z-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/" className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 text-white transition-all hover:scale-105 active:scale-95">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <p className="text-indigo-200 font-semibold text-xs sm:text-sm uppercase tracking-wider mb-1">Account</p>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Profile & Settings</h1>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Personal Info & Security */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* PERSONAL INFO CARD */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#1E2330] rounded-[2rem] p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                  <User size={20} className="stroke-[2.5px]" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Personal Info</h2>
              </div>
              
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField icon={User} label="Full Name" type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} />
                  <InputField icon={Mail} label="Email Address" type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} />
                </div>
                <InputField icon={CreditCard} label="UPI ID" type="text" placeholder="name@okicici" value={profileData.upiId} onChange={(e) => setProfileData({...profileData, upiId: e.target.value})} />
                
                <div className="pt-2">
                  <button type="submit" disabled={isUpdatingProfile} className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-70 flex items-center justify-center gap-2 active:scale-95">
                    {isUpdatingProfile ? <><Loader2 size={18} className="animate-spin"/> Saving...</> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* SECURITY CARD */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-[#1E2330] rounded-[2rem] p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                  <ShieldCheck size={20} className="stroke-[2.5px]" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Security</h2>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <InputField icon={Lock} label="Current Password" type="password" placeholder="••••••••" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField icon={Lock} label="New Password" type="password" placeholder="••••••••" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} />
                  <InputField icon={Lock} label="Confirm New Password" type="password" placeholder="••••••••" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={isUpdatingPassword || !passwordData.newPassword} className="w-full md:w-auto px-8 py-3.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
                    {isUpdatingPassword ? <><Loader2 size={18} className="animate-spin"/> Updating...</> : 'Update Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Flat Management & Danger Zone */}
          <div className="space-y-6">
            
            {/* FLAT MEMBERS CARD */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-[#1E2330] rounded-[2rem] p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center">
                  <Users size={20} className="stroke-[2.5px]" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">My Flat</h2>
              </div>
              
              {isGroupLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="animate-spin text-slate-400" /></div>
              ) : groupData ? (
                <div className="space-y-4">
                  {groupData.members.map((member) => (
                    <div key={member._id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-2">
                          {member.name} 
                          {member._id === user._id && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">You</span>}
                          {groupData.admins?.includes(member._id) && <span className="text-[10px] bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full">Admin</span>}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">You are not in a flat yet.</p>
              )}
            </motion.div>

            {/* DANGER ZONE (Start Fresh) - SECURED FOR ADMINS ONLY */}
            {user?.groupId && groupData?.admins?.includes(user._id) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-[#1E2330] rounded-[2rem] p-6 sm:p-8 shadow-xl border border-rose-100 dark:border-rose-900/30 transition-colors relative overflow-hidden">
                {/* Danger Strip */}
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center">
                    <AlertTriangle size={20} className="stroke-[2.5px]" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Admin Zone</h2>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                  Clear the dashboard and archive all current expenses. Use this only when everyone is settled up.
                </p>
                
                <button onClick={handleStartNewCycleTrigger} className="w-full px-4 py-3.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 border border-rose-200 dark:border-rose-500/20">
                  <RefreshCw size={18} /> Start New Cycle
                </button>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* UNIVERSAL CONFIRMATION MODAL */}
      {/* ========================================== */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(null)}
              className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white dark:bg-[#1e293b] p-6 sm:p-8 rounded-[2.5rem] w-full max-w-sm relative z-10 shadow-2xl border border-slate-100 dark:border-slate-700 text-center"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${
                confirmModal.type === 'danger' 
                  ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                  : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
              }`}>
                <confirmModal.icon size={28} className="stroke-[2.5px]" />
              </div>
              
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">{confirmModal.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                {confirmModal.desc}
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmModal(null)} 
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmModal.action} 
                  className={`flex-1 py-4 text-white rounded-2xl font-bold active:scale-95 transition-all shadow-lg ${
                    confirmModal.type === 'danger'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                  }`}
                >
                  {confirmModal.btnText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Profile;