import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemButton,
  Chip,
  InputAdornment,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArticleIcon from '@mui/icons-material/Article';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { SearchResult } from '../types';
import { getLevelColor } from '../utils/formatters';

const typeColors: Record<string, string> = {
  title: '#667eea',
  tag: '#3FB950',
  theory: '#58A6FF',
  interview: '#D29922',
  code: '#764ba2',
};

const SearchModal: React.FC = () => {
  const { searchOpen, setSearchOpen, loadedPhases, curriculum } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
    }
  }, [searchOpen]);

  const search = useCallback(
    (q: string) => {
      if (q.length < 2) { setResults([]); return; }
      const lq = q.toLowerCase();
      const found: SearchResult[] = [];

      for (const phaseData of Object.values(loadedPhases)) {
        const phase = curriculum?.phases.find((p) => p.number === phaseData.phase);
        if (!phase) continue;

        for (const day of phaseData.days) {
          const addResult = (
            matchType: SearchResult['matchType'],
            snippet: string,
            score: number
          ) => {
            found.push({
              dayNumber: day.day,
              phase: phase.id,
              phaseTitle: phase.title,
              dayTitle: day.title,
              matchType,
              snippet: snippet.slice(0, 120),
              score,
            });
          };

          if (day.title.toLowerCase().includes(lq)) {
            addResult('title', day.title, 100);
          }

          if (day.tags?.some((t) => t.toLowerCase().includes(lq))) {
            addResult('tag', (day.tags ?? []).join(', '), 80);
          }

          for (const section of day.sections) {
            if (section.type === 'theory' && section.content.toLowerCase().includes(lq)) {
              const idx = section.content.toLowerCase().indexOf(lq);
              addResult('theory', section.content.slice(Math.max(0, idx - 40), idx + 80), 60);
            }
            if (section.type === 'interview') {
              const allQ = [
                ...section.conceptual,
                ...section.codeBased,
                ...section.seniorScenario,
              ];
              for (const qa of allQ) {
                if (qa.question.toLowerCase().includes(lq)) {
                  addResult('interview', qa.question, 70);
                }
              }
            }
            if (section.type === 'code') {
              const desc = (section as { description?: string }).description?.toLowerCase() ?? '';
              if (
                section.code.toLowerCase().includes(lq) ||
                (desc && desc.includes(lq))
              ) {
                addResult('code', `Code: ${section.filename}`, 50);
              }
            }
          }
        }
      }

      // Deduplicate by dayNumber+type and sort
      const seen = new Set<string>();
      const deduped = found.filter((r) => {
        const key = `${r.dayNumber}-${r.matchType}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setResults(deduped.sort((a, b) => b.score - a.score).slice(0, 12));
    },
    [loadedPhases, curriculum]
  );

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleSelect = (dayNumber: number) => {
    navigate(`/learn/${dayNumber}`);
    setSearchOpen(false);
  };

  return (
    <Dialog
      open={searchOpen}
      onClose={() => setSearchOpen(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          maxHeight: '70vh',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            placeholder="Search lessons, topics, interview questions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: { fontSize: '1.1rem', py: 0.5 },
            }}
          />
        </Box>

        {results.length === 0 && query.length >= 2 && (
          <Box py={4} textAlign="center">
            <Typography color="text.secondary">
              No results for "{query}"
            </Typography>
          </Box>
        )}

        {results.length === 0 && query.length < 2 && (
          <Box py={4} textAlign="center">
            <ArticleIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary" variant="body2">
              Search across all 90 days of content
            </Typography>
            <Typography color="text.disabled" variant="caption">
              Topics, theory, interview Q&amp;As, code examples
            </Typography>
          </Box>
        )}

        {results.length > 0 && (
          <List disablePadding>
            {results.map((result, idx) => (
              <React.Fragment key={`${result.dayNumber}-${result.matchType}-${idx}`}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleSelect(result.dayNumber)}
                    sx={{ px: 2, py: 1.5 }}
                  >
                    <Box width="100%">
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#667eea',
                            fontWeight: 600,
                            bgcolor: 'rgba(102,126,234,0.1)',
                            px: 0.75,
                            py: 0.25,
                            borderRadius: 1,
                          }}
                        >
                          Day {result.dayNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {result.phaseTitle}
                        </Typography>
                        <Chip
                          label={result.matchType}
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: '0.6rem',
                            fontWeight: 600,
                            color: typeColors[result.matchType],
                            bgcolor: `${typeColors[result.matchType]}18`,
                            borderRadius: '4px',
                            ml: 'auto',
                          }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        {result.dayTitle}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {result.snippet}
                      </Typography>
                    </Box>
                  </ListItemButton>
                </ListItem>
                {idx < results.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        <Box
          sx={{
            p: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            gap: 2,
          }}
        >
          {[['↵', 'open'], ['esc', 'close']].map(([key, label]) => (
            <Box key={key} display="flex" alignItems="center" gap={0.5}>
              <Box
                component="kbd"
                sx={{
                  px: 0.75,
                  py: 0.25,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  fontSize: '0.7rem',
                  fontFamily: 'monospace',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {key}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
