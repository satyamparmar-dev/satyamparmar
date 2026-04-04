import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Learn from '../pages/Learn';
import Progress from '../pages/Progress';
import Quiz from '../pages/Quiz';
import Roadmap from '../pages/Roadmap';
import Bookmarks from '../pages/Bookmarks';
import Settings from '../pages/Settings';
import ScenarioDrill from '../pages/ScenarioDrill';
import EmailLoginRoute from '../pages/EmailLoginRoute';
import { RouteErrorBoundary } from '../components/RouteErrorBoundary';

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<EmailLoginRoute />} />
    <Route path="/" element={<Dashboard />} />
    <Route
      path="/learn/:dayNumber"
      element={
        <RouteErrorBoundary fallbackMessage="This day failed to load — the content file may be missing.">
          <Learn />
        </RouteErrorBoundary>
      }
    />
    <Route
      path="/scenarios"
      element={
        <RouteErrorBoundary fallbackMessage="Scenario drill failed to load.">
          <ScenarioDrill />
        </RouteErrorBoundary>
      }
    />
    <Route path="/progress" element={<Progress />} />
    <Route
      path="/quiz"
      element={
        <RouteErrorBoundary fallbackMessage="Quiz failed to load.">
          <Quiz />
        </RouteErrorBoundary>
      }
    />
    <Route path="/roadmap" element={<Roadmap />} />
    <Route path="/bookmarks" element={<Bookmarks />} />
    <Route path="/settings" element={<Settings />} />
  </Routes>
);

export default AppRoutes;
