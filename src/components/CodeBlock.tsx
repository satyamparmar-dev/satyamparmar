import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Collapse,
  Tooltip,
  Paper,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TerminalIcon from '@mui/icons-material/Terminal';
import { CodeSection } from '../types';
import { highlightCode } from '../utils/markdown';

interface Props {
  section: CodeSection;
}

const levelColors: Record<string, string> = {
  basic: '#3FB950',
  intermediate: '#58A6FF',
  advanced: '#764ba2',
};

const CodeBlock: React.FC<Props> = ({ section }) => {
  const [copied, setCopied] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(section.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlighted = highlightCode(section.code, section.language || 'java');

  return (
    <Box mb={3}>
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          bgcolor: '#1c2128',
          px: 2,
          py: 1,
          borderRadius: '10px 10px 0 0',
          borderBottom: '1px solid #30363d',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Box display="flex" gap={0.5}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#F85149' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#D29922' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#3FB950' }} />
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: '#8B949E',
              fontFamily: 'JetBrains Mono, monospace',
              ml: 1,
            }}
          >
            {section.filename}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Chip
            label={section.level}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 600,
              color: levelColors[section.level] || '#667eea',
              bgcolor: `${levelColors[section.level] || '#667eea'}18`,
              borderRadius: '4px',
            }}
          />
          <Chip
            label={section.language?.toUpperCase() || 'JAVA'}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 600,
              color: '#8B949E',
              bgcolor: 'rgba(139,148,158,0.1)',
              borderRadius: '4px',
            }}
          />
          <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
            <IconButton size="small" onClick={handleCopy} sx={{ color: '#8B949E' }}>
              {copied ? (
                <CheckIcon sx={{ fontSize: 16, color: '#3FB950' }} />
              ) : (
                <ContentCopyIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Code */}
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 0,
          bgcolor: '#0d1117',
          borderRadius: section.output ? '0' : '0 0 10px 10px',
          overflow: 'auto',
          maxHeight: 500,
          '& .hljs': {
            background: 'transparent !important',
            padding: '1.25em !important',
            fontFamily: 'JetBrains Mono, monospace !important',
            fontSize: '0.85rem !important',
            lineHeight: '1.7 !important',
          },
        }}
      >
        <code
          className={`hljs language-${section.language || 'java'}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </Box>

      {/* Output Panel */}
      {section.output && (
        <>
          <Box
            sx={{
              bgcolor: '#1c2128',
              px: 2,
              py: 0.75,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #30363d',
              cursor: 'pointer',
            }}
            onClick={() => setShowOutput(!showOutput)}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <TerminalIcon sx={{ fontSize: 14, color: '#3FB950' }} />
              <Typography variant="caption" sx={{ color: '#3FB950', fontWeight: 600 }}>
                Output
              </Typography>
            </Box>
            {showOutput ? (
              <ExpandLessIcon sx={{ fontSize: 16, color: '#8B949E' }} />
            ) : (
              <ExpandMoreIcon sx={{ fontSize: 16, color: '#8B949E' }} />
            )}
          </Box>
          <Collapse in={showOutput}>
            <Paper
              elevation={0}
              component="pre"
              sx={{
                m: 0,
                p: 2,
                bgcolor: '#0a0f14',
                borderRadius: '0 0 10px 10px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.82rem',
                color: '#3FB950',
                lineHeight: 1.7,
                overflow: 'auto',
                border: 'none',
                borderTop: '1px solid #30363d',
              }}
            >
              {section.output}
            </Paper>
          </Collapse>
          {!showOutput && (
            <Box sx={{ height: 10, bgcolor: '#0d1117', borderRadius: '0 0 10px 10px' }} />
          )}
        </>
      )}
    </Box>
  );
};

export default CodeBlock;
