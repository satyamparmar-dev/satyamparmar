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
import LlmOverview from '../pages/LlmOverview';
import BlogIndex from '../pages/BlogIndex';
import BlogPost from '../pages/BlogPost';
import EmailLoginRoute from '../pages/EmailLoginRoute';
import { RouteErrorBoundary } from '../components/RouteErrorBoundary';
import ProHome from '../pages/pro/ProHome';
import ProOnboarding from '../pages/pro/ProOnboarding';
import ProPaths from '../pages/pro/ProPaths';
import ProPathDetail from '../pages/pro/ProPathDetail';
import ProLesson from '../pages/pro/ProLesson';
import ProProject from '../pages/pro/ProProject';
import Portfolio from '../pages/pro/Portfolio';
import InterviewPrep from '../pages/pro/InterviewPrep';
import NewsRoom from '../pages/pro/NewsRoom';
import ToolsReference from '../pages/pro/ToolsReference';
import ProTutor from '../pages/pro/ProTutor';
import Certifications from '../pages/pro/Certifications';

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
    <Route path="/llm" element={<LlmOverview />} />
    <Route path="/blog" element={<BlogIndex />} />
    <Route path="/blog/:slug" element={<BlogPost />} />
    <Route path="/roadmap" element={<Roadmap />} />
    <Route path="/bookmarks" element={<Bookmarks />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/pro" element={<ProHome />} />
    <Route path="/pro/onboarding" element={<ProOnboarding />} />
    <Route path="/pro/paths" element={<ProPaths />} />
    <Route path="/pro/paths/:pathId" element={<ProPathDetail />} />
    <Route path="/pro/paths/:pathId/week/:week" element={<ProPathDetail />} />
    <Route path="/pro/lesson/:lessonId" element={<ProLesson />} />
    <Route path="/pro/project/:projectId" element={<ProProject />} />
    <Route path="/pro/portfolio" element={<Portfolio />} />
    <Route path="/pro/interview-prep" element={<InterviewPrep />} />
    <Route path="/pro/interview-prep/:role" element={<InterviewPrep />} />
    <Route path="/pro/newsroom" element={<NewsRoom />} />
    <Route path="/pro/tools" element={<ToolsReference />} />
    <Route path="/pro/tutor" element={<ProTutor />} />
    <Route path="/pro/tutor/:lessonId" element={<ProTutor />} />
    <Route path="/pro/certifications" element={<Certifications />} />
  </Routes>
);

export default AppRoutes;
