import { useState, useRef } from 'react';
import { Brain, Camera, Save, LogOut } from 'lucide-react';
import { User } from '../App';

interface ProfilePageProps {
  user: User;
  onUpdate: (user: User) => void;
  onComplete: () => void;
  onLogout: () => void;
}

export function ProfilePage({ user, onUpdate, onComplete, onLogout }: ProfilePageProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    studentId: user.studentId || '',
    age: user.age || 0,
    gender: user.gender || 'male',
    university: user.university || '',
    department: user.department || '',
    photoUrl: user.photoUrl || '',
  });
  const [previewUrl, setPreviewUrl] = useState(user.photoUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        setFormData({ ...formData, photoUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.studentId && formData.age > 0 && formData.university && formData.department) {
      const updatedUser = { ...user, ...formData };
      onUpdate(updatedUser);
      onComplete();
    }
  };

  const isValid = formData.name && formData.studentId && formData.age > 0 && formData.university && formData.department;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl">Stress Level Assessment</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            Keluar
          </button>
        </div>
      </header>

      {/* Profile Form */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="mb-2 text-gray-900 text-center">Profil Saya</h2>
          <p className="text-gray-600 text-center mb-8">
            Lengkapi profil Anda untuk melanjutkan
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div
                  onClick={handlePhotoClick}
                  className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer overflow-hidden border-4 border-white shadow-lg hover:shadow-xl transition-all"
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <Camera className="w-12 h-12 mx-auto mb-2" />
                      <span className="text-sm">Upload Foto</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handlePhotoClick}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-purple-700 transition-all"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-gray-700 mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-gray-700 mb-2">
                NIM <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Masukkan NIM"
              />
            </div>

            {/* Age and Gender */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Usia <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Usia"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>
            </div>

            {/* University */}
            <div>
              <label className="block text-gray-700 mb-2">
                Universitas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Nama universitas"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-gray-700 mb-2">
                Program Studi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Nama program studi"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid}
              className={`w-full px-8 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                isValid
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-5 h-5" />
              Simpan Profil
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
