import React from 'react';
import {
  Box, Grid, Typography, Card, CardContent, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip,
} from '@mui/material';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAppStore, selectCompletionRate } from '../store/useAppStore';
import { getLevelColor, formatHours, formatDate, getScoreColor } from '../utils/formatters';
import LevelBadge from '../components/LevelBadge';

const RADIAN = Math.PI / 180;

const Progress: React.FC = () => {
  const navigate = useNavigate();
  const { curriculum, progress, loadedPhases, theme, exportProgress } = useAppStore();
  const completionRate = useAppStore(selectCompletionRate);

  const handleExport = () => {
    const state = {
      exportedAt: new Date().toISOString(),
      progress: useAppStore.getState().progress,
      bookmarks: useAppStore.getState().progress.bookmarks,
      notes: useAppStore.getState().progress.notes,
    };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satyverse-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!curriculum) {
    return (
      <Box py={8} textAlign="center">
        <Typography>Loading progress...</Typography>
      </Box>
    );
  }

  const phaseData = curriculum.phases.map((phase) => {
    const [start, end] = phase.days.split('–').map(Number);
    const total = end - start + 1;
    const done = progress.completedDays.filter((d) => d >= start && d <= end).length;
    return {
      name: `P${phase.number}`,
      fullName: phase.title.replace(/Phase \d+ · /, ''),
      completed: done,
      remaining: total - done,
      total,
      pct: Math.round((done / total) * 100),
      color: getLevelColor(phase.level),
      level: phase.level,
    };
  });

  const pieData = [
    { name: 'Completed', value: progress.completedDays.length, color: '#3FB950' },
    { name: 'Remaining', value: (curriculum.totalDays - progress.completedDays.length), color: '#30363D' },
  ];

  const quizEntries = Object.entries(progress.quizScores ?? {}).map(([day, score]) => {
    const phaseKey = Object.keys(loadedPhases).find((k) =>
      loadedPhases[k]?.days?.some((d) => d.day === Number(day))
    );
    const dayData = phaseKey
      ? loadedPhases[phaseKey]?.days?.find((d) => d.day === Number(day)) ?? null
      : null;
    return {
      day: Number(day),
      title: dayData?.title ?? `Day ${day}`,
      knew: score.knew,
      review: score.review,
      date: score.date,
      pct: score.knew + score.review > 0
        ? Math.round((score.knew / (score.knew + score.review)) * 100)
        : 0,
    };
  }).sort((a, b) => b.day - a.day);

  const noteDays = Object.entries(progress.notes ?? {})
    .filter(([, note]) => note.trim())
    .map(([day, note]) => ({ day: Number(day), note }))
    .sort((a, b) => b.day - a.day);

  return (
    <Box className="fade-in">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Progress</Typography>
          <Typography color="text.secondary">Your 90-day Java mastery journey</Typography>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button variant="outlined" size="small" onClick={handleExport}>
            Export Progress Backup
          </Button>
          <Button variant="outlined" size="small" onClick={exportProgress}>
            Export JSON
          </Button>
        </Box>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={800}>
            Scenario interview drill
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Full answers, signals, and follow-ups — mapped by day (manifest in{' '}
            <code style={{ fontSize: '0.85em' }}>scenarioDrill.json</code> + files under{' '}
            <code style={{ fontSize: '0.85em' }}>data/days/</code>).
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RecordVoiceOverIcon />}
          onClick={() => navigate('/scenarios')}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          Open scenarios
        </Button>
      </Paper>

      <Grid container spacing={3}>
        {/* Overall Donut */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Overall Completion
              </Typography>
              <Box display="flex" justifyContent="center" my={1}>
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx={100}
                      cy={100}
                      innerRadius={60}
                      outerRadius={85}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box textAlign="center">
                <Typography variant="h3" fontWeight={900} color="primary.main">
                  {completionRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {progress.completedDays.length} of {curriculum.totalDays} days complete
                </Typography>
              </Box>
              <Box mt={2}>
                {[
                  { label: 'Days Done', value: progress.completedDays.length, color: '#3FB950' },
                  { label: 'Streak', value: `${progress.streak} days`, color: '#D29922' },
                  { label: 'Hours', value: formatHours(progress.totalHours), color: '#58A6FF' },
                  { label: 'Exercises', value: progress.exercisesSolved.length, color: '#764ba2' },
                ].map(({ label, value, color }) => (
                  <Box key={label} display="flex" justifyContent="space-between" py={0.5}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Phase Bar Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Phase-by-Phase Progress
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={phaseData} barSize={20}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme === 'dark' ? '#30363D' : '#E8ECEF'}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#8B949E' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#8B949E' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: theme === 'dark' ? '#161B22' : '#fff',
                      border: '1px solid #30363D',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number, name: string) => [v, name]}
                  />
                  <Legend />
                  <Bar dataKey="completed" name="Completed" stackId="a" radius={[4, 4, 0, 0]}>
                    {phaseData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                  <Bar dataKey="remaining" name="Remaining" stackId="a" fill="#30363D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Phase Details */}
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Phase Details
          </Typography>
          <Grid container spacing={1.5}>
            {phaseData.map((p) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={p.name}>
                <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={900} sx={{ color: p.color }}>
                    {p.pct}%
                  </Typography>
                  <Typography variant="caption" fontWeight={700} display="block">
                    {p.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    {p.completed}/{p.total}
                  </Typography>
                  <LevelBadge level={p.level} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Quiz History */}
        {quizEntries.length > 0 && (
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Quiz Performance
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Day</TableCell>
                        <TableCell>Topic</TableCell>
                        <TableCell align="center">Score</TableCell>
                        <TableCell align="center">Knew</TableCell>
                        <TableCell align="center">Review</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {quizEntries.slice(0, 10).map((entry) => (
                        <TableRow
                          key={entry.day}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/quiz?day=${entry.day}`)}
                        >
                          <TableCell>
                            <Chip
                              label={`Day ${entry.day}`}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(102,126,234,0.1)',
                                color: 'primary.main',
                                fontSize: '0.65rem',
                                height: 20,
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" noWrap sx={{ maxWidth: 150, display: 'block' }}>
                              {entry.title}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography
                              variant="caption"
                              fontWeight={700}
                              sx={{ color: getScoreColor(entry.knew, entry.review) }}
                            >
                              {entry.pct}%
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="caption" sx={{ color: '#3FB950' }}>
                              {entry.knew}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="caption" sx={{ color: '#D29922' }}>
                              {entry.review}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(entry.date)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Notes Summary */}
        {noteDays.length > 0 && (
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  My Notes ({noteDays.length})
                </Typography>
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {noteDays.slice(0, 8).map(({ day, note }) => (
                    <Box
                      key={day}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        bgcolor: 'action.hover',
                        borderRadius: 2,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.selected' },
                      }}
                      onClick={() => navigate(`/learn/${day}`)}
                    >
                      <Typography variant="caption" fontWeight={700} color="primary.main">
                        Day {day}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {note}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Bookmarks */}
        {progress.bookmarks.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Bookmarks
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {progress.bookmarks.map((day) => (
                    <Chip
                      key={day}
                      label={`Day ${day}`}
                      onClick={() => navigate(`/learn/${day}`)}
                      sx={{
                        bgcolor: 'rgba(210,153,34,0.1)',
                        color: '#D29922',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Progress;
