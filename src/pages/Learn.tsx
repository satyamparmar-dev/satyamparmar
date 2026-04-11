import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Typography, Tabs, Tab, Button, IconButton,
  Chip, Paper, Tooltip, Fab, Checkbox, FormControlLabel,
  TextField, Collapse, Alert, LinearProgress,
  List, ListItem, ListItemIcon, ListItemText, Divider,
  Accordion, AccordionSummary, AccordionDetails, Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
import {
  LessonDay, CodeSection, DiagramSection, AssignmentSection, InterviewQuestionItem, McqSection,
} from '../types';
import { parseMarkdown } from '../utils/markdown';
import CodeBlock from '../components/CodeBlock';
import DiagramBlock from '../components/DiagramBlock';
import LevelBadge from '../components/LevelBadge';
import TrackBanner from '../components/TrackBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import AssignmentBlock from '../components/AssignmentBlock';
import { useContentAccess } from '../auth/ContentAccessContext';
import SignInToContinueCallout from '../components/SignInToContinueCallout';
import McqSectionBlock from '../components/McqSectionBlock';

type SectionTab = 'why' | 'theory' | 'code' | 'diagram' | 'pitfalls' | 'exercise' | 'useCases' | 'interview' | 'mcq' | 'cheatsheet' | 'assignment' | 'video';

const sectionLabels: Record<SectionTab, string> = {
  why: '💡 Why',
  theory: '📖 Theory',
  code: '💻 Code',
  diagram: '🗺️ Diagram',
  pitfalls: '⚠️ Pitfalls',
  exercise: '🏋️ Exercise',
  useCases: '🧭 Use cases',
  interview: '🎤 Interview',
  mcq: '❓ MCQ',
  cheatsheet: '📋 Cheatsheet',
  assignment: '📝 Assignment',
  video: '▶️ Video',
};

/** Enriched day JSON uses objects per pitfall; legacy days use markdown strings. */
function pitfallItemToMarkdown(item: Record<string, unknown>): string {
  const parts: string[] = [];
  if (typeof item.title === 'string') parts.push(`### ${item.title}`);
  if (typeof item.severity === 'string') parts.push(`**Severity:** _${item.severity}_`);
  if (typeof item.symptom === 'string') parts.push(`**What you see:**\n\n${item.symptom}`);
  if (typeof item.cause === 'string') parts.push(`**Why it happens:**\n\n${item.cause}`);
  if (typeof item.codeExample === 'string') {
    parts.push(`**Code example:**\n\n\`\`\`java\n${item.codeExample}\n\`\`\``);
  }
  if (typeof item.fix === 'string') parts.push(`**Fix:**\n\n${item.fix}`);
  if (typeof item.detection === 'string') parts.push(`**How to confirm:**\n\n${item.detection}`);
  return parts.join('\n\n');
}

/** Enriched interview JSON uses { wrong, correction, whyBelivedWrong }; legacy uses plain strings. */
function wrongAnswerToMarkdown(wa: Record<string, unknown>): string {
  const parts: string[] = [];
  if (typeof wa.wrong === 'string') parts.push(`### Wrong belief\n\n${wa.wrong}`);
  if (typeof wa.correction === 'string') parts.push(`### Correction\n\n${wa.correction}`);
  const why = wa.whyBelivedWrong ?? wa.whyBelievedWrong;
  if (typeof why === 'string') parts.push(`### Why this sounds right\n\n${why}`);
  return parts.join('\n\n');
}

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
  /** Keys `${exerciseIndex}-${hintIndex}` for multi-exercise days */
  const [openExerciseHintKeys, setOpenExerciseHintKeys] = useState<Record<string, boolean>>({});
  const [openExerciseSolutions, setOpenExerciseSolutions] = useState<Record<number, boolean>>({});
  const [checkedObjectives, setCheckedObjectives] = useState<boolean[]>([]);
  /** Days that have scenario drill content (merged manifest + `days/scenarioDrill-day*.json`) */
  const [scenarioDrillDays, setScenarioDrillDays] = useState<Set<number> | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const noteTimer = useRef<ReturnType<typeof setTimeout>>();
  const prevHasFullAccess = useRef<boolean | null>(null);

  const { hasFullAccess } = useContentAccess();

  // After sign-out, move to a tab that still shows free preview (Why / Theory excerpt),
  // not Code/Cheatsheet/etc. where the panel is only "Sign in to continue".
  useEffect(() => {
    if (!dayData) return;
    const tabs = (dayData.sections ?? []).map((s) => s.type) as SectionTab[];
    if (prevHasFullAccess.current === null) {
      prevHasFullAccess.current = hasFullAccess;
      return;
    }
    const lostFull = prevHasFullAccess.current === true && !hasFullAccess;
    prevHasFullAccess.current = hasFullAccess;
    if (!lostFull) return;
    if (tabs.includes('why')) setActiveTab('why');
    else if (tabs.includes('theory')) setActiveTab('theory');
    else if (tabs[0]) setActiveTab(tabs[0] as SectionTab);
  }, [hasFullAccess, dayData]);

  const isComplete = progress.completedDays.includes(dayNum);
  const isBookmarked = progress.bookmarks.includes(dayNum);
  const savedNote = progress.notes[String(dayNum)] ?? '';

  useEffect(() => {
    getScenarioDrillDaysWithContent()
      .then((s) => setScenarioDrillDays(s))
      .catch(() => setScenarioDrillDays(new Set()));
  }, []);

  useEffect(() => {
    setOpenExerciseHintKeys({});
    setOpenExerciseSolutions({});
  }, [dayNum, dayData?.day]);

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
    window.addEventListener('scroll', onScroll, { passive: true });
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
  const exerciseSections = (dayData.sections ?? []).filter((s) => s.type === 'exercise');
  const useCasesSection = getSection('useCases');
  const interviewSection = getSection('interview');
  const mcqSection = getSection('mcq') as McqSection | undefined;
  const cheatsheetSection = getSection('cheatsheet');
  // Assignment comes from separate assignments_phase*.json files loaded via fetchAssignmentForDay
  const assignmentSection = assignmentData ?? dayData.sections.find((s): s is AssignmentSection => s.type === 'assignment') ?? null;

  const currentPhase = curriculum?.phases.find((p) => {
    const [s, e] = p.days.split('–').map(Number);
    return dayNum >= s && dayNum <= e;
  });

  const theoryHtml = parseMarkdown(((theorySection as any)?.content ?? '') as string);
  const useCasesHtml = parseMarkdown(((useCasesSection as any)?.content ?? '') as string);

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

        {/* Theory — preview without sign-in; full article when signed in */}
        {activeTab === 'theory' && theorySection && (
          theoryHtml && theoryHtml.trim().length > 0 ? (
            hasFullAccess ? (
              <Box
                className="md-content"
                dangerouslySetInnerHTML={{ __html: theoryHtml }}
                sx={{ lineHeight: 1.8 }}
              />
            ) : (
              <>
                <Box sx={{ position: 'relative', maxHeight: 280, overflow: 'hidden', mb: 2 }}>
                  <Box
                    className="md-content"
                    dangerouslySetInnerHTML={{ __html: theoryHtml }}
                    sx={{ lineHeight: 1.8 }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 96,
                      pointerEvents: 'none',
                      background: (t) =>
                        `linear-gradient(180deg, transparent, ${t.palette.background.default})`,
                    }}
                  />
                </Box>
                <SignInToContinueCallout message="You are viewing an excerpt of the theory section. Sign in with your authorized email to read the full article and the rest of this lesson." />
              </>
            )
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Theory content is not available for this day yet.
            </Alert>
          )
        )}

        {/* Code */}
        {activeTab === 'code' && (
          hasFullAccess ? (
          <Box>
            {codeSections.map((sec, i) => (
              <CodeBlock
                key={`${dayNum}-code-${i}`}
                section={sec}
                defaultExpanded={i === 0}
              />
            ))}
          </Box>
          ) : (
            <SignInToContinueCallout message="Code samples and walkthroughs for this day are available after you sign in with an authorized email." />
          )
        )}

        {/* Diagram */}
        {activeTab === 'diagram' && diagramSection && (
          hasFullAccess ? (
            <DiagramBlock section={diagramSection} />
          ) : (
            <SignInToContinueCallout message="Diagrams and architecture views for this lesson are available to signed-in learners only." />
          )
        )}

        {/* Pitfalls */}
        {activeTab === 'pitfalls' && pitfallsSection && (
          hasFullAccess ? (
          <Box>
            <Typography variant="h6" fontWeight={700} mb={2}>
              {(pitfallsSection as any).title}
            </Typography>
            {(((pitfallsSection as any)?.items as unknown[] | undefined) ?? []).length > 0 ? (
              ((pitfallsSection as any).items as unknown[]).map((raw, i: number) => {
              if (typeof raw === 'string' && raw.trimStart().startsWith('//')) {
                return (
                  <Typography
                    key={i}
                    variant="overline"
                    sx={{ display: 'block', mt: i > 0 ? 2.5 : 0.5, mb: 0.5, letterSpacing: 0.08, fontWeight: 700, color: 'text.secondary' }}
                  >
                    {raw.replace(/^\s*\/\/\s*/, '')}
                  </Typography>
                );
              }
              const md =
                typeof raw === 'string'
                  ? raw
                  : pitfallItemToMarkdown(raw as Record<string, unknown>);
              return (
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
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(md) }}
                    sx={{ '& p': { mb: 0 } }}
                  />
                </Box>
              </Alert>
              );
              })
            ) : (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No pitfalls are available for this lesson yet.
              </Alert>
            )}
          </Box>
          ) : (
            <SignInToContinueCallout message="Common pitfalls and anti-patterns for this topic are shown after sign-in." />
          )
        )}

        {/* Exercise — problem visible; hints & solution require sign-in */}
        {activeTab === 'exercise' && exerciseSections.length > 0 && (
          <Box>
            {exerciseSections.map((exerciseSection, exIdx) => {
              const aud = (exerciseSection as { audience?: string }).audience;
              return (
                <Box key={exIdx} sx={{ mb: exIdx < exerciseSections.length - 1 ? 5 : 0 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2} flexWrap="wrap">
                    <Typography variant="h6" fontWeight={700}>{(exerciseSection as any).title}</Typography>
                    <LevelBadge level={(exerciseSection as any).difficulty} />
                    {aud ? (
                      <Chip size="small" label={aud === 'staff' ? 'Staff track' : aud === 'fresher' ? 'Fresher track' : aud} sx={{ fontWeight: 600 }} />
                    ) : null}
                  </Box>
                  <Paper elevation={0} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>Problem</Typography>
                    <Box
                      className="md-content"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown((exerciseSection as any).problem) }}
                    />
                  </Paper>

                  {hasFullAccess ? (
                    <Box mb={2}>
                      {(((exerciseSection as any)?.hints as string[]) ?? []).map((hint: string, i: number) => {
                        const hk = `${exIdx}-${i}`;
                        const open = openExerciseHintKeys[hk] ?? false;
                        return (
                          <Box key={hk} mb={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setOpenExerciseHintKeys((prev) => ({ ...prev, [hk]: !open }));
                              }}
                              sx={{ mb: 0.5, borderColor: '#D29922', color: '#D29922' }}
                            >
                              {open ? '▼' : '▶'} Hint {i + 1}
                            </Button>
                            <Collapse in={open}>
                              <Alert severity="info" sx={{ borderRadius: 2 }}>
                                <Box
                                  className="md-content"
                                  dangerouslySetInnerHTML={{ __html: parseMarkdown(hint) }}
                                  sx={{ '& p': { mb: 0 } }}
                                />
                              </Alert>
                            </Collapse>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <SignInToContinueCallout
                      sx={{ mb: 2 }}
                      message="Hints for this exercise are available after you sign in with an authorized email."
                    />
                  )}

                  {hasFullAccess ? (
                    <>
                      <Button
                        variant="outlined"
                        onClick={() => setOpenExerciseSolutions((prev) => ({
                          ...prev,
                          [exIdx]: !(prev[exIdx] ?? false),
                        }))}
                        sx={{ mb: 1.5 }}
                      >
                        {(openExerciseSolutions[exIdx] ?? false) ? 'Hide' : 'Show'} Solution
                      </Button>
                      <Collapse in={openExerciseSolutions[exIdx] ?? false}>
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
                    </>
                  ) : (
                    <SignInToContinueCallout message="The reference solution for this exercise is available to signed-in learners only." />
                  )}
                </Box>
              );
            })}
          </Box>
        )}

        {/* Use cases */}
        {activeTab === 'useCases' && useCasesSection && (
          useCasesHtml && useCasesHtml.trim().length > 0 ? (
            hasFullAccess ? (
              <Box>
                <Typography variant="h6" fontWeight={700} mb={2}>{(useCasesSection as any).title}</Typography>
                <Box
                  className="md-content"
                  dangerouslySetInnerHTML={{ __html: useCasesHtml }}
                  sx={{ lineHeight: 1.8, '& h2, & h3': { mt: 2.5, mb: 1 } }}
                />
              </Box>
            ) : (
              <SignInToContinueCallout message="Real-world use cases and implementation notes for this day are available after sign-in." />
            )
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Use cases are not available for this lesson yet.
            </Alert>
          )
        )}

        {/* Interview */}
        {activeTab === 'interview' && interviewSection && (
          <Box>
            <Typography variant="h6" fontWeight={700} mb={2}>{(interviewSection as any).title}</Typography>

            {['conceptual', 'codeBased', 'seniorScenario'].map((category) => {
              const questions = (interviewSection as any)[category] as InterviewQuestionItem[];
              if (!questions?.length) return null;
              const labels: Record<string, string> = {
                conceptual: '💬 Conceptual Questions',
                codeBased: '💻 Code-Based Questions',
                seniorScenario: '🏗️ Senior Scenario Questions',
              };
              const categoryHints: Record<string, string> = {
                conceptual: 'Concept and definitions — no code required on the whiteboard.',
                codeBased: 'Expect snippets, APIs, or configuration; code samples below are labeled.',
                seniorScenario: 'Production-style trade-offs, incidents, and architecture judgment.',
              };
              return (
                <Box key={category} mb={3}>
                  <Typography variant="subtitle1" fontWeight={700} mb={0.5} color="primary.main">
                    {labels[category]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1.5} sx={{ maxWidth: 720 }}>
                    {categoryHints[category]}
                  </Typography>
                  {questions.map((qa, i) => (
                    <Accordion
                      key={`${category}-${i}`}
                      disableGutters
                      elevation={0}
                      sx={{
                        mb: 1.5,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: '8px !important',
                        '&:before': { display: 'none' },
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="flex-start" gap={1} pr={1} flexWrap="wrap">
                          <Typography component="span" variant="caption" fontWeight={800} color="text.secondary" sx={{ mt: 0.2 }}>
                            Q{i + 1}
                          </Typography>
                          <Typography fontWeight={700} variant="body2" sx={{ flex: 1, minWidth: 200 }}>
                            {qa.question}
                          </Typography>
                          {category === 'codeBased' && (
                            <Chip label="Code" size="small" variant="outlined" sx={{ height: 22, fontSize: '0.65rem' }} />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                        {hasFullAccess ? (
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ letterSpacing: '0.08em' }}>
                                Model answer
                              </Typography>
                              <Box
                                className="md-content interview-md-content"
                                dangerouslySetInnerHTML={{ __html: parseMarkdown(qa.answer, { interview: true }) }}
                                sx={{
                                  mt: 1.25,
                                  pl: 2,
                                  ml: 0.25,
                                  borderLeft: (t) => `3px solid ${t.palette.primary.main}`,
                                  borderRadius: '0 8px 8px 0',
                                  overflowX: 'auto',
                                  bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
                                  py: 1.5,
                                  pr: 1,
                                }}
                              />
                            </Box>
                            {(qa.followUps?.length ?? 0) > 0 && (
                              <Box>
                                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                                  Follow-up questions
                                </Typography>
                                {(qa.followUps ?? []).map((fu, fi) => (
                                  <Accordion
                                    key={fi}
                                    disableGutters
                                    sx={{
                                      mb: 1,
                                      border: 1,
                                      borderColor: 'action.hover',
                                      borderRadius: '8px !important',
                                      '&:before': { display: 'none' },
                                      bgcolor: 'action.hover',
                                    }}
                                  >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                      <Typography variant="body2" fontWeight={600}>
                                        {fu.question}
                                      </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                                      <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.75}>
                                        Answer
                                      </Typography>
                                      <Box
                                        className="md-content interview-md-content"
                                        dangerouslySetInnerHTML={{ __html: parseMarkdown(fu.answer, { interview: true }) }}
                                        sx={{
                                          pl: 1.75,
                                          borderLeft: 2,
                                          borderColor: 'divider',
                                          borderRadius: '0 6px 6px 0',
                                          overflowX: 'auto',
                                          py: 0.5,
                                        }}
                                      />
                                    </AccordionDetails>
                                  </Accordion>
                                ))}
                              </Box>
                            )}
                          </Stack>
                        ) : (
                          <SignInToContinueCallout
                            message="Interview answers and model responses are available after you sign in with an authorized email."
                          />
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              );
            })}

            {/* Wrong Answers */}
            {hasFullAccess && (interviewSection as any).wrongAnswers?.length > 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight={700} mb={1.5} color="error.main">
                  ❌ Common Wrong Answers
                </Typography>
                {(((interviewSection as any)?.wrongAnswers as unknown[]) ?? []).map((wa, i: number) => {
                  const md =
                    typeof wa === 'string'
                      ? wa
                      : wrongAnswerToMarkdown(wa as Record<string, unknown>);
                  return (
                  <Alert key={i} severity="error" sx={{ mb: 1, borderRadius: 2, alignItems: 'flex-start' }}>
                    <Box
                      className="md-content interview-md-content"
                      component="div"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(md, { interview: true }) }}
                      sx={{ '& p': { mb: 0.75 }, '& p:last-child': { mb: 0 } }}
                    />
                  </Alert>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* MCQ */}
        {activeTab === 'mcq' && mcqSection && mcqSection.type === 'mcq' && (
          <McqSectionBlock key={dayNum} section={mcqSection} hasFullAccess={hasFullAccess} />
        )}

        {/* Cheatsheet */}
        {activeTab === 'cheatsheet' && cheatsheetSection && (
          hasFullAccess ? (
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
          ) : (
            <SignInToContinueCallout message="The full cheatsheet for this day is available after sign-in." />
          )
        )}

        {/* Video */}
        {activeTab === 'video' && (() => {
          const videoSection = getSection('video') as import('../types').VideoSection | undefined;
          if (!videoSection) return null;
          const embedUrl = videoSection.url.replace('watch?v=', 'embed/');
          return (
            <Box>
              {videoSection.description && (
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {videoSection.description}
                </Typography>
              )}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '56.25%', // 16:9 aspect ratio
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'black',
                }}
              >
                <Box
                  component="iframe"
                  src={embedUrl}
                  title={videoSection.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  sx={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                />
              </Box>
            </Box>
          );
        })()}

        {/* Assignment */}
        {activeTab === 'assignment' && (
          assignmentSection ? (
            <AssignmentBlock section={assignmentSection} dayNumber={dayNum} hasFullAccess={hasFullAccess} />
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
