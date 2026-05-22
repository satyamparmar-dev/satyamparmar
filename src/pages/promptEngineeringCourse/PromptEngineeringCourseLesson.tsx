import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box, Paper, Typography, Chip, Button, Collapse, Divider,
  LinearProgress, alpha, useTheme, useMediaQuery, IconButton, Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CodeIcon from '@mui/icons-material/Code';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StarIcon from '@mui/icons-material/Star';
import QuizIcon from '@mui/icons-material/Quiz';
import MenuIcon from '@mui/icons-material/Menu';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate, useParams } from 'react-router-dom';
import {
  COURSE_PHASES, COURSE_LESSONS, getLessonsForPhase,
  getLessonById, getNextLesson, getPrevLesson,
  getCompletedLessons, markLessonComplete, markLessonIncomplete,
  type CourseSection, type SectionType,
} from '../../content/promptEngineeringCourse/courseData';
import { parseMarkdown } from '../../utils/markdown';

const ACCENT = '#7c3aed';
const ACCENT_DARK = '#6d28d9';

const SECTION_CONFIG: Record<SectionType, {
  icon: React.ReactElement; label: string;
  bgLight: string; bgDark: string; borderColor: string; headerColor: string;
}> = {
  why:     { icon: <LightbulbIcon sx={{ fontSize: 16 }} />,    label: 'Why This Matters',       bgLight: alpha('#6366f1', 0.05),  bgDark: alpha('#6366f1', 0.1),  borderColor: '#6366f1', headerColor: '#6366f1' },
  analogy: { icon: <FormatQuoteIcon sx={{ fontSize: 16 }} />,  label: 'Analogy',                bgLight: alpha('#10b981', 0.05),  bgDark: alpha('#10b981', 0.1),  borderColor: '#10b981', headerColor: '#10b981' },
  concept: { icon: <MenuBookIcon sx={{ fontSize: 16 }} />,     label: 'Concept',                bgLight: alpha('#f59e0b', 0.04),  bgDark: alpha('#f59e0b', 0.08), borderColor: '#f59e0b', headerColor: '#d97706' },
  code:    { icon: <CodeIcon sx={{ fontSize: 16 }} />,         label: 'Code',                   bgLight: alpha('#0f172a', 0.03),  bgDark: alpha('#e2e8f0', 0.04), borderColor: '#64748b', headerColor: '#64748b' },
  task:    { icon: <AssignmentIcon sx={{ fontSize: 16 }} />,   label: 'Hands-On Task',          bgLight: alpha('#f59e0b', 0.06),  bgDark: alpha('#f59e0b', 0.1),  borderColor: '#f59e0b', headerColor: '#d97706' },
  summary: { icon: <StarIcon sx={{ fontSize: 16 }} />,         label: 'What You Just Learned',  bgLight: alpha('#8b5cf6', 0.05),  bgDark: alpha('#8b5cf6', 0.1),  borderColor: '#8b5cf6', headerColor: '#8b5cf6' },
};

const difficultyColor: Record<string, string> = {
  Beginner: '#10b981', Intermediate: '#f59e0b', Advanced: '#ef4444', Expert: '#8b5cf6',
};

const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  const html = useMemo(() => parseMarkdown(content), [content]);
  return (
    <Box className="md-prose" sx={{
      '& h1,& h2,& h3,& h4': { mt: 2, mb: 1, fontWeight: 700 },
      '& p': { mb: 1.5, lineHeight: 1.75, fontSize: '0.92rem' },
      '& ul,& ol': { pl: 2.5, mb: 1.5 },
      '& li': { mb: 0.5, fontSize: '0.92rem', lineHeight: 1.65 },
      '& pre': { borderRadius: 2, overflow: 'auto', my: 1.5, '& code': { fontFamily: 'JetBrains Mono, Fira Code, monospace', fontSize: '0.82rem', lineHeight: 1.7 } },
      '& code.inline-code': { bgcolor: 'action.hover', px: 0.75, py: 0.25, borderRadius: 0.75, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.83em' },
      '& blockquote': { borderLeft: '3px solid', borderColor: 'primary.main', pl: 2, ml: 0, my: 1.5, '& p': { color: 'text.secondary', fontStyle: 'italic', mb: 0 } },
      '& table': { width: '100%', borderCollapse: 'collapse', my: 1.5, fontSize: '0.88rem' },
      '& th': { bgcolor: 'action.hover', px: 1.5, py: 0.75, textAlign: 'left', fontWeight: 700, borderBottom: '2px solid', borderColor: 'divider' },
      '& td': { px: 1.5, py: 0.75, borderBottom: '1px solid', borderColor: 'divider' },
      '& hr': { my: 2, border: 'none', borderTop: '1px solid', borderColor: 'divider' },
      '& strong': { fontWeight: 700 },
    }} dangerouslySetInnerHTML={{ __html: html }} />
  );
};

const SectionCard: React.FC<{ section: CourseSection }> = ({ section }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cfg = SECTION_CONFIG[section.type];
  return (
    <Paper elevation={0} sx={{ mb: 2, borderRadius: 2.5, border: '1px solid', borderColor: alpha(cfg.borderColor, 0.25), bgcolor: isDark ? cfg.bgDark : cfg.bgLight, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 2, py: 1.25, borderBottom: '1px solid', borderColor: alpha(cfg.borderColor, 0.15) }}>
        <Box sx={{ color: cfg.headerColor, display: 'flex' }}>{cfg.icon}</Box>
        <Typography variant="overline" sx={{ color: cfg.headerColor, fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.08em' }}>{cfg.label}</Typography>
        {section.title !== cfg.label && (
          <>
            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: alpha(cfg.borderColor, 0.3), mx: 0.5 }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{section.title}</Typography>
          </>
        )}
      </Box>
      <Box sx={{ px: 2.5, py: 2 }}>
        <MarkdownContent content={section.content} />
      </Box>
    </Paper>
  );
};

const SIDEBAR_WIDTH = 268;

const PromptEngineeringCourseLesson: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const contentRef = useRef<HTMLDivElement>(null);

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(getCompletedLessons);

  const lesson = useMemo(() => (lessonId ? getLessonById(lessonId) : undefined), [lessonId]);
  const nextLesson = useMemo(() => (lessonId ? getNextLesson(lessonId) : undefined), [lessonId]);
  const prevLesson = useMemo(() => (lessonId ? getPrevLesson(lessonId) : undefined), [lessonId]);
  const isComplete = !!lessonId && completed.has(lessonId);
  const phase = lesson ? COURSE_PHASES.find((p) => p.number === lesson.phase) : undefined;

  useEffect(() => { if (lesson) setExpandedPhase(lesson.phase); }, [lesson]);
  useEffect(() => { contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }, [lessonId]);

  const handleToggleComplete = () => {
    if (!lessonId) return;
    if (isComplete) { markLessonIncomplete(lessonId); setCompleted((prev) => { const n = new Set(prev); n.delete(lessonId); return n; }); }
    else { markLessonComplete(lessonId); setCompleted((prev) => new Set([...prev, lessonId])); }
  };

  const handleNext = () => {
    if (!nextLesson) return;
    if (!isComplete && lessonId) { markLessonComplete(lessonId); setCompleted((prev) => new Set([...prev, lessonId])); }
    navigate(`/prompt-course/lesson/${nextLesson.id}`);
  };

  if (!lesson) {
    return (
      <Box p={4}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/prompt-course')}>Back to Course</Button>
        <Typography color="text.secondary" mt={2}>Lesson not found.</Typography>
      </Box>
    );
  }

  const sidebarContent = (
    <Box sx={{ width: SIDEBAR_WIDTH, height: '100%', display: 'flex', flexDirection: 'column', borderRight: '1px solid', borderColor: 'divider', bgcolor: isDark ? alpha('#0f172a', 0.6) : alpha('#f8fafc', 0.8), flexShrink: 0 }}>
      <Box sx={{ px: 1.5, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/prompt-course')} size="small" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.78rem' }}>
          All Phases
        </Button>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', px: 1, py: 1 }}>
        {COURSE_PHASES.map((p) => {
          const phaseLessons = getLessonsForPhase(p.number);
          const phaseCompleted = phaseLessons.filter((l) => completed.has(l.id)).length;
          const phasePct = Math.round((phaseCompleted / phaseLessons.length) * 100);
          const isExpanded = expandedPhase === p.number;
          return (
            <Box key={p.id} mb={0.5}>
              <Box onClick={() => setExpandedPhase(isExpanded ? null : p.number)}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.75, borderRadius: 1.5, cursor: 'pointer', bgcolor: lesson.phase === p.number ? alpha(p.color, 0.1) : 'transparent', '&:hover': { bgcolor: alpha(p.color, 0.07) } }}>
                <Box sx={{ fontSize: '0.9rem' }}>{p.icon}</Box>
                <Box flex={1} minWidth={0}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: lesson.phase === p.number ? p.color : 'text.primary', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.72rem' }}>
                    Phase {p.number}
                  </Typography>
                  <LinearProgress variant="determinate" value={phasePct} sx={{ height: 2, borderRadius: 1, mt: 0.25, bgcolor: alpha(p.color, 0.15), '& .MuiLinearProgress-bar': { bgcolor: p.color } }} />
                </Box>
                <Typography variant="caption" sx={{ color: p.color, fontWeight: 700, fontSize: '0.6rem', flexShrink: 0 }}>{phasePct}%</Typography>
                {isExpanded ? <ExpandLessIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} /> : <ExpandMoreIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />}
              </Box>
              <Collapse in={isExpanded}>
                <Box sx={{ pl: 1 }}>
                  {phaseLessons.map((l) => {
                    const isDone = completed.has(l.id);
                    const isCurrent = l.id === lessonId;
                    return (
                      <Box key={l.id}
                        onClick={() => { navigate(`/prompt-course/lesson/${l.id}`); if (isMobile) setSidebarOpen(false); }}
                        sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, px: 1, py: 0.6, borderRadius: 1.5, cursor: 'pointer', bgcolor: isCurrent ? alpha(p.color, 0.12) : 'transparent', borderLeft: isCurrent ? `2px solid ${p.color}` : '2px solid transparent', '&:hover': { bgcolor: alpha(p.color, 0.07) } }}>
                        {isDone ? <CheckCircleIcon sx={{ fontSize: 13, color: '#10b981', mt: 0.2, flexShrink: 0 }} /> : <Box sx={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid', borderColor: isCurrent ? p.color : 'divider', mt: 0.2, flexShrink: 0 }} />}
                        <Box flex={1} minWidth={0}>
                          <Typography variant="caption" sx={{ display: 'block', fontWeight: isCurrent ? 700 : 400, color: isCurrent ? 'text.primary' : isDone ? 'text.disabled' : 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.72rem', lineHeight: 1.4 }}>
                            {l.lesson}. {l.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6rem' }}>{l.duration}</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden', mx: -2.5, mt: -2.5 }}>
      {!isMobile && sidebarOpen && sidebarContent}
      {isMobile && sidebarOpen && (
        <Box sx={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex' }}>
          <Box sx={{ width: SIDEBAR_WIDTH, height: '100%', overflow: 'auto' }}>{sidebarContent}</Box>
          <Box onClick={() => setSidebarOpen(false)} sx={{ flex: 1, bgcolor: 'rgba(0,0,0,0.5)' }} />
        </Box>
      )}

      <Box ref={contentRef} sx={{ flex: 1, overflow: 'auto', px: { xs: 2, sm: 3 }, py: 2.5 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2.5}>
          {isMobile ? (
            <IconButton size="small" onClick={() => setSidebarOpen(true)}><MenuIcon fontSize="small" /></IconButton>
          ) : (
            <Tooltip title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}>
              <IconButton size="small" onClick={() => setSidebarOpen(!sidebarOpen)}><MenuIcon fontSize="small" /></IconButton>
            </Tooltip>
          )}
          <Typography variant="caption" color="text.disabled" sx={{ '& span': { color: 'text.secondary' } }}>
            <span>Prompt Engineering</span> › <span>Phase {lesson.phase}</span> › Lesson {lesson.lesson}
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ mb: 2.5, p: { xs: 2, sm: 2.5 }, borderRadius: 2.5, border: '1px solid', borderColor: 'divider',
          background: phase ? isDark ? `linear-gradient(135deg, ${alpha(phase.color, 0.12)} 0%, transparent 100%)` : `linear-gradient(135deg, ${alpha(phase.color, 0.07)} 0%, transparent 100%)` : undefined }}>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2} flexWrap="wrap">
            <Box flex={1} minWidth={0}>
              <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                {phase && <Chip size="small" label={`Phase ${phase.number} · ${phase.icon} ${phase.title}`} sx={{ bgcolor: alpha(phase.color, 0.12), color: phase.color, fontWeight: 700, fontSize: '0.65rem', height: 22 }} />}
                <Chip size="small" label={lesson.difficulty} sx={{ bgcolor: alpha(difficultyColor[lesson.difficulty] ?? '#64748b', 0.12), color: difficultyColor[lesson.difficulty] ?? '#64748b', fontWeight: 600, fontSize: '0.65rem', height: 22 }} />
                <Box display="flex" alignItems="center" gap={0.5} color="text.disabled">
                  <AccessTimeIcon sx={{ fontSize: 13 }} />
                  <Typography variant="caption">{lesson.duration}</Typography>
                </Box>
              </Box>
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em', lineHeight: 1.3, mb: 0.5 }}>{lesson.title}</Typography>
              <Typography variant="body2" color="text.secondary">{lesson.subtitle}</Typography>
            </Box>
            <Button size="small" variant={isComplete ? 'contained' : 'outlined'}
              startIcon={isComplete ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
              onClick={handleToggleComplete}
              sx={{ fontWeight: 700, borderRadius: 2, flexShrink: 0, fontSize: '0.75rem', ...(isComplete ? { bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } } : { borderColor: 'divider', color: 'text.secondary' }) }}>
              {isComplete ? 'Completed' : 'Mark Complete'}
            </Button>
          </Box>
        </Paper>

        {lesson.sections.map((section) => <SectionCard key={section.id} section={section} />)}

        {lesson.checkpoints.length > 0 && (
          <Paper elevation={0} sx={{ mb: 2.5, p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: alpha(ACCENT, 0.25), bgcolor: isDark ? alpha(ACCENT, 0.08) : alpha(ACCENT, 0.04) }}>
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <QuizIcon sx={{ fontSize: 18, color: ACCENT }} />
              <Typography variant="subtitle2" fontWeight={700} color={ACCENT}>Checkpoint — Can You Answer These?</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Answer each out loud before moving to the next lesson.
            </Typography>
            <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
              {lesson.checkpoints.map((q, i) => (
                <Box component="li" key={i} sx={{ mb: 1, fontSize: '0.88rem', lineHeight: 1.6, color: 'text.primary', fontWeight: 500 }}>{q}</Box>
              ))}
            </Box>
          </Paper>
        )}

        <Divider sx={{ my: 2.5 }} />

        <Box display="flex" justifyContent="space-between" gap={2} flexWrap="wrap" pb={4}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />}
            onClick={() => prevLesson && navigate(`/prompt-course/lesson/${prevLesson.id}`)}
            disabled={!prevLesson} sx={{ fontWeight: 600, borderRadius: 2 }}>
            {prevLesson ? prevLesson.title : 'Previous'}
          </Button>
          <Button variant="contained" endIcon={<ArrowForwardIcon />}
            onClick={nextLesson ? handleNext : () => navigate('/prompt-course')}
            sx={{ fontWeight: 700, borderRadius: 2, bgcolor: phase?.color ?? ACCENT, '&:hover': { filter: 'brightness(0.88)' } }}>
            {nextLesson ? nextLesson.title : 'Back to Course'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PromptEngineeringCourseLesson;
