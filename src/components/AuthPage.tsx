import { useState } from 'react';
import { Brain, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { User as UserType } from '../App';

interface AuthPageProps {
  onLogin: (user: UserType) => void;
  onBack: () => void;
}

export function AuthPage({ onLogin, onBack }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email dan password harus diisi');
      return;
    }

    if (!isLogin && !name) {
      setError('Nama harus diisi');
      return;
    }

    // Mock authentication - in real app, this would call an API
    if (isLogin) {
      // Login: check localStorage for existing users
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        onLogin(userWithoutPassword);
      } else {
        setError('Email atau password salah');
      }
    } else {
      // Sign up: create new user
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if email already exists
      if (users.find((u: any) => u.email === email)) {
        setError('Email sudah terdaftar');
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name,
        studentId: '',
        age: 0,
        gender: 'male',
        university: '',
        department: '',
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      const { password: _, ...userWithoutPassword } = newUser;
      onLogin(userWithoutPassword);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">Stress Level Assessment</h1>
          <p className="text-gray-600">
            {isLogin ? 'Masuk ke akun Anda' : 'Buat akun baru'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              {isLogin ? 'Masuk' : 'Daftar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-purple-600 hover:text-purple-700"
            >
              {isLogin ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
            </button>
          </div>
        </div>

        {/* Demo Note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Mode Demo: Data disimpan di browser Anda</p>
        </div>
      </div>
    </div>
  );
}
