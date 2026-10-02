import { Brain, AlertCircle, CheckCircle, AlertTriangle, RefreshCw, Download, LogOut, UserCircle, LogIn } from 'lucide-react';
import { User } from '../App';

interface ResultPageProps {
  answers: number[];
  user: User | null;
  onRestart: () => void;
  onGoToAuth: () => void;
  onGoToProfile: () => void;
  onLogout: () => void;
}

// PSS-10 reverse scored items (0-indexed: 3,4,6,7)
const pssReverseIndices = new Set([3, 4, 6, 7]);

function calculatePSS10Score(answers: number[]): number {
  let total = 0;
  for (let i = 0; i < 10; i++) {
    if (pssReverseIndices.has(i)) {
      total += 4 - answers[i];
    } else {
      total += answers[i];
    }
  }
  return total;
}

function getPSSLabel(score: number): string {
  if (score >= 27) return 'High Perceived Stress';
  if (score >= 14) return 'Moderate Stress';
  return 'Low Perceived Stress';
}

function getGAD7Label(score: number): string {
  if (score >= 15) return 'Severe Anxiety';
  if (score >= 10) return 'Moderate Anxiety';
  if (score >= 5) return 'Mild Anxiety';
  return 'Minimal Anxiety';
}

function getPHQ9Label(score: number): string {
  if (score >= 20) return 'Severe Depression';
  if (score >= 15) return 'Moderately Severe Depression';
  if (score >= 10) return 'Moderate Depression';
  if (score >= 5) return 'Mild Depression';
  return 'No Depression';
}

function getSeverity(domain: 'stress' | 'anxiety' | 'depression', score: number): string {
  if (domain === 'stress') {
    if (score >= 27) return 'SEVERE';
    if (score >= 14) return 'MODERATE';
    return 'LIGHT';
  } else if (domain === 'anxiety') {
    if (score >= 15) return 'SEVERE';
    if (score >= 10) return 'MODERATE';
    if (score >= 5) return 'LIGHT';
    return 'NONE';
  } else {
    if (score >= 20) return 'SEVERE';
    if (score >= 10) return 'MODERATE';
    if (score >= 5) return 'LIGHT';
    return 'NONE';
  }
}

export function ResultPage({ answers, user, onRestart, onGoToAuth, onGoToProfile, onLogout }: ResultPageProps) {
  // Split answers
  const pssAnswers = answers.slice(0, 10);
  const gadAnswers = answers.slice(10, 17);
  const phqAnswers = answers.slice(17, 26);

  // Calculate scores
  const pssScore = calculatePSS10Score(pssAnswers);
  const gadScore = gadAnswers.reduce((sum, val) => sum + val, 0);
  const phqScore = phqAnswers.reduce((sum, val) => sum + val, 0);

  // Get labels
  const pssLabel = getPSSLabel(pssScore);
  const gadLabel = getGAD7Label(gadScore);
  const phqLabel = getPHQ9Label(phqScore);

  // Get severities
  const stressSeverity = getSeverity('stress', pssScore);
  const anxietySeverity = getSeverity('anxiety', gadScore);
  const depressionSeverity = getSeverity('depression', phqScore);

  // Determine primary domain
  const severityRank = { NONE: 0, LIGHT: 1, MODERATE: 2, SEVERE: 3 };
  const domains = [
    { name: 'STRESS', severity: stressSeverity },
    { name: 'ANXIETY', severity: anxietySeverity },
    { name: 'DEPRESSION', severity: depressionSeverity },
  ];
  const primary = domains.reduce((max, domain) =>
    severityRank[domain.severity as keyof typeof severityRank] > severityRank[max.severity as keyof typeof severityRank]
      ? domain
      : max
  );

  const getSeverityColor = (severity: string) => {
    if (severity === 'SEVERE') return 'text-red-600';
    if (severity === 'MODERATE') return 'text-yellow-600';
    if (severity === 'LIGHT') return 'text-blue-600';
    return 'text-green-600';
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'SEVERE') return <AlertCircle className="w-12 h-12 text-red-600" />;
    if (severity === 'MODERATE') return <AlertTriangle className="w-12 h-12 text-yellow-600" />;
    return <CheckCircle className="w-12 h-12 text-green-600" />;
  };

  const handleDownload = () => {
    const userData = user ? `Nama: ${user.name}
NIM: ${user.studentId}
Usia: ${user.age}
Gender: ${user.gender === 'male' ? 'Laki-laki' : user.gender === 'female' ? 'Perempuan' : 'Lainnya'}
Universitas: ${user.university}
Program Studi: ${user.department}

` : 'Pengguna: Anonim (Belum login)\n\n';

    const data = `Hasil Assessment Stress Level
=================================
${userData}HASIL TES:
=================================
PSS-10 (Stress):
  Skor: ${pssScore}/40
  Kategori: ${pssLabel}
  Severity: ${stressSeverity}

GAD-7 (Anxiety):
  Skor: ${gadScore}/21
  Kategori: ${gadLabel}
  Severity: ${anxietySeverity}

PHQ-9 (Depression):
  Skor: ${phqScore}/27
  Kategori: ${phqLabel}
  Severity: ${depressionSeverity}

KESIMPULAN:
=================================
Domain Utama: ${primary.name}
Severity Utama: ${primary.severity}

Tanggal: ${new Date().toLocaleDateString('id-ID')}
`;

    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stress-assessment-${user?.studentId || 'anonymous'}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl">Stress Level Assessment</span>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button
                  onClick={onGoToProfile}
                  className="hover:bg-gray-50 rounded-full p-1 transition-all"
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
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={onGoToAuth}
                className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden sm:inline">Masuk</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="mb-4 text-gray-900">Hasil Assessment Anda</h1>
          {user ? (
            <p className="text-gray-600">
              {user.name} - {user.studentId}
            </p>
          ) : (
            <p className="text-gray-600">
              Mode Anonim -{' '}
              <button onClick={onGoToAuth} className="text-purple-600 hover:text-purple-700 underline">
                Login untuk menyimpan hasil
              </button>
            </p>
          )}
        </div>

        {/* Primary Result Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 mb-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {getSeverityIcon(primary.severity)}
            </div>
            <h2 className={`mb-2 ${getSeverityColor(primary.severity)}`}>
              Domain Utama: {primary.name}
            </h2>
            <div className="text-gray-600">
              Severity: {primary.severity}
            </div>
          </div>
        </div>

        {/* Detailed Scores */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* PSS-10 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-gray-900 mb-2">PSS-10</h3>
              <p className="text-gray-600 text-sm mb-4">Perceived Stress Scale</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <div className="text-center mb-2">
                <span className="text-3xl text-gray-900">{pssScore}</span>
                <span className="text-gray-600">/40</span>
              </div>
              <div className="text-center text-sm text-gray-600">{pssLabel}</div>
            </div>
            <div className={`text-center px-3 py-2 rounded-lg ${getSeverityColor(stressSeverity)} bg-opacity-10`}>
              {stressSeverity}
            </div>
          </div>

          {/* GAD-7 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-gray-900 mb-2">GAD-7</h3>
              <p className="text-gray-600 text-sm mb-4">Generalized Anxiety</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <div className="text-center mb-2">
                <span className="text-3xl text-gray-900">{gadScore}</span>
                <span className="text-gray-600">/21</span>
              </div>
              <div className="text-center text-sm text-gray-600">{gadLabel}</div>
            </div>
            <div className={`text-center px-3 py-2 rounded-lg ${getSeverityColor(anxietySeverity)} bg-opacity-10`}>
              {anxietySeverity}
            </div>
          </div>

          {/* PHQ-9 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-gray-900 mb-2">PHQ-9</h3>
              <p className="text-gray-600 text-sm mb-4">Depression Screening</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <div className="text-center mb-2">
                <span className="text-3xl text-gray-900">{phqScore}</span>
                <span className="text-gray-600">/27</span>
              </div>
              <div className="text-center text-sm text-gray-600">{phqLabel}</div>
            </div>
            <div className={`text-center px-3 py-2 rounded-lg ${getSeverityColor(depressionSeverity)} bg-opacity-10`}>
              {depressionSeverity}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h3 className="mb-6 text-gray-900 text-center">Rekomendasi</h3>
          <div className="space-y-4">
            {primary.severity === 'SEVERE' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">
                  ⚠️ Hasil menunjukkan tingkat {primary.name.toLowerCase()} yang tinggi. 
                  Sangat disarankan untuk segera berkonsultasi dengan profesional kesehatan mental 
                  atau layanan konseling kampus Anda.
                </p>
              </div>
            )}
            {primary.severity === 'MODERATE' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  💡 Hasil menunjukkan tingkat {primary.name.toLowerCase()} yang moderat. 
                  Pertimbangkan untuk berbicara dengan konselor atau psikolog untuk mendapatkan 
                  strategi coping yang lebih baik.
                </p>
              </div>
            )}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                📚 Manfaatkan layanan konseling dan kesehatan mental yang tersedia di kampus Anda.
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">
                🌱 Praktikkan self-care: tidur cukup, olahraga teratur, dan jaga pola makan sehat.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownload}
            className="px-8 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all shadow-sm hover:shadow-md inline-flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Hasil
          </button>
          <button
            onClick={onRestart}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Ulangi Tes
          </button>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 text-center text-sm text-gray-500 max-w-3xl mx-auto">
          <p>
            <strong>Disclaimer:</strong> Tes ini menggunakan instrumen standar PSS-10, GAD-7, dan PHQ-9 
            untuk tujuan skrining awal. Hasil ini bukan diagnosis klinis dan tidak menggantikan evaluasi 
            profesional. Jika Anda mengalami gejala yang mengganggu atau berkepanjangan, 
            silakan berkonsultasi dengan profesional kesehatan mental yang berkualifikasi.
          </p>
        </div>
      </div>
    </div>
  );
}
