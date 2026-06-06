import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip, MenuItem,
  Select, FormControl, InputLabel, Grid, Paper, CircularProgress,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { fetchCurriculum, fetchPhaseWithCache } from '../services/api';
import { LessonDay, InterviewSection } from '../types';
import QuizCard from '../components/QuizCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useContentAccess } from '../auth/ContentAccessContext';
import SignInToContinueCallout from '../components/SignInToContinueCallout';
import { usePageTitle } from '../hooks/usePageTitle';

interface QuizQuestion {
  question: string;
  answer: string;
  type: 'conceptual' | 'codeBased' | 'seniorScenario';
}

const Quiz: React.FC = () => {
  usePageTitle('Quiz');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialDay = searchParams.get('day');

  const {
    curriculum, setCurriculum, loadedPhases, loadPhase, progress, saveQuizScore, activeCurriculum,
  } = useAppStore();
  const { hasFullAccess } = useContentAccess();

  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>(initialDay ?? '');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knew, setKnew] = useState(0);
  const [review, setReview] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableDays, setAvailableDays] = useState<{ day: number; title: string }[]>([]);

  useEffect(() => {
    if (!curriculum) {
      fetchCurriculum(activeCurriculum).then((c) => {
        setCurriculum(c);
        c.phases.slice(0, 3).forEach((p) =>
          fetchPhaseWithCache(p.file, activeCurriculum).then((d) => loadPhase(p.id, d))
        );
      });
    }
  }, [curriculum, activeCurriculum, setCurriculum, loadPhase]);

  useEffect(() => {
    if (!curriculum) return;
    const days: { day: number; title: string }[] = [];
    for (const phase of curriculum.phases) {
      if (selectedPhase !== 'all' && phase.id !== selectedPhase) continue;
      const phaseData = loadedPhases[phase.id];
      if (phaseData) {
        phaseData.days.forEach((d) => days.push({ day: d.day, title: d.title }));
      }
    }
    setAvailableDays(days);
  }, [curriculum, selectedPhase, loadedPhases]);

  const buildQuestions = (dayData: LessonDay): QuizQuestion[] => {
    const interviewSection = dayData.sections.find(
      (s): s is InterviewSection => s.type === 'interview'
    );
    if (!interviewSection) return [];

    const qs: QuizQuestion[] = [
      ...interviewSection.conceptual.map((qa) => ({ ...qa, type: 'conceptual' as const })),
      ...interviewSection.codeBased.map((qa) => ({ ...qa, type: 'codeBased' as const })),
      ...interviewSection.seniorScenario.map((qa) => ({ ...qa, type: 'seniorScenario' as const })),
    ];

    // Shuffle
    return qs.sort(() => Math.random() - 0.5);
  };

  const startQuiz = async () => {
    if (!selectedDay || !curriculum) return;
    setLoading(true);
    setKnew(0);
    setReview(0);
    setCurrentIndex(0);
    setSessionComplete(false);

    const dayNum = Number(selectedDay);
    const phase = curriculum.phases.find((p) => {
      const [s, e] = (p.days ?? '0–0').split('–').map(Number);
      return dayNum >= s && dayNum <= e;
    });

    if (!phase) { setLoading(false); return; }

    let phaseData = loadedPhases[phase.id];
    if (!phaseData) {
      phaseData = await fetchPhaseWithCache(phase.file, activeCurriculum);
      loadPhase(phase.id, phaseData);
    }

    const dayData = phaseData.days.find((d) => d.day === dayNum);
    if (dayData) {
      setQuestions(buildQuestions(dayData));
    }
    setLoading(false);
  };

  const handleKnew = () => {
    const newKnew = knew + 1;
    setKnew(newKnew);
    if (currentIndex + 1 >= questions.length) {
      setSessionComplete(true);
      saveQuizScore(Number(selectedDay), newKnew, review);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleReview = () => {
    const newReview = review + 1;
    setReview(newReview);
    if (currentIndex + 1 >= questions.length) {
      setSessionComplete(true);
      saveQuizScore(Number(selectedDay), knew, newReview);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setKnew(0);
    setReview(0);
    setSessionComplete(false);
    setQuestions((q) => [...q].sort(() => Math.random() - 0.5));
  };

  if (!curriculum) return <LoadingSpinner message="Loading..." />;

  const scorePct = questions.length > 0 ? Math.round((knew / questions.length) * 100) : 0;

  return (
    <Box className="fade-in">
      <Typography variant="h4" component="h1" fontWeight={800} mb={0.5}>
        Quiz Mode
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Flashcard-based review for interview preparation
      </Typography>

      {/* Selector */}
      {!questions.length || sessionComplete ? (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Select Quiz
            </Typography>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Phase</InputLabel>
                  <Select
                    value={selectedPhase}
                    label="Phase"
                    onChange={(e) => { setSelectedPhase(e.target.value); setSelectedDay(''); }}
                  >
                    <MenuItem value="all">All Phases</MenuItem>
                    {curriculum.phases.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        Phase {p.number}: {p.title.replace(/Phase \d+ · /, '').slice(0, 30)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={5}>
                <FormControl fullWidth size="small" disabled={!availableDays.length}>
                  <InputLabel>Day</InputLabel>
                  <Select
                    value={selectedDay}
                    label="Day"
                    onChange={(e) => setSelectedDay(e.target.value)}
                  >
                    {availableDays.map(({ day, title }) => (
                      <MenuItem key={day} value={String(day)}>
                        Day {day}: {title.slice(0, 35)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={startQuiz}
                  disabled={!selectedDay || loading || !hasFullAccess}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 700,
                  }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Start Quiz'}
                </Button>
              </Grid>
            </Grid>
            {!hasFullAccess && (
              <SignInToContinueCallout
                sx={{ mt: 2 }}
                message="Sign in with your authorized email to run the quiz, reveal answers, and track scores."
              />
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Session Complete */}
      {sessionComplete && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ mb: 1 }}>
              {scorePct >= 80 ? '🎉' : scorePct >= 60 ? '💪' : '📚'}
            </Typography>
            <Typography variant="h5" fontWeight={800} gutterBottom>
              Quiz Complete!
            </Typography>
            <Typography variant="h2" fontWeight={900} color="primary.main" gutterBottom>
              {scorePct}%
            </Typography>
            <Grid container spacing={2} justifyContent="center" sx={{ mb: 3, maxWidth: 300, mx: 'auto' }}>
              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(63,185,80,0.1)' }}>
                  <Typography variant="h5" fontWeight={800} sx={{ color: '#3FB950' }}>
                    {knew}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Got It
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(210,153,34,0.1)' }}>
                  <Typography variant="h5" fontWeight={800} sx={{ color: '#D29922' }}>
                    {review}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Review
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            {scorePct < 80 && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2, maxWidth: 400, mx: 'auto' }}>
                Study the missed topics again and re-quiz!
              </Alert>
            )}
            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<ReplayIcon />}
                onClick={handleRestart}
              >
                Retry
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(`/learn/${selectedDay}`)}
              >
                Review Lesson
              </Button>
              <Button
                variant="contained"
                onClick={() => { setQuestions([]); setSessionComplete(false); }}
                sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                New Quiz
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Quiz Card */}
      {questions.length > 0 && !sessionComplete && (
        <Box maxWidth={680} mx="auto">
          <QuizCard
            question={questions[currentIndex].question}
            answer={questions[currentIndex].answer}
            questionType={questions[currentIndex].type}
            current={currentIndex + 1}
            total={questions.length}
            onKnew={handleKnew}
            onReview={handleReview}
            answersLocked={!hasFullAccess}
          />
        </Box>
      )}

      {/* Previously Quizzed */}
      {Object.keys(progress.quizScores).length > 0 && !questions.length && (
        <Box mt={3}>
          <Typography variant="h6" fontWeight={700} mb={1.5}>
            Previously Quizzed
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {Object.entries(progress.quizScores)
              .sort(([a], [b]) => Number(b) - Number(a))
              .slice(0, 20)
              .map(([day, score]) => {
                const pct = score.knew + score.review > 0
                  ? Math.round((score.knew / (score.knew + score.review)) * 100)
                  : 0;
                const color = pct >= 80 ? '#3FB950' : pct >= 60 ? '#D29922' : '#F85149';
                return (
                  <Chip
                    key={day}
                    label={`Day ${day} — ${pct}%`}
                    onClick={() => { setSelectedDay(day); }}
                    sx={{
                      bgcolor: `${color}18`,
                      color,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  />
                );
              })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Quiz;
