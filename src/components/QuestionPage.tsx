import { useState } from 'react';
import { ArrowRight, ArrowLeft, Brain, LogOut, UserCircle, LogIn } from 'lucide-react';
import { User } from '../App';

interface QuestionPageProps {
  user: User | null;
  onComplete: (answers: number[]) => void;
  onGoToAuth: () => void;
  onGoToProfile: () => void;
  onLogout: () => void;
}

// PSS-10 Questions (Scale 0-4)
const pssQuestions = [
  "Dalam 1 bulan terakhir, seberapa sering kamu merasa kewalahan karena hal tak terduga?",
  "Dalam 1 bulan terakhir, seberapa sering kamu merasa tidak mampu mengontrol hal penting dalam hidup?",
  "Dalam 1 bulan terakhir, seberapa sering kamu merasa gugup atau stres?",
  "Dalam 1 bulan terakhir, seberapa sering kamu merasa yakin atas kemampuan menghadapi masalah pribadi?",
  "Dalam 1 bulan terakhir, seberapa sering kamu merasa hal berjalan sesuai keinginanmu?",
  "Dalam 1 bulan terakhir, seberapa sering kamu merasa tidak mampu mengatasi semua hal yang harus dilakukan?",
  "Dalam 1 bulan terakhir, seberapa sering kamu mampu mengontrol gangguan dalam hidup?",
  "Dalam 1 bulan terakhir, seberapa sering kamu merasa berada di puncak situasi?",
  "Dalam 1 bulan terakhir, seberapa sering kamu marah karena hal di luar kendalimu?",
  "Dalam 1 bulan terakhir, seberapa sering kamu merasa kesulitan menavigasi semua hal?",
];

// GAD-7 Questions (Scale 0-3)
const gadQuestions = [
  "Merasa gugup, cemas, atau gelisah",
  "Tidak dapat berhenti atau mengontrol kekhawatiran",
  "Terlalu khawatir tentang banyak hal",
  "Sulit rileks",
  "Gelisah sehingga sulit diam",
  "Mudah kesal atau mudah marah",
  "Takut sesuatu buruk akan terjadi",
];

// PHQ-9 Questions (Scale 0-3)
const phqQuestions = [
  "Sedikit minat atau kesenangan dalam melakukan hal",
  "Merasa sedih, murung, atau putus asa",
  "Sulit tidur, sering terbangun, atau tidur berlebihan",
  "Merasa lelah atau kurang energi",
  "Nafsu makan buruk atau makan berlebihan",
  "Merasa buruk tentang diri sendiri, menganggap diri gagal",
  "Sulit fokus pada hal, seperti membaca atau menonton TV",
  "Bergerak atau berbicara sangat lambat atau sebaliknya jadi gelisah",
  "Pikiran menyakiti diri atau lebih baik mati",
];

const pssScale = [
  { label: "Tidak Pernah", value: 0 },
  { label: "Hampir Tidak Pernah", value: 1 },
  { label: "Kadang-kadang", value: 2 },
  { label: "Cukup Sering", value: 3 },
  { label: "Sangat Sering", value: 4 },
];

const gadPhqScale = [
  { label: "Tidak Sama Sekali", value: 0 },
  { label: "Beberapa Hari", value: 1 },
  { label: "Lebih dari Setengah Hari", value: 2 },
  { label: "Hampir Setiap Hari", value: 3 },
];

export function QuestionPage({ user, onComplete, onGoToAuth, onGoToProfile, onLogout }: QuestionPageProps) {
  const totalQuestions = pssQuestions.length + gadQuestions.length + phqQuestions.length;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(totalQuestions).fill(-1));

  const getCurrentSection = () => {
    if (currentQuestion < pssQuestions.length) {
      return {
        section: 'PSS-10',
        description: 'Perceived Stress Scale (Periode 1 bulan terakhir)',
        question: pssQuestions[currentQuestion],
        scale: pssScale,
        questionInSection: currentQuestion + 1,
        totalInSection: pssQuestions.length,
      };
    } else if (currentQuestion < pssQuestions.length + gadQuestions.length) {
      const idx = currentQuestion - pssQuestions.length;
      return {
        section: 'GAD-7',
        description: 'Generalized Anxiety Disorder (Periode 2 minggu terakhir)',
        question: gadQuestions[idx],
        scale: gadPhqScale,
        questionInSection: idx + 1,
        totalInSection: gadQuestions.length,
      };
    } else {
      const idx = currentQuestion - pssQuestions.length - gadQuestions.length;
      return {
        section: 'PHQ-9',
        description: 'Patient Health Questionnaire (Periode 2 minggu terakhir)',
        question: phqQuestions[idx],
        scale: gadPhqScale,
        questionInSection: idx + 1,
        totalInSection: phqQuestions.length,
      };
    }
  };

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const isAnswered = answers[currentQuestion] !== -1;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const currentData = getCurrentSection();

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

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">
              Pertanyaan {currentQuestion + 1} dari {totalQuestions}
            </span>
            <span className="text-gray-600 text-sm">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          {/* Section Header */}
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full mb-4">
              {currentData.section} - Pertanyaan {currentData.questionInSection}/{currentData.totalInSection}
            </div>
            <p className="text-gray-600 text-sm">{currentData.description}</p>
          </div>

          {/* Question Text */}
          <p className="text-gray-900 text-center mb-8 text-lg">
            {currentData.question}
          </p>

          {/* Answer Options */}
          <div className="space-y-3 mb-8">
            {currentData.scale.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`w-full px-6 py-4 rounded-lg border-2 transition-all text-left ${
                  answers[currentQuestion] === option.value
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion] === option.value
                        ? 'border-purple-600 bg-purple-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {answers[currentQuestion] === option.value && (
                      <div className="w-3 h-3 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-gray-700">{option.label}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4">
            <button
              onClick={handleBack}
              disabled={currentQuestion === 0}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                currentQuestion > 0
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                isAnswered
                  ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {currentQuestion < totalQuestions - 1 ? 'Selanjutnya' : 'Lihat Hasil'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-1 mt-8 flex-wrap">
          {Array.from({ length: totalQuestions }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentQuestion
                  ? 'bg-purple-600 w-8'
                  : answers[index] !== -1
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
