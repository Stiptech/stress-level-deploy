import { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { LandingPage } from './components/LandingPage';
import { ProfilePage } from './components/ProfilePage';
import { QuestionPage } from './components/QuestionPage';
import { ResultPage } from './components/ResultPage';

export type User = {
  id: string;
  email: string;
  name: string;
  studentId: string;
  age: number;
  gender: string;
  university: string;
  department: string;
  photoUrl?: string;
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'auth' | 'profile' | 'questions' | 'results'>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);

  // Check if user is logged in (localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    setCurrentPage('landing');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    setCurrentPage('landing');
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const handleStart = () => {
    setCurrentPage('questions');
    setAnswers([]);
  };

  const handleGoToAuth = () => {
    setCurrentPage('auth');
  };

  const handleGoToProfile = () => {
    setCurrentPage('profile');
  };

  const handleProfileComplete = () => {
    setCurrentPage('landing');
  };

  const handleComplete = (finalAnswers: number[]) => {
    setAnswers(finalAnswers);
    setCurrentPage('results');
  };

  const handleRestart = () => {
    setCurrentPage('landing');
    setAnswers([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'landing' && (
        <LandingPage 
          user={user}
          onStart={handleStart} 
          onGoToAuth={handleGoToAuth}
          onGoToProfile={handleGoToProfile}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'auth' && <AuthPage onLogin={handleLogin} onBack={() => setCurrentPage('landing')} />}
      {currentPage === 'profile' && user && (
        <ProfilePage 
          user={user} 
          onUpdate={handleUpdateProfile}
          onComplete={handleProfileComplete}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'questions' && (
        <QuestionPage 
          user={user}
          onComplete={handleComplete}
          onGoToAuth={handleGoToAuth}
          onGoToProfile={handleGoToProfile}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'results' && (
        <ResultPage 
          answers={answers} 
          user={user}
          onRestart={handleRestart}
          onGoToAuth={handleGoToAuth}
          onGoToProfile={handleGoToProfile}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
