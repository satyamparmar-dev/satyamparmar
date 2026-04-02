import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CodeIcon from '@mui/icons-material/Code';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { DiagramSection } from '../types';
import { getPlantUMLUrl } from '../utils/plantuml';

interface Props {
  section: DiagramSection;
}

const DiagramBlock: React.FC<Props> = ({ section }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [showSource, setShowSource] = useState(false);

  const svgUrl = getPlantUMLUrl(section.plantuml, 'svg');
  const pngUrl = getPlantUMLUrl(section.plantuml, 'png');

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [section.plantuml]);

  return (
    <Box mb={3}>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {section.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {section.diagramType} diagram
            </Typography>
          </Box>
          <Box display="flex" gap={0.5}>
            <Tooltip title="View source">
              <IconButton
                size="small"
                onClick={() => setShowSource(!showSource)}
                color={showSource ? 'primary' : 'default'}
              >
                <CodeIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open in new tab">
              <IconButton
                size="small"
                component="a"
                href={pngUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <OpenInNewIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Description */}
        {section.description && (
          <Box px={2} py={1} sx={{ bgcolor: 'action.hover' }}>
            <Typography variant="caption" color="text.secondary">
              {section.description}
            </Typography>
          </Box>
        )}

        {/* Diagram */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 200,
            p: 2,
            bgcolor: '#ffffff',
            position: 'relative',
          }}
        >
          {!loaded && !error && (
            <Box position="absolute" display="flex" flexDirection="column" alignItems="center" gap={1}>
              <CircularProgress size={32} />
              <Typography variant="caption" color="text.secondary">
                Rendering diagram...
              </Typography>
            </Box>
          )}
          {error && (
            <Box textAlign="center">
              <Typography variant="body2" color="error" gutterBottom>
                Failed to load diagram
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Check PlantUML source syntax
              </Typography>
            </Box>
          )}
          <Box
            component="img"
            src={svgUrl}
            alt={section.title}
            onLoad={() => setLoaded(true)}
            onError={() => { setError(true); setLoaded(true); }}
            sx={{
              maxWidth: '100%',
              maxHeight: 480,
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />
        </Box>

        {/* PlantUML Source */}
        <Collapse in={showSource}>
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            <Box
              sx={{
                px: 2,
                py: 0.75,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#1c2128',
                cursor: 'pointer',
              }}
              onClick={() => setShowSource(!showSource)}
            >
              <Typography variant="caption" sx={{ color: '#58A6FF', fontWeight: 600 }}>
                PlantUML Source
              </Typography>
              {showSource ? (
                <ExpandLessIcon sx={{ fontSize: 16, color: '#8B949E' }} />
              ) : (
                <ExpandMoreIcon sx={{ fontSize: 16, color: '#8B949E' }} />
              )}
            </Box>
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2,
                bgcolor: '#0d1117',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.78rem',
                color: '#E6EDF3',
                overflow: 'auto',
                maxHeight: 300,
                lineHeight: 1.6,
              }}
            >
              {section.plantuml}
            </Box>
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
};

export default DiagramBlock;
