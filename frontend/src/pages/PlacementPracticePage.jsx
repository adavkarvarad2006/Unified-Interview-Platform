import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Briefcase,
  Sparkles,
  Search,
  Calendar,
  Users,
  CheckCircle,
  HelpCircle,
  X,
  PlusCircle,
  ChevronRight,
  Award,
  AlertCircle,
  Sliders,
  Send,
  RefreshCw,
  Clock,
  ArrowRight,
  Zap,
  BookOpen,
  Cpu,
  RotateCcw,
  Check
} from 'lucide-react';

const placementDomains = [
  'CSE', 'Data Structures', 'Algorithms', 'DSA', 'OOP', 'Java', 'Python', 'C', 'C++',
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express.js', 'HTML & CSS',
  'Full-Stack Development', 'REST APIs', 'DBMS', 'SQL', 'Operating Systems',
  'Computer Networks', 'Computer Architecture', 'Software Engineering', 'System Design',
  'Cybersecurity', 'Cloud Computing', 'DevOps', 'Git & Version Control', 'Testing & QA',
  'AI', 'Machine Learning', 'Data Science', 'Generative AI', 'Prompt Engineering', 'Blockchain',
];

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function localDateTime(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function PlacementPracticePage() {
  const { user, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(urlTab || 'browse'); // 'browse', 'ai-quiz', 'applications', 'host'

  useEffect(() => {
    if (urlTab && ['browse', 'ai-quiz', 'applications', 'host'].includes(urlTab)) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  // Candidate State
  const [placements, setPlacements] = useState([]);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [busyPlacementId, setBusyPlacementId] = useState('');

  // Instant On-Demand AI Quiz Generator State
  const [aiTopic, setAiTopic] = useState('Data Structures & Algorithms');
  const [aiCustomTopic, setAiCustomTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('medium');
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const [aiEngine, setAiEngine] = useState('gemini'); // 'gemini' | 'offline'
  const [generatingAiQuiz, setGeneratingAiQuiz] = useState(false);
  const [aiQuizData, setAiQuizData] = useState(null); // { questions, topic, difficulty, engineUsed }
  const [aiQuizIndex, setAiQuizIndex] = useState(0);
  const [aiQuizScore, setAiQuizScore] = useState(0);
  const [aiSelectedOption, setAiSelectedOption] = useState(null);
  const [aiAnswerRevealed, setAiAnswerRevealed] = useState(false);
  const [aiQuizFinished, setAiQuizFinished] = useState(false);
  const [aiHistory, setAiHistory] = useState([]);

  // Host Preview AI Questions State
  const [previewingAi, setPreviewingAi] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState(null);

  // Interactive Quiz Modal State
  const [quizApplication, setQuizApplication] = useState(null);
  const [quizSession, setQuizSession] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [answerFeedback, setAnswerFeedback] = useState(null);

  // Host State (Admin/Counsellor)
  const [hostPlacements, setHostPlacements] = useState([]);
  const [selectedPlacementForApplicants, setSelectedPlacementForApplicants] = useState(null);
  const [applicantsData, setApplicantsData] = useState(null);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [applicantsOrder, setApplicantsOrder] = useState('highest');

  // New Placement Form State
  const now = new Date();
  const defaultOpens = new Date(now.getTime() + 2 * 60 * 1000);
  const defaultDeadline = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const [formData, setFormData] = useState({
    companyName: '',
    title: '',
    description: '',
    location: '',
    domainMode: 'specific',
    domains: ['Data Structures', 'Algorithms'],
    registrationOpensAt: localDateTime(defaultOpens),
    registrationDeadline: localDateTime(defaultDeadline),
    registrationLimit: 50,
    questionCount: 5,
    difficulty: 'medium',
    randomnessPercent: 25,
  });
  const [domainFilterInput, setDomainFilterInput] = useState('');
  const [submittingPlacement, setSubmittingPlacement] = useState(false);

  // Load public placements
  const loadPlacements = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.set('search', search);
      if (selectedDomain) queryParams.set('domain', selectedDomain);
      queryParams.set('sort', sort);

      const res = await api.getPlacements(queryParams.toString());
      if (res.success && res.placements) {
        setPlacements(res.placements);
      }
    } catch (err) {
      console.error('Error fetching placements:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load user applications
  const loadApplications = async () => {
    if (!user) return;
    try {
      const res = await api.getCandidateApplications();
      if (res.success && res.applications) {
        setApplications(res.applications);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  // Load host placements
  const loadHostPlacements = async () => {
    if (!isAdmin) return;
    try {
      const res = await api.getHostPlacements();
      if (res.success && res.placements) {
        setHostPlacements(res.placements);
      }
    } catch (err) {
      console.error('Error loading host placements:', err);
    }
  };

  useEffect(() => {
    loadPlacements();
  }, [search, sort, selectedDomain]);

  useEffect(() => {
    if (user) {
      loadApplications();
    }
    if (isAdmin) {
      loadHostPlacements();
    }
  }, [user, isAdmin]);

  // Instant AI Quiz Generator Handlers
  const handleGenerateAiQuiz = async (e) => {
    if (e) e.preventDefault();
    const finalTopic = aiCustomTopic.trim() || aiTopic;
    if (!finalTopic) return;

    setGeneratingAiQuiz(true);
    setActionError('');
    try {
      const res = await api.generateAiQuiz({
        topic: finalTopic,
        difficulty: aiDifficulty,
        questionCount: aiQuestionCount,
        engine: aiEngine,
      });

      if (res.success && Array.isArray(res.questions) && res.questions.length > 0) {
        setAiQuizData(res);
        setAiQuizIndex(0);
        setAiQuizScore(0);
        setAiSelectedOption(null);
        setAiAnswerRevealed(false);
        setAiQuizFinished(false);
        setAiHistory([]);
      } else {
        setActionError(res.message || 'Failed to generate questions. Please try another topic.');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to generate AI quiz.');
    } finally {
      setGeneratingAiQuiz(false);
    }
  };

  const handleSelectAiOption = (optionIndex) => {
    if (aiAnswerRevealed || !aiQuizData) return;
    const currentQ = aiQuizData.questions[aiQuizIndex];
    const isCorrect = optionIndex === currentQ.correctOptionIndex;

    setAiSelectedOption(optionIndex);
    setAiAnswerRevealed(true);

    if (isCorrect) {
      setAiQuizScore((prev) => prev + 1);
    }

    setAiHistory((prev) => [
      ...prev,
      {
        question: currentQ.question,
        options: currentQ.options,
        selectedOption: optionIndex,
        correctOption: currentQ.correctOptionIndex,
        isCorrect,
        explanation: currentQ.explanation,
      },
    ]);
  };

  const handleNextAiQuestion = () => {
    if (!aiQuizData) return;
    if (aiQuizIndex + 1 < aiQuizData.questions.length) {
      setAiQuizIndex((prev) => prev + 1);
      setAiSelectedOption(null);
      setAiAnswerRevealed(false);
    } else {
      setAiQuizFinished(true);
    }
  };

  const handleRetakeAiQuiz = () => {
    setAiQuizIndex(0);
    setAiQuizScore(0);
    setAiSelectedOption(null);
    setAiAnswerRevealed(false);
    setAiQuizFinished(false);
    setAiHistory([]);
  };

  const handleResetAiQuiz = () => {
    setAiQuizData(null);
    setAiQuizIndex(0);
    setAiQuizScore(0);
    setAiSelectedOption(null);
    setAiAnswerRevealed(false);
    setAiQuizFinished(false);
    setAiHistory([]);
  };

  const handlePreviewAiQuestions = async () => {
    setPreviewingAi(true);
    setActionError('');
    try {
      const topic = formData.domainMode === 'specific' && formData.domains.length > 0
        ? formData.domains.join(', ')
        : 'Computer Science & Software Engineering';
      const res = await api.generateAiQuiz({
        topic: `${formData.companyName ? formData.companyName + ' ' : ''}${formData.title || ''} (${topic})`,
        difficulty: formData.difficulty,
        questionCount: 3,
        engine: 'gemini'
      });
      if (res.success && res.questions) {
        setPreviewQuestions(res.questions);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to preview AI questions.');
    } finally {
      setPreviewingAi(false);
    }
  };

  // Handle Candidate Registration
  const handleRegister = async (placement) => {
    if (!user) {
      setActionError('Please sign in or select a demo role in the navigation header to register.');
      return;
    }
    try {
      setActionError('');
      setActionSuccess('');
      setBusyPlacementId(placement._id);
      const res = await api.registerForPlacement(placement._id);
      if (res.success) {
        setActionSuccess(`Successfully registered for ${placement.title} at ${placement.companyName}!`);
        await loadApplications();
        await loadPlacements();
        setActiveTab('applications');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to register for placement.');
    } finally {
      setBusyPlacementId('');
    }
  };

  // Start / Resume Quiz
  const handleStartQuiz = async (application) => {
    setQuizApplication(application);
    setQuizSession(null);
    setAnswerFeedback(null);
    setQuizError('');
    setQuizLoading(true);

    try {
      const res = await api.startCandidateQuiz(application._id);
      if (res.success) {
        setQuizSession(res);
      }
    } catch (err) {
      setQuizError(err.message || 'Unable to start quiz session.');
    } finally {
      setQuizLoading(false);
    }
  };

  // Submit Answer
  const handleAnswer = async (selectedOptionIndex) => {
    if (!quizApplication || !quizSession?.question || answering) return;
    setAnswering(true);
    setQuizError('');

    try {
      const questionIndex = quizSession.question.questionNumber - 1;
      const res = await api.submitCandidateAnswer(quizApplication._id, {
        questionIndex,
        selectedOptionIndex,
      });

      if (res.success) {
        setAnswerFeedback(res);
        setQuizSession({
          completed: res.completed,
          score: res.score,
          totalQuestions: res.totalQuestions,
          question: res.nextQuestion,
        });

        if (res.completed) {
          await loadApplications();
        }
      }
    } catch (err) {
      setQuizError(err.message || 'Error recording answer.');
    } finally {
      setAnswering(false);
    }
  };

  // Handle Create Placement by Host
  const handleCreatePlacement = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setSubmittingPlacement(true);

    try {
      const payload = {
        ...formData,
        domains: formData.domainMode === 'random' ? [] : formData.domains,
        registrationOpensAt: new Date(formData.registrationOpensAt).toISOString(),
        registrationDeadline: new Date(formData.registrationDeadline).toISOString(),
        registrationLimit: Number(formData.registrationLimit),
        questionCount: Number(formData.questionCount),
        randomnessPercent: Number(formData.randomnessPercent),
      };

      const res = await api.createPlacement(payload);
      if (res.success) {
        setActionSuccess(`Placement for ${res.placement.companyName} created with ${res.placement.questionPoolSize} AI-generated questions!`);
        await loadHostPlacements();
        await loadPlacements();
        // Reset form
        setFormData({
          companyName: '',
          title: '',
          description: '',
          location: '',
          domainMode: 'specific',
          domains: ['Data Structures', 'Algorithms'],
          registrationOpensAt: localDateTime(new Date(Date.now() + 2 * 60 * 1000)),
          registrationDeadline: localDateTime(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
          registrationLimit: 50,
          questionCount: 5,
          difficulty: 'medium',
          randomnessPercent: 25,
        });
      }
    } catch (err) {
      setActionError(err.message || 'Failed to create placement.');
    } finally {
      setSubmittingPlacement(false);
    }
  };

  // Load Applicants for a host placement
  const handleViewApplicants = async (placement) => {
    setSelectedPlacementForApplicants(placement);
    setLoadingApplicants(true);
    try {
      const res = await api.getPlacementApplicants(placement._id, applicantsOrder);
      if (res.success) {
        setApplicantsData(res);
      }
    } catch (err) {
      console.error('Error fetching applicants:', err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  // Check if current user is registered for a given placement
  const isRegistered = (placementId) => {
    return applications.find((app) => app.placement?._id === placementId || app.placement === placementId);
  };

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1160px' }}>
      {/* Hero Header */}
      <div
        className="glass-panel"
        style={{
          padding: '32px',
          borderRadius: '20px',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))',
          border: '1px solid rgba(99, 102, 241, 0.35)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={18} color="#818cf8" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#818cf8' }}>
            SmartRoute · Placement & AI Assessment Module
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
          Placement Assessment & Adaptive AI Practice
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '780px', margin: 0 }}>
          Discover upcoming campus placement assessment drives, test your readiness with adaptive AI-generated questions
          across 35+ CSE domains, and track live candidate performance.
        </p>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'ai-quiz' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setActiveTab('ai-quiz');
            setSearchParams({ tab: 'ai-quiz' });
          }}
          style={{ fontSize: '0.88rem', borderColor: 'rgba(99, 102, 241, 0.45)' }}
        >
          <Sparkles size={16} color="#818cf8" />
          Generate AI Quiz
        </button>

        <button
          className={`btn ${activeTab === 'browse' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setActiveTab('browse');
            setSearchParams({});
          }}
          style={{ fontSize: '0.88rem' }}
        >
          <Briefcase size={16} />
          Explore Placements ({placements.length})
        </button>

        <button
          className={`btn ${activeTab === 'applications' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setActiveTab('applications');
            setSearchParams({ tab: 'applications' });
          }}
          style={{ fontSize: '0.88rem' }}
        >
          <Award size={16} />
          My Applications & Quizzes ({applications.length})
        </button>

        {isAdmin && (
          <button
            className={`btn ${activeTab === 'host' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveTab('host');
              setSearchParams({ tab: 'host' });
            }}
            style={{ fontSize: '0.88rem', borderColor: 'rgba(99, 102, 241, 0.4)' }}
          >
            <PlusCircle size={16} color="#818cf8" />
            Host Workspace & AI Bank Generator
          </button>
        )}
      </div>

      {actionError && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '12px',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.4)',
          color: '#fb7185',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '12px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem'
        }}>
          <CheckCircle size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* TAB 0: ON-DEMAND INSTANT AI QUIZ GENERATOR */}
      {activeTab === 'ai-quiz' && (
        <div>
          {!aiQuizData ? (
            /* Quiz Generator Configuration Card */
            <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px', maxWidth: '840px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Sparkles size={22} color="#818cf8" />
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
                  Generate Quiz using AI
                </h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '28px', lineHeight: 1.5 }}>
                Select any technology, topic, or role, and Gemini AI will synthesize customized, interview-level multiple-choice assessment questions in seconds.
              </p>

              <form onSubmit={handleGenerateAiQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {/* Topic Selector */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
                    1. Choose Topic or CSE Domain
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {[
                      'Data Structures & Algorithms',
                      'React & Modern Frontend',
                      'System Design & Microservices',
                      'DBMS, SQL & Indexing',
                      'Operating Systems & Concurrency',
                      'Python & Fast APIs',
                      'Computer Networks & Protocols',
                      'Cybersecurity & Auth',
                    ].map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => {
                          setAiTopic(t);
                          setAiCustomTopic('');
                        }}
                        style={{
                          fontSize: '0.8rem',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: aiTopic === t && !aiCustomTopic ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
                          background: aiTopic === t && !aiCustomTopic ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                          color: aiTopic === t && !aiCustomTopic ? '#fff' : 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {aiTopic === t && !aiCustomTopic ? '✓ ' : ''}{t}
                      </button>
                    ))}
                  </div>

                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Or enter any custom topic (e.g. Next.js 14, Docker & Kubernetes, Redis Caching, Binary Search Trees)..."
                      value={aiCustomTopic}
                      onChange={(e) => setAiCustomTopic(e.target.value)}
                      className="input-field"
                      style={{ width: '100%', fontSize: '0.88rem' }}
                    />
                    {aiCustomTopic && (
                      <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.72rem', color: '#818cf8', fontWeight: 600 }}>
                        Custom Topic Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Difficulty & Count Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                  {/* Difficulty */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
                      2. Difficulty Level
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[
                        { val: 'easy', label: 'Easy' },
                        { val: 'medium', label: 'Medium' },
                        { val: 'hard', label: 'Hard' },
                      ].map((item) => (
                        <button
                          type="button"
                          key={item.val}
                          onClick={() => setAiDifficulty(item.val)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: aiDifficulty === item.val ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
                            background: aiDifficulty === item.val ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                            color: aiDifficulty === item.val ? '#fff' : 'var(--text-muted)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question Count */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
                      3. Question Count
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[
                        { count: 3, label: '3 Qs (Quick)' },
                        { count: 5, label: '5 Qs (Standard)' },
                        { count: 10, label: '10 Qs (Deep)' },
                      ].map((item) => (
                        <button
                          type="button"
                          key={item.count}
                          onClick={() => setAiQuestionCount(item.count)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: aiQuestionCount === item.count ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
                            background: aiQuestionCount === item.count ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                            color: aiQuestionCount === item.count ? '#fff' : 'var(--text-muted)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Engine Selection */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
                    4. Question Generation Engine
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div
                      onClick={() => setAiEngine('gemini')}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        border: aiEngine === 'gemini' ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                        background: aiEngine === 'gemini' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <Sparkles size={20} color="#818cf8" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>🤖 Gemini AI Powered</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live synthesis with your API key</div>
                      </div>
                    </div>

                    <div
                      onClick={() => setAiEngine('offline')}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        border: aiEngine === 'offline' ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                        background: aiEngine === 'offline' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <Zap size={20} color="#38bdf8" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>⚡ Instant Template Bank</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ultra-fast offline question pool</div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={generatingAiQuiz}
                  className="btn btn-primary"
                  style={{
                    padding: '14px 24px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    marginTop: '8px'
                  }}
                >
                  {generatingAiQuiz ? (
                    <>
                      <RefreshCw size={18} className="spin" />
                      Synthesizing Quiz with Gemini AI...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate Quiz using AI
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : !aiQuizFinished ? (
            /* Active Interactive AI Quiz Player */
            <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px', maxWidth: '780px', margin: '0 auto' }}>
              {/* Quiz Header & Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#818cf8', letterSpacing: '0.06em' }}>
                      AI PRACTICE QUIZ
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: aiQuizData.engineUsed === 'gemini' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                      color: aiQuizData.engineUsed === 'gemini' ? '#818cf8' : '#38bdf8',
                      fontWeight: 700
                    }}>
                      {aiQuizData.engineUsed === 'gemini' ? '🤖 Gemini AI' : '⚡ Offline Bank'}
                    </span>
                    <span style={{ fontSize: '0.72rem', textTransform: 'capitalize', color: 'var(--text-dim)' }}>
                      · {aiQuizData.difficulty}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>{aiQuizData.topic}</h3>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>SCORE</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
                    {aiQuizScore} <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>/ {aiQuizData.questions.length}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span>Question {aiQuizIndex + 1} of {aiQuizData.questions.length}</span>
                <span>{Math.round(((aiQuizIndex + 1) / aiQuizData.questions.length) * 100)}%</span>
              </div>
              <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.08)', marginBottom: '24px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${((aiQuizIndex + 1) / aiQuizData.questions.length) * 100}%`,
                    background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>

              {/* Current Question */}
              {(() => {
                const currentQ = aiQuizData.questions[aiQuizIndex];
                if (!currentQ) return null;

                return (
                  <div>
                    <h4 style={{ fontSize: '1.18rem', fontWeight: 700, lineHeight: 1.5, marginBottom: '22px', color: 'var(--text-main)' }}>
                      {currentQ.question}
                    </h4>

                    {/* Options List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                      {currentQ.options.map((option, idx) => {
                        const isSelected = aiSelectedOption === idx;
                        const isCorrect = idx === currentQ.correctOptionIndex;

                        let borderStyle = '1px solid var(--border-subtle)';
                        let bgStyle = 'rgba(255, 255, 255, 0.03)';
                        let badgeColor = '#818cf8';

                        if (aiAnswerRevealed) {
                          if (isCorrect) {
                            borderStyle = '1px solid #10b981';
                            bgStyle = 'rgba(16, 185, 129, 0.15)';
                            badgeColor = '#34d399';
                          } else if (isSelected && !isCorrect) {
                            borderStyle = '1px solid #f43f5e';
                            bgStyle = 'rgba(244, 63, 94, 0.15)';
                            badgeColor = '#fb7185';
                          }
                        } else if (isSelected) {
                          borderStyle = '1px solid #6366f1';
                          bgStyle = 'rgba(99, 102, 241, 0.2)';
                        }

                        return (
                          <button
                            key={idx}
                            disabled={aiAnswerRevealed}
                            onClick={() => handleSelectAiOption(idx)}
                            style={{
                              padding: '14px 18px',
                              borderRadius: '12px',
                              background: bgStyle,
                              border: borderStyle,
                              color: 'var(--text-main)',
                              textAlign: 'left',
                              fontSize: '0.92rem',
                              cursor: aiAnswerRevealed ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '12px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              background: 'rgba(255, 255, 255, 0.08)',
                              color: badgeColor,
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span style={{ lineHeight: 1.4, flex: 1 }}>{option}</span>
                            {aiAnswerRevealed && isCorrect && (
                              <CheckCircle size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* AI Explanation Box (revealed after option selection) */}
                    {aiAnswerRevealed && (
                      <div style={{
                        padding: '16px 20px',
                        borderRadius: '14px',
                        marginBottom: '22px',
                        background: aiSelectedOption === currentQ.correctOptionIndex
                          ? 'rgba(16, 185, 129, 0.12)'
                          : 'rgba(99, 102, 241, 0.12)',
                        border: aiSelectedOption === currentQ.correctOptionIndex
                          ? '1px solid rgba(16, 185, 129, 0.3)'
                          : '1px solid rgba(99, 102, 241, 0.3)'
                      }}>
                        <div style={{
                          fontWeight: 700,
                          fontSize: '0.92rem',
                          color: aiSelectedOption === currentQ.correctOptionIndex ? '#34d399' : '#818cf8',
                          marginBottom: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <Sparkles size={16} />
                          {aiSelectedOption === currentQ.correctOptionIndex
                            ? 'Correct Answer!'
                            : `Incorrect · Correct Option was (${String.fromCharCode(65 + currentQ.correctOptionIndex)})`}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                          {currentQ.explanation}
                        </p>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={handleResetAiQuiz}
                      >
                        Quit Quiz
                      </button>

                      {aiAnswerRevealed && (
                        <button
                          className="btn btn-primary"
                          onClick={handleNextAiQuestion}
                          style={{ padding: '10px 22px', fontWeight: 700 }}
                        >
                          {aiQuizIndex + 1 < aiQuizData.questions.length ? (
                            <>
                              Next Question <ArrowRight size={16} />
                            </>
                          ) : (
                            <>
                              View Final Score <Award size={16} />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* Quiz Completed Final Score & Review Card */
            <div className="glass-panel" style={{ padding: '36px', borderRadius: '20px', maxWidth: '780px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '1px solid rgba(16, 185, 129, 0.4)'
                }}>
                  <Award size={36} color="#34d399" />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 6px 0' }}>AI Quiz Completed!</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
                  Assessment on <b>{aiQuizData.topic}</b> ({aiQuizData.difficulty})
                </p>

                <div style={{
                  display: 'inline-block',
                  padding: '16px 36px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  margin: '22px 0 24px 0'
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>ACCURACY SCORE</div>
                  <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#38bdf8' }}>
                    {aiQuizScore} <span style={{ fontSize: '1.4rem', color: 'var(--text-dim)' }}>/ {aiQuizData.questions.length}</span>
                    <span style={{ fontSize: '1rem', marginLeft: '12px', color: '#34d399', fontWeight: 700 }}>
                      ({Math.round((aiQuizScore / aiQuizData.questions.length) * 100)}%)
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleResetAiQuiz}
                    style={{ fontWeight: 700 }}
                  >
                    <Sparkles size={16} />
                    Generate Another AI Quiz
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleRetakeAiQuiz}
                  >
                    <RotateCcw size={16} />
                    Retake This Quiz
                  </button>
                </div>
              </div>

              {/* Comprehensive Review */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Detailed Answer Review</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {aiHistory.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: item.isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: item.isCorrect ? '#34d399' : '#fb7185' }}>
                          Q{idx + 1}. {item.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.92rem', fontWeight: 600, margin: '0 0 10px 0', color: 'var(--text-main)' }}>
                        {item.question}
                      </p>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        <div>Your choice: <b>{item.options[item.selectedOption]}</b></div>
                        {!item.isCorrect && (
                          <div style={{ color: '#34d399', marginTop: '2px' }}>
                            Correct choice: <b>{item.options[item.correctOption]}</b>
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '6px' }}>
                        💡 {item.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: EXPLORE PLACEMENTS */}
      {activeTab === 'browse' && (
        <div>
          {/* Filter & Search Bar */}
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '14px', marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search company, title, or skills..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', paddingLeft: '38px' }}
                />
              </div>

              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="input-field"
              >
                <option value="">All CSE Domains</option>
                {placementDomains.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input-field"
              >
                <option value="recent">Sort by: Recently Published</option>
                <option value="deadline">Sort by: Approaching Deadline</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px' }} />
              <div>Loading placement assessments...</div>
            </div>
          ) : placements.length === 0 ? (
            <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', borderRadius: '16px' }}>
              <Briefcase size={36} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No Placements Match Your Filter</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Try clearing the search query or domain filters.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              {placements.map((p) => {
                const app = isRegistered(p._id);
                const seatsRemaining = Math.max(0, p.registrationLimit - (p.registrationCount || 0));
                const isFull = seatsRemaining <= 0;
                const isPastDeadline = new Date(p.registrationDeadline) <= new Date();

                return (
                  <div
                    key={p._id}
                    className="glass-panel"
                    style={{
                      padding: '24px',
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: app ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#818cf8' }}>
                          {p.companyName}
                        </span>
                        {app ? (
                          <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>Registered</span>
                        ) : isFull ? (
                          <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>Batch Full</span>
                        ) : (
                          <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>Open</span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-main)' }}>
                        {p.title}
                      </h3>

                      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.description}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                        {(p.domainMode === 'random' ? ['Adaptive CSE Domains'] : (p.domains || [])).map((d) => (
                          <span key={d} style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1' }}>
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        padding: '12px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        marginBottom: '16px',
                        fontSize: '0.78rem'
                      }}>
                        <div>
                          <span style={{ color: 'var(--text-dim)' }}>Deadline:</span>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                            {formatDate(p.registrationDeadline)}
                          </div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-dim)' }}>Capacity:</span>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                            {seatsRemaining} of {p.registrationLimit} seats left
                          </div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-dim)' }}>Assessment:</span>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                            {p.questionCount} Questions
                          </div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-dim)' }}>Starting Level:</span>
                          <div style={{ fontWeight: 600, textTransform: 'capitalize', color: 'var(--text-main)', marginTop: '2px' }}>
                            {p.difficulty}
                          </div>
                        </div>
                      </div>

                      {app ? (
                        <button
                          className="btn btn-primary"
                          style={{ width: '100%', fontSize: '0.88rem' }}
                          onClick={() => handleStartQuiz(app)}
                        >
                          <Sparkles size={16} />
                          {app.status === 'completed'
                            ? `Completed · Score: ${app.score}/${p.questionCount}`
                            : app.status === 'in_progress'
                            ? 'Resume Adaptive Assessment'
                            : 'Start AI Practice Quiz'}
                        </button>
                      ) : (
                        <button
                          className="btn btn-outline"
                          style={{ width: '100%', fontSize: '0.88rem' }}
                          disabled={isFull || isPastDeadline || busyPlacementId === p._id}
                          onClick={() => handleRegister(p)}
                        >
                          {busyPlacementId === p._id ? 'Registering...' : isFull ? 'Registration Full' : isPastDeadline ? 'Registration Closed' : 'Register for Placement'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY APPLICATIONS & QUIZZES */}
      {activeTab === 'applications' && (
        <div>
          {!user ? (
            <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', borderRadius: '16px' }}>
              <Users size={36} color="#818cf8" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Sign In to Track Applications</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                Sign in as a student (or click "Demo Roles" &gt; "Student" in the navbar) to access your registrations and quiz results.
              </p>
            </div>
          ) : applications.length === 0 ? (
            <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', borderRadius: '16px' }}>
              <Award size={36} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No Active Registrations</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                You have not registered for any placement assessment drives yet. Explore open placements to register!
              </p>
              <button className="btn btn-primary" onClick={() => setActiveTab('browse')}>
                Explore Placements
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              {applications.map((app) => {
                const p = app.placement;
                if (!p) return null;

                const isCompleted = app.status === 'completed';
                const isInProgress = app.status === 'in_progress';

                return (
                  <div
                    key={app._id}
                    className="glass-panel"
                    style={{
                      padding: '24px',
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#818cf8' }}>
                          {p.companyName}
                        </span>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: isCompleted ? 'rgba(16, 185, 129, 0.2)' : isInProgress ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          color: isCompleted ? '#34d399' : isInProgress ? '#38bdf8' : '#cbd5e1'
                        }}>
                          {app.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--text-main)' }}>
                        {p.title}
                      </h3>

                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
                        {p.location} · Registered on {formatDate(app.registeredAt)}
                      </p>

                      {isCompleted && (
                        <div style={{
                          padding: '12px',
                          borderRadius: '10px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          marginBottom: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>Final Score</span>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>
                            {app.score} / {p.questionCount}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', fontSize: '0.88rem' }}
                      onClick={() => handleStartQuiz(app)}
                    >
                      <Sparkles size={16} />
                      {isCompleted ? 'Review Final Result' : isInProgress ? 'Resume Assessment' : 'Start Adaptive Quiz'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HOST WORKSPACE (ADMIN / COUNSELLOR) */}
      {activeTab === 'host' && isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px', alignItems: 'start' }}>
          {/* Create Placement Form */}
          <section className="glass-panel" style={{ padding: '28px', borderRadius: '18px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#818cf8" />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>Create Placement Drive</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Gemini AI automatically synthesizes easy, medium, and hard question banks based on selected domains.
              </p>
            </div>

            <form onSubmit={handleCreatePlacement} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google India"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Role Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SDE - Campus 2027"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Role Description</label>
                <textarea
                  required
                  rows={3}
                  minLength={20}
                  placeholder="Detailed job description, responsibilities, and screening criteria..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', marginTop: '4px', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengaluru, India · Hybrid"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>

              {/* Domain Mode */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Question Domain Mode
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${formData.domainMode === 'specific' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFormData({ ...formData, domainMode: 'specific' })}
                  >
                    Specific Domains ({formData.domains.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${formData.domainMode === 'random' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFormData({ ...formData, domainMode: 'random', domains: [] })}
                  >
                    Random CSE Domains
                  </button>
                </div>

                {formData.domainMode === 'specific' && (
                  <div style={{
                    marginTop: '10px',
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <input
                      type="text"
                      placeholder="Filter 35 CSE domains..."
                      value={domainFilterInput}
                      onChange={(e) => setDomainFilterInput(e.target.value)}
                      className="input-field"
                      style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', marginBottom: '8px' }}
                    />
                    <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {placementDomains
                        .filter((d) => d.toLowerCase().includes(domainFilterInput.toLowerCase()))
                        .map((domain) => {
                          const isSelected = formData.domains.includes(domain);
                          return (
                            <button
                              type="button"
                              key={domain}
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  domains: isSelected
                                    ? formData.domains.filter((d) => d !== domain)
                                    : [...formData.domains, domain]
                                });
                              }}
                              style={{
                                fontSize: '0.72rem',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: isSelected ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
                                background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                                color: isSelected ? '#fff' : 'var(--text-muted)',
                                cursor: 'pointer'
                              }}
                            >
                              {isSelected ? '✓ ' : '+ '}{domain}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Assessment Settings */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Questions Per Candidate</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={formData.questionCount}
                    onChange={(e) => setFormData({ ...formData, questionCount: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Registration Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    required
                    value={formData.registrationLimit}
                    onChange={(e) => setFormData({ ...formData, registrationLimit: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Starting Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Difficulty Randomness ({formData.randomnessPercent}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.randomnessPercent}
                    onChange={(e) => setFormData({ ...formData, randomnessPercent: e.target.value })}
                    style={{ width: '100%', marginTop: '10px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Registration Opens</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.registrationOpensAt}
                    onChange={(e) => setFormData({ ...formData, registrationOpensAt: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Registration Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingPlacement}
                  style={{ flex: 1, minWidth: '220px' }}
                >
                  {submittingPlacement ? (
                    <>
                      <RefreshCw size={16} className="spin" /> Generating Questions & Publishing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Generate AI Questions & Publish Placement
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={previewingAi}
                  onClick={handlePreviewAiQuestions}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {previewingAi ? <RefreshCw size={14} className="spin" /> : <Sparkles size={14} color="#818cf8" />}
                  Preview AI Questions
                </button>
              </div>
            </form>
          </section>

          {/* Host Placement List & Applicant Leaderboards */}
          <section className="glass-panel" style={{ padding: '28px', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>Your Published Placements</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Manage registrations and review student scores.
                </p>
              </div>
              <span className="badge badge-primary">{hostPlacements.length} Total</span>
            </div>

            {hostPlacements.length === 0 ? (
              <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                No placements published yet. Use the form to launch your first placement assessment.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {hostPlacements.map((hp) => (
                  <div
                    key={hp._id}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>
                          {hp.companyName}
                        </span>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '2px 0 0 0' }}>{hp.title}</h4>
                      </div>
                      <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>Published</span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {hp.registrationCount || 0} / {hp.registrationLimit} Registered Candidates · {hp.questionCount} Questions (Bank: {hp.questionPoolSize})
                    </div>

                    <button
                      className="btn btn-outline btn-sm"
                      style={{ alignSelf: 'flex-start', marginTop: '6px' }}
                      onClick={() => handleViewApplicants(hp)}
                    >
                      <Users size={14} /> Review Candidate Leaderboard
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Applicant Leaderboard Section */}
            {selectedPlacementForApplicants && (
              <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                    Leaderboard · {selectedPlacementForApplicants.title}
                  </h4>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className={`btn btn-sm ${applicantsOrder === 'highest' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                      onClick={() => {
                        setApplicantsOrder('highest');
                        handleViewApplicants(selectedPlacementForApplicants);
                      }}
                    >
                      Top Scores
                    </button>
                    <button
                      className={`btn btn-sm ${applicantsOrder === 'lowest' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                      onClick={() => {
                        setApplicantsOrder('lowest');
                        handleViewApplicants(selectedPlacementForApplicants);
                      }}
                    >
                      Lowest
                    </button>
                  </div>
                </div>

                {loadingApplicants ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading candidate roster...</p>
                ) : !applicantsData || applicantsData.applicants.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No candidates have registered for this placement yet.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                          <th style={{ padding: '6px' }}>Rank</th>
                          <th style={{ padding: '6px' }}>Candidate Name</th>
                          <th style={{ padding: '6px' }}>Email</th>
                          <th style={{ padding: '6px' }}>Score</th>
                          <th style={{ padding: '6px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applicantsData.applicants.map((a, idx) => (
                          <tr key={a.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                            <td style={{ padding: '8px 6px', fontWeight: 700, color: idx < 3 ? '#fbbf24' : 'var(--text-dim)' }}>
                              #{idx + 1}
                            </td>
                            <td style={{ padding: '8px 6px', fontWeight: 600, color: '#f8fafc' }}>
                              {a.candidate?.fullName || 'Candidate'}
                            </td>
                            <td style={{ padding: '8px 6px', color: 'var(--text-muted)' }}>
                              {a.candidate?.email || '—'}
                            </td>
                            <td style={{ padding: '8px 6px', fontWeight: 700, color: '#38bdf8' }}>
                              {a.score} / {selectedPlacementForApplicants.questionCount}
                            </td>
                            <td style={{ padding: '8px 6px' }}>
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: a.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                color: a.status === 'completed' ? '#34d399' : '#cbd5e1'
                              }}>
                                {a.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ADAPTIVE AI QUIZ PRACTICE MODAL */}
      {quizApplication && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(5, 8, 15, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '680px',
              padding: '32px',
              borderRadius: '24px',
              border: '1px solid var(--border-highlight)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#818cf8', letterSpacing: '0.06em' }}>
                  SmartRoute Adaptive Assessment
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '4px 0 0 0' }}>
                  {quizApplication.placement?.title}
                </h3>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setQuizApplication(null)}
                style={{ padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>

            {quizLoading ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px' }} />
                <div>Selecting personalized adaptive question...</div>
              </div>
            ) : quizSession?.completed ? (
              <div style={{ textAlign: 'center', padding: '36px 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '1px solid rgba(16, 185, 129, 0.4)'
                }}>
                  <Award size={32} color="#34d399" />
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px 0' }}>Assessment Completed!</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0 0 24px 0' }}>
                  Your score has been registered in the placement assessment system.
                </p>
                <div style={{
                  display: 'inline-block',
                  padding: '16px 36px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '28px'
                }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '4px' }}>FINAL SCORE</div>
                  <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#38bdf8' }}>
                    {quizSession.score} <span style={{ fontSize: '1.4rem', color: 'var(--text-dim)' }}>/ {quizSession.totalQuestions}</span>
                  </div>
                </div>
                <div>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setQuizApplication(null);
                      setActiveTab('applications');
                    }}
                  >
                    View in My Applications
                  </button>
                </div>
              </div>
            ) : quizSession?.question ? (
              <div>
                {/* Progress & Meta Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <span>
                    Question <b>{quizSession.question.questionNumber}</b> of <b>{quizSession.question.totalQuestions}</b>
                  </span>
                  <span>
                    {quizSession.question.domain} · <span style={{ textTransform: 'capitalize', color: '#818cf8', fontWeight: 700 }}>{quizSession.question.difficulty}</span>
                  </span>
                </div>

                <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.08)', marginBottom: '20px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(quizSession.question.questionNumber / quizSession.question.totalQuestions) * 100}%`,
                      background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                      transition: 'width 0.3s'
                    }}
                  />
                </div>

                {/* Immediate Answer Feedback if available */}
                {answerFeedback && (
                  <div style={{
                    padding: '14px',
                    borderRadius: '12px',
                    marginBottom: '18px',
                    background: answerFeedback.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    border: answerFeedback.isCorrect ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(244, 63, 94, 0.35)'
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: answerFeedback.isCorrect ? '#34d399' : '#fb7185', marginBottom: '4px' }}>
                      {answerFeedback.isCorrect ? '✓ Correct Answer!' : `✗ Incorrect · Correct Option was (${String.fromCharCode(65 + answerFeedback.correctOptionIndex)})`}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                      {answerFeedback.explanation}
                    </p>
                  </div>
                )}

                {/* Question Text */}
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.5, marginBottom: '20px', color: 'var(--text-main)' }}>
                  {quizSession.question.question}
                </h4>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {quizSession.question.options.map((option, idx) => (
                    <button
                      key={idx}
                      disabled={answering}
                      onClick={() => handleAnswer(idx)}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        cursor: answering ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: 'rgba(99, 102, 241, 0.2)',
                        color: '#818cf8',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span style={{ lineHeight: 1.4 }}>{option}</span>
                    </button>
                  ))}
                </div>

                {answering && (
                  <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Evaluating answer & selecting next question...
                  </p>
                )}

                {quizError && (
                  <p style={{ color: '#fb7185', fontSize: '0.85rem', textAlign: 'center' }}>{quizError}</p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* HOST AI QUESTIONS PREVIEW MODAL */}
      {previewQuestions && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(5, 8, 15, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '680px',
              padding: '28px',
              borderRadius: '20px',
              border: '1px solid var(--border-highlight)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              maxHeight: '85vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#818cf8" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Gemini AI Question Preview</h3>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPreviewQuestions(null)}
                style={{ padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Sample questions synthesized in real-time by Google Gemini AI for this placement configuration:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {previewQuestions.map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8', marginBottom: '4px' }}>
                    Sample Question {idx + 1}
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px' }}>
                    {q.question}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        style={{
                          fontSize: '0.82rem',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: oIdx === q.correctOptionIndex ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                          color: oIdx === q.correctOptionIndex ? '#34d399' : 'var(--text-muted)',
                          border: oIdx === q.correctOptionIndex ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent'
                        }}
                      >
                        {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === q.correctOptionIndex && '✓ (Correct)'}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    💡 {q.explanation}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setPreviewQuestions(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

