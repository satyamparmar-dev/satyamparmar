import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  Skeleton,
  SelectChangeEvent,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import { useSearchParams } from 'react-router-dom';
import { fetchCurriculum, fetchScenarioDrill } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import {
  ScenarioDayBundle,
  ScenarioDrillData,
  ScenarioFollowUp,
  ScenarioItem,
} from '../types';
import { parseMarkdown } from '../utils/markdown';
import { useContentAccess } from '../auth/ContentAccessContext';
import SignInToContinueCallout from '../components/SignInToContinueCallout';

function bundleByDayMap(data: ScenarioDrillData): Map<number, ScenarioDayBundle> {
  const m = new Map<number, ScenarioDayBundle>();
  for (const b of data.days) {
    m.set(b.day, b);
  }
  return m;
}

function matchesSearch(text: string, q: string): boolean {
  if (!q.trim()) return true;
  const lower = q.toLowerCase();
  return text.toLowerCase().includes(lower);
}

/** Truncate markdown for a signed-out preview (keeps parseMarkdown safer than mid-tag cuts). */
function previewMarkdownSlice(md: string, maxChars: number): string {
  const t = md.trim();
  if (t.length <= maxChars) return t;
  const slice = t.slice(0, maxChars);
  const lastBreak = Math.max(slice.lastIndexOf('\n\n'), slice.lastIndexOf('. '));
  const cut = lastBreak > maxChars * 0.45 ? slice.slice(0, lastBreak + 1) : slice;
  return `${cut.replace(/\s+$/, '')}\n\n…`;
}

const ScenarioDrill: React.FC = () => {
  const { curriculum, setCurriculum } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [drill, setDrill] = useState<ScenarioDrillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const phaseParam = searchParams.get('phase') ?? '';
  const dayParam = searchParams.get('day');
  const viewParam = searchParams.get('view');
  const themeParam = searchParams.get('theme');

  const [phaseId, setPhaseId] = useState<string>(phaseParam);
  const [dayNum, setDayNum] = useState<number>(() => {
    const n = dayParam ? Number(dayParam) : NaN;
    return Number.isFinite(n) && n > 0 ? n : 1;
  });
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'curriculum' | 'themes'>(() =>
    viewParam === 'themes' ? 'themes' : 'curriculum'
  );
  const [themeId, setThemeId] = useState<string>(themeParam ?? '');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        let curr = curriculum;
        if (!curr) {
          curr = await fetchCurriculum();
          if (!cancelled) setCurriculum(curr);
        }
        const d = await fetchScenarioDrill();
        if (cancelled) return;
        setDrill(d);

        const themes = d.interviewThemes ?? [];
        if (viewParam === 'themes' && themes.length > 0) {
          const tid =
            themeParam && themes.some((t) => t.id === themeParam) ? themeParam : themes[0].id;
          if (!cancelled) {
            setViewMode('themes');
            setThemeId(tid);
            setSearchParams({ view: 'themes', theme: tid }, { replace: true });
          }
        }

        let resolvedPhase = phaseParam;
        let resolvedDay = dayParam ? Number(dayParam) : NaN;

        const n = dayParam ? Number(dayParam) : NaN;
        if (Number.isFinite(n) && n > 0) {
          setDayNum(n);
          const ph = curr.phases.find((p) => {
            const [s, e] = p.days.split('–').map(Number);
            return n >= s && n <= e;
          });
          if (ph) {
            setPhaseId(ph.id);
            resolvedPhase = ph.id;
            resolvedDay = n;
          }
        } else if (curr && !phaseParam) {
          const first = curr.phases[0];
          if (first) {
            const start = Number(first.days.split('–')[0]);
            setPhaseId(first.id);
            setDayNum(start);
            resolvedPhase = first.id;
            resolvedDay = start;
          }
        } else if (phaseParam && curr.phases.some((p) => p.id === phaseParam)) {
          setPhaseId(phaseParam);
          const p = curr.phases.find((x) => x.id === phaseParam)!;
          const [start, end] = p.days.split('–').map(Number);
          const dn = dayParam ? Number(dayParam) : NaN;
          if (Number.isFinite(dn) && dn >= start && dn <= end) {
            setDayNum(dn);
            resolvedDay = dn;
          } else {
            setDayNum(start);
            resolvedDay = start;
          }
          resolvedPhase = phaseParam;
        }

        if (!resolvedPhase || !Number.isFinite(resolvedDay) || resolvedDay < 1) {
          const f = curr.phases[0];
          if (f) {
            resolvedPhase = f.id;
            resolvedDay = Number(f.days.split('–')[0]);
            setPhaseId(f.id);
            setDayNum(resolvedDay);
          }
        }

        if (resolvedPhase && Number.isFinite(resolvedDay) && resolvedDay > 0) {
          setSearchParams({ phase: resolvedPhase, day: String(resolvedDay) }, { replace: true });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load scenario drill');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dayMap = useMemo(() => (drill ? bundleByDayMap(drill) : new Map()), [drill]);

  const phases = curriculum?.phases ?? [];

  const daysInPhase = useMemo(() => {
    const p = phases.find((x) => x.id === phaseId);
    if (!p) return [] as number[];
    const [s, e] = p.days.split('–').map(Number);
    return Array.from({ length: e - s + 1 }, (_, i) => s + i);
  }, [phases, phaseId]);

  const activeBundle = dayMap.get(dayNum) ?? null;
  const interviewThemes = drill?.interviewThemes ?? [];
  const activeTheme = useMemo(() => {
    if (!interviewThemes.length) return null;
    const found = interviewThemes.find((t) => t.id === themeId);
    return found ?? interviewThemes[0];
  }, [interviewThemes, themeId]);

  useEffect(() => {
    if (viewMode !== 'themes' || !interviewThemes.length) return;
    if (!themeId || !interviewThemes.some((t) => t.id === themeId)) {
      setThemeId(interviewThemes[0].id);
    }
  }, [viewMode, interviewThemes, themeId]);

  useEffect(() => {
    if (viewMode === 'themes' && interviewThemes.length === 0) {
      setViewMode('curriculum');
    }
  }, [viewMode, interviewThemes.length]);

  const scenariosFiltered = useMemo(() => {
    const q = search.trim();
    const filterItems = (items: ScenarioItem[]) =>
      items.filter((s: ScenarioItem) => {
        if (!q) return true;
        const blob = [
          s.question,
          s.answer,
          ...(s.signals ?? []),
          ...(s.followUps ?? []).flatMap((f: ScenarioFollowUp) => [f.question, f.answer]),
        ].join(' ');
        return matchesSearch(blob, q);
      });

    if (viewMode === 'themes' && activeTheme) {
      return filterItems(activeTheme.scenarios);
    }
    if (!activeBundle) return [];
    return filterItems(activeBundle.scenarios);
  }, [viewMode, activeTheme, activeBundle, search]);

  const handlePhaseChange = (e: SelectChangeEvent<string>) => {
    const id = e.target.value;
    setPhaseId(id);
    const p = phases.find((x) => x.id === id);
    if (p) {
      const start = Number(p.days.split('–')[0]);
      setDayNum(start);
      setSearchParams({ phase: id, day: String(start) });
    }
  };

  const handleDayChange = (e: SelectChangeEvent<string>) => {
    const n = Number(e.target.value);
    setDayNum(n);
    setSearchParams({ phase: phaseId, day: String(n) });
  };

  const handleViewMode = (_: React.MouseEvent<HTMLElement>, next: 'curriculum' | 'themes' | null) => {
    if (!next || !drill) return;
    setViewMode(next);
    setSearch('');
    if (next === 'themes') {
      const themes = drill.interviewThemes ?? [];
      if (themes.length === 0) return;
      const tid =
        themeId && themes.some((t) => t.id === themeId) ? themeId : themes[0].id;
      setThemeId(tid);
      setSearchParams({ view: 'themes', theme: tid });
    } else {
      setSearchParams({ phase: phaseId, day: String(dayNum) });
    }
  };

  const handleThemeChange = (e: SelectChangeEvent<string>) => {
    const id = e.target.value;
    setThemeId(id);
    setSearchParams({ view: 'themes', theme: id });
  };

  if (loading) {
    return (
      <Box className="fade-in" py={2}>
        <Skeleton variant="text" width="60%" height={48} />
        <Skeleton variant="rounded" height={120} sx={{ mt: 2 }} />
        <Skeleton variant="rounded" height={200} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (error || !drill || !curriculum) {
    return (
      <Box py={4}>
        <Alert severity="error">{error ?? 'Unable to load scenario drill.'}</Alert>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      <Box display="flex" alignItems="flex-start" gap={2} mb={2} flexWrap="wrap">
        <RecordVoiceOverIcon sx={{ fontSize: 40, color: 'primary.main', mt: 0.5 }} />
        <Box flex={1} minWidth={240}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Scenario interview drill
          </Typography>
          <Typography color="text.secondary" variant="body2" maxWidth={720}>
            Real interviews test how you debug, design, and decide under pressure — not textbook definitions.
            Pick a day, read the scenario, then reveal structured answers, signals, and follow-ups.
          </Typography>
        </Box>
      </Box>

      {(interviewThemes.length > 0 || viewMode === 'themes') && (
        <Box mb={2}>
          <ToggleButtonGroup
            exclusive
            value={viewMode}
            onChange={handleViewMode}
            size="small"
            color="primary"
            sx={{ flexWrap: 'wrap' }}
          >
            <ToggleButton value="curriculum">Curriculum (by day)</ToggleButton>
            <ToggleButton value="themes" disabled={interviewThemes.length === 0}>
              Interview themes
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          {viewMode === 'curriculum' ? (
            <GridFilters
              phases={phases}
              phaseId={phaseId}
              daysInPhase={daysInPhase}
              dayNum={dayNum}
              search={search}
              onPhaseChange={handlePhaseChange}
              onDayChange={handleDayChange}
              onSearchChange={setSearch}
            />
          ) : (
            <ThemeFilters
              themes={interviewThemes}
              themeId={activeTheme?.id ?? themeId}
              search={search}
              onThemeChange={handleThemeChange}
              onSearchChange={setSearch}
            />
          )}
        </CardContent>
      </Card>

      {viewMode === 'curriculum' && activeBundle && activeBundle.scenarios.length > 0 && (
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Day {activeBundle.day}: {activeBundle.title}
          {(activeBundle.tags?.length ?? 0) > 0 && (
            <>
              {' '}
              {(activeBundle.tags ?? []).map((t: string) => (
                <Chip key={t} label={t} size="small" sx={{ ml: 0.5, height: 22 }} variant="outlined" />
              ))}
            </>
          )}
        </Typography>
      )}

      {viewMode === 'themes' && activeTheme && activeTheme.scenarios.length > 0 && (
        <Box mb={1}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {activeTheme.title}
            {activeTheme.subtitle && (
              <Typography component="span" variant="body2" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                {activeTheme.subtitle}
              </Typography>
            )}
          </Typography>
          {(activeTheme.tags?.length ?? 0) > 0 && (
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {(activeTheme.tags ?? []).map((t: string) => (
                <Chip key={t} label={t} size="small" sx={{ height: 22 }} variant="outlined" />
              ))}
            </Box>
          )}
        </Box>
      )}

      {viewMode === 'curriculum' && !activeBundle?.scenarios?.length && (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          No scenario bundles for Day {dayNum} yet. Try another day or add{' '}
          <code>public/data/days/scenarioDrill-day{dayNum}.json</code> (and list the day in{' '}
          <code>scenarioDrill.json</code> → <code>externalDayNumbers</code>).
        </Alert>
      )}

      {viewMode === 'themes' && interviewThemes.length === 0 && (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          No interview theme packs found. Add <code>public/data/scenarioInterviewThemes.json</code> with a{' '}
          <code>themes</code> array (same scenario shape as the day drill).
        </Alert>
      )}

      {viewMode === 'themes' && activeTheme && !activeTheme.scenarios.length && (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Theme &quot;{activeTheme.title}&quot; has no scenarios yet.
        </Alert>
      )}

      <Box display="flex" flexDirection="column" gap={1.5} mt={2}>
        {scenariosFiltered.map((item: ScenarioItem) => (
          <ScenarioAccordion key={item.id} item={item} />
        ))}
      </Box>

      {viewMode === 'curriculum' &&
        activeBundle &&
        scenariosFiltered.length === 0 &&
        activeBundle.scenarios.length > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No scenarios match your search. Clear the search box to see all {activeBundle.scenarios.length} for this
            day.
          </Alert>
        )}

      {viewMode === 'themes' &&
        activeTheme &&
        scenariosFiltered.length === 0 &&
        activeTheme.scenarios.length > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No scenarios match your search. Clear the search box to see all {activeTheme.scenarios.length} in this
            theme.
          </Alert>
        )}
    </Box>
  );
};

const ThemeFilters: React.FC<{
  themes: { id: string; title: string }[];
  themeId: string;
  search: string;
  onThemeChange: (e: SelectChangeEvent<string>) => void;
  onSearchChange: (v: string) => void;
}> = ({ themes, themeId, search, onThemeChange, onSearchChange }) => (
  <Box
    display="grid"
    gridTemplateColumns={{ xs: '1fr', md: '1fr 2fr' }}
    gap={2}
    alignItems="flex-end"
  >
    <FormControl fullWidth size="small">
      <InputLabel id="sc-theme">Theme</InputLabel>
      <Select labelId="sc-theme" label="Theme" value={themeId} onChange={onThemeChange}>
        {themes.map((t) => (
          <MenuItem key={t.id} value={t.id}>
            {t.title}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <TextField
      fullWidth
      size="small"
      label="Search scenarios & answers"
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="e.g. OAuth, idempotency, Kafka…"
    />
  </Box>
);

const GridFilters: React.FC<{
  phases: { id: string; number: number; title: string; days: string }[];
  phaseId: string;
  daysInPhase: number[];
  dayNum: number;
  search: string;
  onPhaseChange: (e: SelectChangeEvent<string>) => void;
  onDayChange: (e: SelectChangeEvent<string>) => void;
  onSearchChange: (v: string) => void;
}> = ({
  phases,
  phaseId,
  daysInPhase,
  dayNum,
  search,
  onPhaseChange,
  onDayChange,
  onSearchChange,
}) => (
  <Box
    display="grid"
    gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 2fr' }}
    gap={2}
    alignItems="flex-end"
  >
    <FormControl fullWidth size="small">
      <InputLabel id="sc-phase">Phase</InputLabel>
      <Select labelId="sc-phase" label="Phase" value={phaseId} onChange={onPhaseChange}>
        {phases.map((p) => (
          <MenuItem key={p.id} value={p.id}>
            Phase {p.number} · Days {p.days}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <FormControl fullWidth size="small">
      <InputLabel id="sc-day">Day</InputLabel>
      <Select
        labelId="sc-day"
        label="Day"
        value={String(dayNum)}
        onChange={onDayChange}
      >
        {daysInPhase.map((d) => (
          <MenuItem key={d} value={String(d)}>
            Day {d}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <TextField
      fullWidth
      size="small"
      label="Search scenarios & answers"
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="e.g. Kafka, idempotency, JVM…"
    />
  </Box>
);

const ScenarioAccordion: React.FC<{ item: ScenarioItem }> = ({ item }) => {
  const { hasFullAccess } = useContentAccess();

  return (
    <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: '8px !important', '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight={700} pr={2}>
          {item.question}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        {hasFullAccess ? (
          <>
            {(item.signals?.length ?? 0) > 0 && (
              <Box mb={2}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.75}>
                  Signals / keywords
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {(item.signals ?? []).map((s) => (
                    <Chip key={s} label={s} size="small" variant="outlined" sx={{ height: 24 }} />
                  ))}
                </Box>
              </Box>
            )}
            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.75}>
              Answer
            </Typography>
            <Box
              className="md-content"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(item.answer) }}
              sx={{ lineHeight: 1.75, '& pre': { overflow: 'auto' }, mb: 2 }}
            />
            {(item.followUps?.length ?? 0) > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Follow-up questions
                </Typography>
                {(item.followUps ?? []).map((fu, i) => (
                  <Accordion
                    key={i}
                    disableGutters
                    sx={{
                      mb: 1,
                      border: 1,
                      borderColor: 'action.hover',
                      borderRadius: '8px !important',
                      '&:before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="body2" fontWeight={600}>
                        {fu.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        className="md-content"
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(fu.answer) }}
                        sx={{ lineHeight: 1.75, '& pre': { overflow: 'auto' } }}
                      />
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </>
        ) : (
          <>
            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.75}>
              Answer (preview)
            </Typography>
            <Box sx={{ position: 'relative', maxHeight: 220, overflow: 'hidden', mb: 2 }}>
              <Box
                className="md-content"
                dangerouslySetInnerHTML={{
                  __html: parseMarkdown(previewMarkdownSlice(item.answer, 700)),
                }}
                sx={{ lineHeight: 1.75, '& pre': { overflow: 'auto' } }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 72,
                  pointerEvents: 'none',
                  background: (t) =>
                    `linear-gradient(180deg, transparent, ${t.palette.background.default})`,
                }}
              />
            </Box>
            <SignInToContinueCallout message="You are viewing a short preview. Full answers, signals, and follow-ups are available after you sign in with an authorized email." />
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default ScenarioDrill;
