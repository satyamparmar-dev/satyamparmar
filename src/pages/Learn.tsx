import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Typography, Tabs, Tab, Button, IconButton,
  Chip, Paper, Tooltip, Fab, Checkbox, FormControlLabel,
  TextField, Collapse, Alert, LinearProgress,
  List, ListItem, ListItemIcon, ListItemText, Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import QuizIcon from '@mui/icons-material/Quiz';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import PrintIcon from '@mui/icons-material/Print';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { fetchCurriculum, fetchPhaseWithCache, getScenarioDrillDaysWithContent, fetchAssignmentForDay } from '../services/api';
import { LessonDay, LessonSection, CodeSection, DiagramSection, AssignmentSection } from '../types';
import { parseMarkdown } from '../utils/markdown';
import CodeBlock from '../components/CodeBlock';
import DiagramBlock from '../components/DiagramBlock';
import LevelBadge from '../components/LevelBadge';
import TrackBanner from '../components/TrackBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import AssignmentBlock from '../components/AssignmentBlock';

type SectionTab = 'why' | 'theory' | 'code' | 'diagram' | 'pitfalls' | 'exercise' | 'interview' | 'cheatsheet' | 'assignment';

const sectionLabels: Record<SectionTab, string> = {
  why: '💡 Why',
  theory: '📖 Theory',
  code: '💻 Code',
  diagram: '🗺️ Diagram',
  pitfalls: '⚠️ Pitfalls',
  exercise: '🏋️ Exercise',
  interview: '🎤 Interview',
  cheatsheet: '📋 Cheatsheet',
  assignment: '📝 Assignment',
};

const Learn: React.FC = () => {
  const { dayNumber } = useParams<{ dayNumber: string }>();
  const navigate = useNavigate();
  const dayNum = Number(dayNumber);

  const {
    curriculum, setCurriculum, loadedPhases, loadPhase,
    progress, markDayComplete, unmarkDayComplete,
    toggleBookmark, saveNote, setCurrentDay, currentSection, setCurrentSection,
  } = useAppStore();

  const [dayData, setDayData] = useState<LessonDay | null>(null);
  const [assignmentData, setAssignmentData] = useState<AssignmentSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SectionTab>('why');
  const [note, setNote] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [showExerciseHints, setShowExerciseHints] = useState<boolean[]>([]);
  const [showExerciseSolution, setShowExerciseSolution] = useState(false);
  const [checkedObjectives, setCheckedObjectives] = useState<boolean[]>([]);
  /** Days that have entries in `scenarioDrill.json` with at least one scenario */
  const [scenarioDrillDays, setScenarioDrillDays] = useState<Set<number> | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const noteTimer = useRef<ReturnType<typeof setTimeout>>();

  const isComplete = progress.completedDays.includes(dayNum);
  const isBookmarked = progress.bookmarks.includes(dayNum);
  const savedNote = progress.notes[String(dayNum)] ?? '';

  useEffect(() => {
    getScenarioDrillDaysWithContent()
      .then((s) => setScenarioDrillDays(s))
      .catch(() => setScenarioDrillDays(new Set()));
  }, []);

  // Load data
  useEffect(() => {
    setLoading(true);
    setDayData(null);
    setAssignmentData(null);

    const load = async () => {
      let curr = curriculum;
      if (!curr) {
        curr = await fetchCurriculum();
        setCurriculum(curr);
      }

      // Find which phase contains this day
      const phase = curr.phases.find((p) => {
        const [s, e] = p.days.split('–').map(Number);
        return dayNum >= s && dayNum <= e;
      });

      if (!phase) { setLoading(false); return; }

      let phaseData = loadedPhases[phase.id];
      if (!phaseData) {
        phaseData = await fetchPhaseWithCache(phase.file);
        loadPhase(phase.id, phaseData);
      }

      const day = phaseData.days.find((d) => d.day === dayNum);
      if (day) {
        setDayData(day);
        setCurrentDay(dayNum);
        setNote(savedNote);
        setShowExerciseHints(new Array(10).fill(false));
        setCheckedObjectives(new Array(day.learningObjectives.length).fill(false));
      }

      // Load assignment data in parallel (non-blocking)
      fetchAssignmentForDay(dayNum)
        .then((a) => setAssignmentData(a))
        .catch(() => setAssignmentData(null));

      setLoading(false);
    };

    load().catch(() => setLoading(false));
  }, [dayNum]);

  // Reading progress
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setReadingProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [dayData]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowLeft' && dayNum > 1) navigate(`/learn/${dayNum - 1}`);
      if (e.key === 'ArrowRight' && dayNum < (curriculum?.totalDays ?? 90)) navigate(`/learn/${dayNum + 1}`);
      if (e.key === 'm' || e.key === 'M') {
        if (isComplete) unmarkDayComplete(dayNum); else markDayComplete(dayNum);
      }
      if (e.key === 'b' || e.key === 'B') toggleBookmark(dayNum);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dayNum, isComplete]);

  // Note autosave
  const handleNoteChange = useCallback((val: string) => {
    setNote(val);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => saveNote(dayNum, val), 500);
  }, [dayNum, saveNote]);

  if (loading) return <LoadingSpinner message={`Loading Day ${dayNum}...`} fullPage />;
  if (!dayData) {
    return (
      <Box py={8} textAlign="center">
        <Typography variant="h5">Day {dayNum} not found</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>Back to Dashboard</Button>
      </Box>
    );
  }

  const availableTabs = (dayData.sections ?? []).map((s) => s.type) as SectionTab[];
  const getSection = (type: string) => (dayData.sections ?? []).find((s) => s.type === type);

  const codeSections = (dayData.sections ?? []).filter((s): s is CodeSection => s.type === 'code');
  const diagramSection = dayData.sections.find((s): s is DiagramSection => s.type === 'diagram');
  const whySection = getSection('why');
  const theorySection = getSection('theory');
  const pitfallsSection = getSection('pitfalls');
  const exerciseSection = getSection('exercise');
  const interviewSection = getSection('interview');
  const cheatsheetSection = getSection('cheatsheet');
  // Assignment comes from separate assignments_phase*.json files loaded via fetchAssignmentForDay
  const assignmentSection = assignmentData ?? dayData.sections.find((s): s is AssignmentSection => s.type === 'assignment') ?? null;

  const currentPhase = curriculum?.phases.find((p) => {
    const [s, e] = p.days.split('–').map(Number);
    return dayNum >= s && dayNum <= e;
  });

  const theoryHtml = parseMarkdown(((theorySection as any)?.content ?? '') as string);

  return (
    <Box className="fade-in" ref={contentRef}>
      {/* Reading progress bar */}
      <Box
        sx={{
          position: 'fixed',
          top: 56,
          left: 0,
          right: 0,
          zIndex: 1200,
          height: 3,
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${readingProgress}%`,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            transition: 'width 0.1s ease',
          }}
        />
      </Box>

      {/* Header */}
      <Box mb={3}>
        <Box display="flex" alignItems="center" gap={1} mb={1.5} flexWrap="wrap">
          <Chip
            label={`Day ${dayNum}`}
            sx={{
              bgcolor: 'rgba(102,126,234,0.12)',
              color: 'primary.main',
              fontWeight: 800,
              fontSize: '0.8rem',
            }}
          />
          <LevelBadge level={dayData.level} />
          <TrackBanner track={dayData.track} compact />
          {currentPhase && (
            <Chip
              label={`Phase ${currentPhase.number}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 22 }}
            />
          )}
          <Box ml="auto" display="flex" gap={0.5}>
            <Tooltip title={`${isBookmarked ? 'Remove' : 'Add'} bookmark (B)`}>
              <IconButton size="small" onClick={() => toggleBookmark(dayNum)}>
                {isBookmarked ? (
                  <BookmarkIcon sx={{ fontSize: 18, color: '#D29922' }} />
                ) : (
                  <BookmarkBorderIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Print lesson">
              <IconButton size="small" onClick={() => window.print()}>
                <PrintIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Typography variant="h3" fontWeight={800} mb={0.5} lineHeight={1.2}>
          {dayData.title}
        </Typography>

        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mt={1}>
          {(dayData.tags ?? []).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.65rem', borderRadius: '4px' }}
            />
          ))}
        </Box>
      </Box>

      {scenarioDrillDays?.has(dayNum) && (
        <Alert
          severity="info"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" component={RouterLink} to={`/scenarios?day=${dayNum}`}>
              Open drill
            </Button>
          }
        >
          <strong>Scenario interview drill</strong> — full walkthroughs with answers, signals, and follow-ups for this
          day are available.
        </Alert>
      )}

      {/* Prerequisites & Objectives */}
      <Box mb={3}>
        {(dayData.prerequisites ?? []).length > 0 && (
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.75}>
              Prerequisites
            </Typography>
            <Box display="flex" gap={0.75} flexWrap="wrap">
              {(dayData.prerequisites ?? []).map((p) => (
                <Chip
                  key={p}
                  label={p}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    bgcolor: 'rgba(88,166,255,0.1)',
                    color: '#58A6FF',
                    borderRadius: '6px',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
            Learning Objectives
          </Typography>
          <List disablePadding dense>
            {(dayData.learningObjectives ?? []).map((obj, i) => (
              <ListItem disablePadding key={i} sx={{ py: 0.25 }}>
                <Checkbox
                  size="small"
                  checked={checkedObjectives[i] ?? false}
                  onChange={(e) => {
                    const next = [...checkedObjectives];
                    next[i] = e.target.checked;
                    setCheckedObjectives(next);
                  }}
                  sx={{ p: 0.5, mr: 0.5 }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    textDecoration: checkedObjectives[i] ? 'line-through' : 'none',
                    color: checkedObjectives[i] ? 'text.secondary' : 'text.primary',
                  }}
                >
                  {obj}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

      {/* Section Tabs */}
      <Box
        sx={{
          position: 'sticky',
          top: 59,
          zIndex: 100,
          bgcolor: 'background.default',
          pb: 0.5,
          mb: 2,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': { minWidth: 'auto', px: 1.5, py: 1, fontSize: '0.8rem' },
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            },
          }}
        >
          {(Object.keys(sectionLabels) as SectionTab[])
            .filter((t) => t === 'assignment' || availableTabs.includes(t))
            .map((tab) => (
              <Tab
                key={tab}
                value={tab}
                label={sectionLabels[tab]}
              />
            ))}
        </Tabs>
        <Divider />
      </Box>

      {/* Section Content */}
      <Box>
        {/* Why */}
        {activeTab === 'why' && whySection && (
          <Box
            className="md-content"
            dangerouslySetInnerHTML={{ __html: parseMarkdown((whySection as any).content) }}
            sx={{ lineHeight: 1.8, '& h2, & h3': { mt: 3, mb: 1 } }}
          />
        )}

        {/* Theory */}
        {activeTab === 'theory' && theorySection && (
          theoryHtml && theoryHtml.trim().length > 0 ? (
            <Box
              className="md-content"
              dangerouslySetInnerHTML={{ __html: theoryHtml }}
              sx={{ lineHeight: 1.8 }}
            />
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Theory content is not available for this day yet.
            </Alert>
          )
        )}

        {/* Code */}
        {activeTab === 'code' && (
          <Box>
            {codeSections.map((sec, i) => (
              <Box key={i} mb={2}>
                <Typography variant="h6" fontWeight={700} mb={0.75}>
                  {sec.title}
                </Typography>
                {sec.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5, lineHeight: 1.7 }}
                  >
                    {sec.description}
                  </Typography>
                )}
                <CodeBlock section={sec} />
              </Box>
            ))}
          </Box>
        )}

        {/* Diagram */}
        {activeTab === 'diagram' && diagramSection && (
          <DiagramBlock section={diagramSection} />
        )}

        {/* Pitfalls */}
        {activeTab === 'pitfalls' && pitfallsSection && (
          <Box>
            <Typography variant="h6" fontWeight={700} mb={2}>
              {(pitfallsSection as any).title}
            </Typography>
            {(((pitfallsSection as any)?.items as string[] | undefined) ?? []).length > 0 ? (
              ((pitfallsSection as any).items as string[]).map((item: string, i: number) => (
              <Alert
                key={i}
                severity="warning"
                icon={false}
                sx={{ mb: 1.5, borderRadius: 2, alignItems: 'flex-start' }}
              >
                <Box display="flex" gap={1.5} alignItems="flex-start">
                  <Typography variant="h6" sx={{ mt: -0.25 }}>⚠️</Typography>
                  <Box
                    className="md-content"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(item) }}
                    sx={{ '& p': { mb: 0 } }}
                  />
                </Box>
              </Alert>
              ))
            ) : (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No pitfalls are available for this lesson yet.
              </Alert>
            )}
          </Box>
        )}

        {/* Exercise */}
        {activeTab === 'exercise' && exerciseSection && (
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Typography variant="h6" fontWeight={700}>{(exerciseSection as any).title}</Typography>
              <LevelBadge level={(exerciseSection as any).difficulty} />
            </Box>
            <Paper elevation={0} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>Problem</Typography>
              <Box
                className="md-content"
                dangerouslySetInnerHTML={{ __html: parseMarkdown((exerciseSection as any).problem) }}
              />
            </Paper>

            {/* Hints */}
            <Box mb={2}>
              {(((exerciseSection as any)?.hints as string[]) ?? []).map((hint: string, i: number) => (
                <Box key={i} mb={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const next = [...showExerciseHints];
                      next[i] = !next[i];
                      setShowExerciseHints(next);
                    }}
                    sx={{ mb: 0.5, borderColor: '#D29922', color: '#D29922' }}
                  >
                    {showExerciseHints[i] ? '▼' : '▶'} Hint {i + 1}
                  </Button>
                  <Collapse in={showExerciseHints[i]}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      <Box
                        className="md-content"
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(hint) }}
                        sx={{ '& p': { mb: 0 } }}
                      />
                    </Alert>
                  </Collapse>
                </Box>
              ))}
            </Box>

            {/* Solution */}
            <Button
              variant="outlined"
              onClick={() => setShowExerciseSolution(!showExerciseSolution)}
              sx={{ mb: 1.5 }}
            >
              {showExerciseSolution ? 'Hide' : 'Show'} Solution
            </Button>
            <Collapse in={showExerciseSolution}>
              <Box
                component="pre"
                sx={{
                  bgcolor: '#0d1117',
                  p: 2.5,
                  borderRadius: 2,
                  overflow: 'auto',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.85rem',
                  color: '#E6EDF3',
                  lineHeight: 1.7,
                }}
              >
                {(exerciseSection as any).solution}
              </Box>
            </Collapse>
          </Box>
        )}

        {/* Interview */}
        {activeTab === 'interview' && interviewSection && (
          <Box>
            <Typography variant="h6" fontWeight={700} mb={2}>{(interviewSection as any).title}</Typography>

            {['conceptual', 'codeBased', 'seniorScenario'].map((category) => {
              const questions = (interviewSection as any)[category] as { question: string; answer: string }[];
              if (!questions?.length) return null;
              const labels: Record<string, string> = {
                conceptual: '💬 Conceptual Questions',
                codeBased: '💻 Code-Based Questions',
                seniorScenario: '🏗️ Senior Scenario Questions',
              };
              return (
                <Box key={category} mb={3}>
                  <Typography variant="subtitle1" fontWeight={700} mb={1.5} color="primary.main">
                    {labels[category]}
                  </Typography>
                  {questions.map((qa, i) => (
                    <Paper key={i} elevation={0} sx={{ mb: 1.5, borderRadius: 2, overflow: 'hidden' }}>
                      <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
                        <Typography variant="body2" fontWeight={700}>
                          Q{i + 1}: {qa.question}
                        </Typography>
                      </Box>
                      <Box sx={{ p: 2 }}>
                        <Box
                          className="md-content"
                          dangerouslySetInnerHTML={{ __html: parseMarkdown(qa.answer) }}
                          sx={{ '& p:last-child': { mb: 0 } }}
                        />
                      </Box>
                    </Paper>
                  ))}
                </Box>
              );
            })}

            {/* Wrong Answers */}
            {(interviewSection as any).wrongAnswers?.length > 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight={700} mb={1.5} color="error.main">
                  ❌ Common Wrong Answers
                </Typography>
                {(((interviewSection as any)?.wrongAnswers as string[]) ?? []).map((wa: string, i: number) => (
                  <Alert key={i} severity="error" sx={{ mb: 1, borderRadius: 2 }}>
                    {wa}
                  </Alert>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Cheatsheet */}
        {activeTab === 'cheatsheet' && cheatsheetSection && (
          <Box>
            <Typography variant="h6" fontWeight={700} mb={2}>{(cheatsheetSection as any).title}</Typography>
            <Box
              className="md-content"
              dangerouslySetInnerHTML={{ __html: parseMarkdown((cheatsheetSection as any).content) }}
              sx={{
                '& table': { fontSize: '0.85rem' },
                '& th': { bgcolor: 'rgba(102,126,234,0.12)' },
              }}
            />
          </Box>
        )}

        {/* Assignment */}
        {activeTab === 'assignment' && (
          assignmentSection ? (
            <AssignmentBlock section={assignmentSection} dayNumber={dayNum} />
          ) : (
            <Box
              sx={{
                textAlign: 'center', py: 8,
                border: '2px dashed', borderColor: 'divider', borderRadius: 3,
              }}
            >
              <Typography variant="h2" mb={1}>📝</Typography>
              <Typography variant="h6" fontWeight={700} mb={1}>
                Assignment coming soon
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assignment questions for Day {dayNum} will be available shortly.
              </Typography>
            </Box>
          )
        )}
      </Box>

      {/* Notes */}
      <Box mt={4}>
        <Typography variant="subtitle2" fontWeight={700} mb={1}>
          📝 My Notes
        </Typography>
        <TextField
          multiline
          minRows={3}
          maxRows={8}
          fullWidth
          placeholder="Write your notes here... (auto-saved)"
          value={note}
          onChange={(e) => handleNoteChange(e.target.value)}
          variant="outlined"
          sx={{ fontFamily: 'JetBrains Mono, monospace' }}
        />
      </Box>

      {/* Mark Complete + Navigation */}
      <Box
        mt={4}
        pt={3}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
        sx={{ borderTop: '1px solid', borderColor: 'divider' }}
      >
        <Button
          variant={isComplete ? 'outlined' : 'contained'}
          startIcon={<CheckCircleIcon />}
          onClick={() => {
            if (isComplete) unmarkDayComplete(dayNum);
            else markDayComplete(dayNum);
          }}
          sx={
            isComplete
              ? { borderColor: '#3FB950', color: '#3FB950' }
              : {
                  background: 'linear-gradient(135deg, #3FB950 0%, #2EA043 100%)',
                  fontWeight: 700,
                }
          }
        >
          {isComplete ? '✓ Completed' : 'Mark Complete'}
        </Button>

        <Box display="flex" gap={1.5}>
          <Button
            variant="outlined"
            startIcon={<NavigateBeforeIcon />}
            onClick={() => navigate(`/learn/${dayNum - 1}`)}
            disabled={dayNum <= 1}
          >
            Day {dayNum - 1}
          </Button>
          <Button
            variant="outlined"
            endIcon={<NavigateNextIcon />}
            onClick={() => navigate(`/learn/${dayNum + 1}`)}
            disabled={dayNum >= (curriculum?.totalDays ?? 90)}
          >
            Day {dayNum + 1}
          </Button>
        </Box>
      </Box>

      {/* Quiz FAB */}
      <Fab
        color="primary"
        size="medium"
        onClick={() => navigate(`/quiz?day=${dayNum}`)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          zIndex: 1000,
        }}
      >
        <QuizIcon />
      </Fab>
    </Box>
  );
};

export default Learn;
