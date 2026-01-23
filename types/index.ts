export type Verdict = 'AC' | 'WA' | 'TLE' | 'RE' | 'CE' | 'Pending';

export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  rank_points: number;
}

export interface Problem {
  id: string;
  title: string;
  statement: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  sample_input: string;
  sample_output: string;
  time_limit: number; // in seconds
  memory_limit: number; // in MB
  tags: string[];
}

export interface Submission {
  id: string;
  user_id: string;
  problem_id: string;
  contest_id?: string;
  code: string;
  language: string;
  status: Verdict;
  verdict?: Verdict; // Supporting both naming conventions in current codebase
  runtime: number;
  memory: number;
  score: number;
  created_at: string;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  registration_start_time?: string;
  registration_end_time?: string;
  problems: string[]; // Array of problem IDs
  max_participants: number;
}
