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

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/learn/:dayNumber" element={<Learn />} />
    <Route path="/scenarios" element={<ScenarioDrill />} />
    <Route path="/progress" element={<Progress />} />
    <Route path="/quiz" element={<Quiz />} />
    <Route path="/roadmap" element={<Roadmap />} />
    <Route path="/bookmarks" element={<Bookmarks />} />
    <Route path="/settings" element={<Settings />} />
  </Routes>
);

export default AppRoutes;
