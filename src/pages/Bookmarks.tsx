import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActionArea,
  Chip, IconButton, Tooltip, MenuItem, Select, FormControl,
  InputLabel, Button,
} from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import LevelBadge from '../components/LevelBadge';
import TrackBanner from '../components/TrackBanner';

const Bookmarks: React.FC = () => {
  const navigate = useNavigate();
  const { curriculum, loadedPhases, progress, toggleBookmark } = useAppStore();
  const [filterPhase, setFilterPhase] = useState<string>('all');

  if (!curriculum) return null;

  const bookmarkedDays = (progress.bookmarks ?? [])
    .map((dayNum) => {
      const phaseKey = Object.keys(loadedPhases).find((k) =>
        loadedPhases[k]?.days?.some((d) => d.day === dayNum)
      );
      const dayData = phaseKey
        ? loadedPhases[phaseKey]?.days?.find((d) => d.day === dayNum) ?? null
        : null;
      const phase = curriculum.phases.find((p) => {
        const [s, e] = p.days.split('–').map(Number);
        return dayNum >= s && dayNum <= e;
      });
      return { dayNum, dayData, phase };
    })
    .filter(({ phase }) => filterPhase === 'all' || phase?.id === filterPhase)
    .sort((a, b) => a.dayNum - b.dayNum);

  return (
    <Box className="fade-in">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Bookmarks</Typography>
          <Typography color="text.secondary">
            {(progress.bookmarks ?? []).length} saved {(progress.bookmarks ?? []).length === 1 ? 'day' : 'days'}
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter by Phase</InputLabel>
          <Select
            value={filterPhase}
            label="Filter by Phase"
            onChange={(e) => setFilterPhase(e.target.value)}
          >
            <MenuItem value="all">All Phases</MenuItem>
            {curriculum.phases.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                Phase {p.number}: {p.title.replace(/Phase \d+ · /, '').slice(0, 25)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {bookmarkedDays.length === 0 ? (
        <Box py={8} textAlign="center">
          <BookmarkIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No bookmarks yet
          </Typography>
          <Typography variant="body2" color="text.disabled" gutterBottom>
            Click the bookmark icon on any lesson to save it here
          </Typography>
          <Button variant="contained" onClick={() => navigate('/roadmap')} sx={{ mt: 2 }}>
            Browse Roadmap
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {bookmarkedDays.map(({ dayNum, dayData, phase }) => (
            <Grid item xs={12} sm={6} md={4} key={dayNum}>
              <Card sx={{ position: 'relative' }}>
                <CardActionArea onClick={() => navigate(`/learn/${dayNum}`)}>
                  <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
                      <Chip
                        label={`Day ${dayNum}`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(102,126,234,0.12)',
                          color: 'primary.main',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                        }}
                      />
                      {dayData && <LevelBadge level={dayData.level} />}
                      {phase && <TrackBanner track={phase.track} compact />}
                    </Box>
                    <Typography variant="body2" fontWeight={700} mb={0.5}>
                      {dayData?.title ?? `Day ${dayNum}`}
                    </Typography>
                    {phase && (
                      <Typography variant="caption" color="text.secondary">
                        Phase {phase.number}: {phase.title.replace(/Phase \d+ · /, '').slice(0, 35)}
                      </Typography>
                    )}
                    {dayData?.tags && (
                      <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                        {dayData.tags.slice(0, 3).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ height: 18, fontSize: '0.6rem' }}
                          />
                        ))}
                      </Box>
                    )}
                    {progress.completedDays.includes(dayNum) && (
                      <Chip
                        label="Completed"
                        size="small"
                        sx={{
                          mt: 1,
                          height: 18,
                          fontSize: '0.6rem',
                          bgcolor: 'rgba(63,185,80,0.1)',
                          color: '#3FB950',
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </CardContent>
                </CardActionArea>
                <Tooltip title="Remove bookmark">
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); toggleBookmark(dayNum); }}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      color: '#D29922',
                      opacity: 0.7,
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Bookmarks;
