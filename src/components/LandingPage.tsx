import { Brain, ClipboardList, LineChart, LogOut, UserCircle, LogIn } from 'lucide-react';
import { User } from '../App';

interface LandingPageProps {
  user: User | null;
  onStart: () => void;
  onGoToAuth: () => void;
  onGoToProfile: () => void;
  onLogout: () => void;
}

export function LandingPage({ user, onStart, onGoToAuth, onGoToProfile, onLogout }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl">Stress Level Assessment</span>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <button
                  onClick={onGoToProfile}
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-all"
                >
                  {user.photoUrl ? (
                    <img 
                      src={user.photoUrl} 
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <UserCircle className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <span className="text-gray-700 hidden sm:inline">{user.name}</span>
                </button>
                
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </>
            ) : (
              <button
                onClick={onGoToAuth}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                <LogIn className="w-5 h-5" />
                <span>Masuk</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Brain className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h1 className="mb-4 text-gray-900">
          Tes Tingkat Stress Mahasiswa Baru
        </h1>
        
        <p className="text-gray-600 max-w-2xl mx-auto mb-12">
          Evaluasi tingkat stress Anda sebagai mahasiswa baru dan dapatkan pemahaman yang lebih baik tentang kesehatan mental Anda
        </p>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm mb-3">
              PSS-10, GAD-7, PHQ-9
            </div>
            <h3 className="mb-2 text-gray-900">Instrumen Standar</h3>
            <p className="text-gray-600 text-sm">
              Menggunakan instrumen psikometri yang telah tervalidasi secara klinis
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                <LineChart className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm mb-3">
              26 PERTANYAAN
            </div>
            <h3 className="mb-2 text-gray-900">Analisis Komprehensif</h3>
            <p className="text-gray-600 text-sm">
              Evaluasi menyeluruh untuk stress, anxiety, dan depression
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm mb-3">
              HASIL DETAIL
            </div>
            <h3 className="mb-2 text-gray-900">Rekomendasi Personal</h3>
            <p className="text-gray-600 text-sm">
              Dapatkan insight dan rekomendasi berdasarkan hasil Anda
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          Mulai Tes Sekarang
        </button>

        {!user && (
          <p className="mt-6 text-gray-500 text-sm">
            Anda dapat mulai tes tanpa login, atau{' '}
            <button onClick={onGoToAuth} className="text-purple-600 hover:text-purple-700 underline">
              login untuk menyimpan hasil
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
