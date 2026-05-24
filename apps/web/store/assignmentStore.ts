import { create } from 'zustand';

export interface QuestionType {
  id: string;
  type: string;
  count: number;
  marks: number;
}

export interface Assignment {
  id: string;
  subject: string;
  instructions: string;
  dueDate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  questionTypes: QuestionType[];
  totalQuestions: number;
  totalMarks: number;
  createdAt: string;
  generatedPaper?: any;
  fileContent?: string;
  fileType?: string;
  schoolName?: string;
  className?: string;
  location?: string;
}

interface AssignmentState {
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
  addAssignment: (assignment: Assignment) => void;
  setAssignments: (assignments: Assignment[]) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  fetchAssignments: () => Promise<void>;
  fetchAssignmentById: (id: string) => Promise<Assignment | null>;
  regenerateQuestion: (assignmentId: string, questionId: string) => Promise<boolean>;
  regenerateFullAssignment: (id: string, instructions?: string) => Promise<boolean>;
  deleteAssignment: (id: string) => Promise<boolean>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  assignments: [],
  loading: false,
  error: null,
  addAssignment: (assignment) =>
    set((state) => ({ assignments: [assignment, ...state.assignments] })),
  setAssignments: (assignments) => set({ assignments }),
  updateAssignment: (id, updates) =>
    set((state) => ({
      assignments: state.assignments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),
  fetchAssignments: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/assignments`);
      const data = await response.json();
      if (data.success) {
        const mappedAssignments = data.assignments.map((a: any) => ({
          ...a,
          id: a._id
        }));
        set({ assignments: mappedAssignments, loading: false });
      } else {
        set({ error: data.message || 'Failed to fetch assignments', loading: false });
      }
    } catch (err) {
      set({ error: 'An error occurred while fetching assignments', loading: false });
    }
  },
  fetchAssignmentById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/assignments/${id}`);
      const data = await response.json();
      if (data.success) {
        const assignment = { ...data.assignment, id: data.assignment._id };
        set((state) => ({
          assignments: state.assignments.find(a => a.id === id) 
            ? state.assignments.map(a => a.id === id ? assignment : a)
            : [assignment, ...state.assignments],
          loading: false 
        }));
        return assignment;
      } else {
        set({ error: data.message || 'Assignment not found', loading: false });
        return null;
      }
    } catch (err) {
      set({ error: 'An error occurred while fetching assignment', loading: false });
      return null;
    }
  },
  regenerateQuestion: async (assignmentId: string, questionId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/questions/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, questionId }),
      });
      const data = await response.json();
      if (data.success) {
        const assignment = get().assignments.find(a => a.id === assignmentId);
        if (assignment && assignment.generatedPaper) {
          const updatedSections = assignment.generatedPaper.sections.map((section: any) => ({
            ...section,
            questions: section.questions.map((q: any) => 
              q.id === questionId ? data.question : q
            )
          }));
          
          const updatedAssignment = {
            ...assignment,
            generatedPaper: {
              ...assignment.generatedPaper,
              sections: updatedSections
            }
          };
          
          get().updateAssignment(assignmentId, updatedAssignment);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Regeneration failed:', err);
      return false;
    }
  },
  regenerateFullAssignment: async (id: string, instructions?: string) => {
    try {
      const response = await fetch(`${API_URL}/api/assignments/${id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructions }),
      });
      const data = await response.json();
      if (data.success) {
        set((state) => ({
          assignments: state.assignments.map((a) => 
            a.id === id ? { ...a, status: 'processing', generatedPaper: undefined } : a
          ),
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Full regeneration failed:', err);
      return false;
    }
  },
  deleteAssignment: async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/assignments/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        set((state) => ({
          assignments: state.assignments.filter((a) => a.id !== id),
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete assignment:', err);
      return false;
    }
  },
}));
