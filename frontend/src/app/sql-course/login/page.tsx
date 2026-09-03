import { Metadata } from 'next';
import SqlCourseLoginClient from '@/components/sql-course/SqlCourseLoginClient';

export const metadata: Metadata = {
  title: 'Participant Login | SQL Interview Mastery | SyntaxFlow',
  description: 'Log in to your SQL Placement Masterclass dashboard to track your progress across all 9 levels.',
};

export default function SqlCourseLoginPage() {
  return <SqlCourseLoginClient />;
}
