import React from 'react';
import { Outlet } from 'react-router-dom';

export interface CourseAccessGuardProps {
  courseId: string;
  children?: React.ReactNode;
}

const CourseAccessGuard: React.FC<CourseAccessGuardProps> = ({ children }) => {
  return children != null ? <>{children}</> : <Outlet />;
};

export default CourseAccessGuard;
