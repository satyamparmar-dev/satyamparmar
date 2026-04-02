import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Fade,
  LinearProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import { parseMarkdown } from '../utils/markdown';

interface QuizCardProps {
  question: string;
  answer: string;
  questionType: 'conceptual' | 'codeBased' | 'seniorScenario';
  current: number;
  total: number;
  onKnew: () => void;
  onReview: () => void;
}

const typeColors: Record<string, string> = {
  conceptual: '#58A6FF',
  codeBased: '#3FB950',
  seniorScenario: '#764ba2',
};

const typeLabels: Record<string, string> = {
  conceptual: 'Conceptual',
  codeBased: 'Code-Based',
  seniorScenario: 'Senior Scenario',
};

const QuizCard: React.FC<QuizCardProps> = ({
  question,
  answer,
  questionType,
  current,
  total,
  onKnew,
  onReview,
}) => {
  const [flipped, setFlipped] = useState(false);

  const color = typeColors[questionType] || '#667eea';
  const progress = (current / total) * 100;

  return (
    <Box>
      {/* Progress */}
      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography variant="caption" color="text.secondary">
            Question {current} of {total}
          </Typography>
          <Chip
            label={typeLabels[questionType]}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 600,
              color,
              bgcolor: `${color}18`,
              borderRadius: '4px',
            }}
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 4,
            borderRadius: 2,
            bgcolor: 'action.hover',
            '& .MuiLinearProgress-bar': {
              bgcolor: color,
            },
          }}
        />
      </Box>

      {/* Card */}
      <Box
        sx={{
          perspective: '1000px',
          cursor: 'pointer',
          minHeight: 280,
        }}
        onClick={() => setFlipped(!flipped)}
      >
        <Box
          sx={{
            position: 'relative',
            minHeight: 280,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front — Question */}
          <Card
            sx={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              border: `2px solid ${color}40`,
              cursor: 'pointer',
            }}
          >
            <CardContent
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 4,
                textAlign: 'center',
              }}
            >
              <Typography
                variant="overline"
                sx={{ color, mb: 2, display: 'block' }}
              >
                Question
              </Typography>
              <Typography variant="h6" fontWeight={600} lineHeight={1.5}>
                {question}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 3 }}
              >
                Click to reveal answer
              </Typography>
            </CardContent>
          </Card>

          {/* Back — Answer */}
          <Card
            sx={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              border: `2px solid ${color}40`,
              cursor: 'pointer',
              overflow: 'auto',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="overline"
                sx={{ color, mb: 1.5, display: 'block' }}
              >
                Answer
              </Typography>
              <Fade in={flipped}>
                <Box
                  className="md-content"
                  sx={{
                    '& p': { mb: 1 },
                    '& code': {
                      bgcolor: 'action.hover',
                      px: 0.5,
                      py: 0.25,
                      borderRadius: 0.5,
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.82em',
                    },
                  }}
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(answer) }}
                />
              </Fade>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Action Buttons */}
      {flipped && (
        <Fade in={flipped}>
          <Box display="flex" gap={2} mt={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<ReplayIcon />}
              onClick={(e) => { e.stopPropagation(); onReview(); setFlipped(false); }}
              sx={{
                flex: 1,
                maxWidth: 180,
                borderColor: '#D29922',
                color: '#D29922',
                '&:hover': { borderColor: '#D29922', bgcolor: '#D2992218' },
              }}
            >
              Review Later
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={(e) => { e.stopPropagation(); onKnew(); setFlipped(false); }}
              sx={{
                flex: 1,
                maxWidth: 180,
                bgcolor: '#3FB950',
                '&:hover': { bgcolor: '#2EA043' },
              }}
            >
              Got It!
            </Button>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default QuizCard;
