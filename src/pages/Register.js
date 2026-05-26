import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiFlashlightLine, RiEyeLine, RiEyeOffLine,
  RiMailLine, RiLockLine, RiUserLine,
} from 'react-icons/ri';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'USER' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.password.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }
    setLoading(true);
    try {
      await authService.register(form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: '#0d0d1f',
        backgroundImage:
          'radial-gradient(ellipse at 70% 20%, rgba(6,182,212,0.12) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(124,58,237,0.1) 0%, transparent 50%)',
      }}
    >
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl btn-volt flex items-center justify-center">
            <RiFlashlightLine size={20} className="text-obsidian-900" />
          </div>
          <span className="font-display font-800 text-2xl text-white tracking-tight">GymOS</span>
        </div>

        <div className="card-base p-8">
          <div className="mb-7">
            <h2 className="font-display font-700 text-2xl text-white mb-1">Create account</h2>
            <p className="text-sm text-obsidian-400">Get started with GymOS today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-obsidian-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <RiUserLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-500" />
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  className="input-dark w-full pl-9 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-obsidian-400 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <RiMailLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-dark w-full pl-9 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-obsidian-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <RiLockLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-500" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-dark w-full pl-9 pr-10 py-3 rounded-xl text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-obsidian-500 hover:text-obsidian-300 transition-colors"
                >
                  {showPwd ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-obsidian-400 uppercase tracking-wider mb-2">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="input-dark w-full px-4 py-3 rounded-xl text-sm"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl btn-volt text-sm font-semibold mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-obsidian-900/30 border-t-obsidian-900 rounded-full animate-spin" />
              )}
              {loading ? 'Creating…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-obsidian-400">
            Already have an account?{' '}
            <Link to="/login" className="text-volt-500 hover:text-volt-400 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
