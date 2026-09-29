import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from './supabase';
import { Task } from '../types';

const STORAGE_KEY_PREFIX = '@finance_tasks_';

const getTodayIso = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getRelativeDateIso = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDefaultSeedTasks = (userId?: string): Task[] => [
  {
    id: 'task-hero-focus',
    user_id: userId,
    title: 'Design New Landing Page',
    description: 'Finalize mobile layout, hero illustration, and typography tokens.',
    due_date: getTodayIso(),
    completed: false,
    progress: 70,
    priority: 'high',
    category: 'Design',
  },
  {
    id: 'task-budget-review',
    user_id: userId,
    title: 'Review Monthly Budget & Cashflow',
    description: 'Compare actual expenses with monthly budget targets.',
    due_date: getTodayIso(),
    completed: false,
    progress: 45,
    priority: 'medium',
    category: 'Finance',
  },
  {
    id: 'task-tax-audit',
    user_id: userId,
    title: 'Audit Q3 Tax Submissions',
    description: 'Verify all deduction receipts and submit declaration.',
    due_date: getRelativeDateIso(1),
    completed: false,
    progress: 25,
    priority: 'high',
    category: 'Finance',
  },
  {
    id: 'task-cloud-bill',
    user_id: userId,
    title: 'Pay Cloud Infrastructure Bill',
    description: 'Server & Database hosting renewal for current billing cycle.',
    due_date: getRelativeDateIso(2),
    completed: true,
    progress: 100,
    priority: 'medium',
    category: 'DevOps',
  },
  {
    id: 'task-portfolio-update',
    user_id: userId,
    title: 'Rebalance Investment Portfolio',
    description: 'Allocate monthly surplus into index funds & treasury bonds.',
    due_date: getRelativeDateIso(3),
    completed: false,
    progress: 10,
    priority: 'low',
    category: 'Investments',
  },
];

class TaskService {
  private getStorageKey(userId?: string): string {
    return `${STORAGE_KEY_PREFIX}${userId || 'guest'}`;
  }

  /**
   * Fetch all tasks for a user, checking Supabase first with local cache fallback
   */
  async getTasks(userId?: string): Promise<Task[]> {
    const storageKey = this.getStorageKey(userId);

    // 1. Try Supabase if configured and user is authenticated
    if (isSupabaseConfigured() && userId) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('due_date', { ascending: true })
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const liveTasks: Task[] = data.map((t: any) => ({
            id: t.id,
            user_id: t.user_id,
            title: t.title,
            description: t.description || undefined,
            due_date: t.due_date || getTodayIso(),
            completed: Boolean(t.completed),
            progress: Number(t.progress) || 0,
            priority: t.priority || 'medium',
            category: t.category || 'Work',
            created_at: t.created_at,
            updated_at: t.updated_at,
          }));

          // Cache locally
          await AsyncStorage.setItem(storageKey, JSON.stringify(liveTasks));
          return liveTasks;
        }
      } catch (err) {
        // Fall back to local cache if table doesn't exist yet or network issue
        console.warn('TaskService Supabase fetch notice:', err);
      }
    }

    // 2. Local cache fallback
    try {
      const cached = await AsyncStorage.getItem(storageKey);
      if (cached) {
        const parsed: Task[] = JSON.parse(cached);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (cacheErr) {
      console.warn('TaskService cache read notice:', cacheErr);
    }

    // 3. Seed default tasks
    const seed = getDefaultSeedTasks(userId);
    await AsyncStorage.setItem(storageKey, JSON.stringify(seed));

    // Also attempt seeding to Supabase if table exists
    if (isSupabaseConfigured() && userId) {
      try {
        const toInsert = seed.map((s) => ({
          user_id: userId,
          title: s.title,
          description: s.description,
          due_date: s.due_date,
          completed: s.completed,
          progress: s.progress,
          priority: s.priority,
          category: s.category,
        }));
        await supabase.from('tasks').insert(toInsert);
      } catch {
        // Ignore table missing notice
      }
    }

    return seed;
  }

  /**
   * Create a new task
   */
  async createTask(userId: string | undefined, taskData: Omit<Task, 'id'>): Promise<Task> {
    const storageKey = this.getStorageKey(userId);
    const existing = await this.getTasks(userId);

    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      title: taskData.title,
      description: taskData.description,
      due_date: taskData.due_date || getTodayIso(),
      completed: taskData.completed || false,
      progress: taskData.progress ?? 0,
      priority: taskData.priority || 'medium',
      category: taskData.category || 'General',
      created_at: new Date().toISOString(),
    };

    // 1. Try Supabase insert
    if (isSupabaseConfigured() && userId) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert([
            {
              user_id: userId,
              title: newTask.title,
              description: newTask.description,
              due_date: newTask.due_date,
              completed: newTask.completed,
              progress: newTask.progress,
              priority: newTask.priority,
              category: newTask.category,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          newTask.id = data.id;
        }
      } catch (err) {
        console.warn('TaskService Supabase insert notice:', err);
      }
    }

    const updated = [newTask, ...existing];
    await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
    return newTask;
  }

  /**
   * Update an existing task
   */
  async updateTask(
    userId: string | undefined,
    taskId: string,
    updates: Partial<Task>
  ): Promise<Task> {
    const storageKey = this.getStorageKey(userId);
    const existing = await this.getTasks(userId);
    const index = existing.findIndex((t) => t.id === taskId);

    if (index === -1) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    const updatedTask: Task = {
      ...existing[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // If marked completed, set progress to 100
    if (updates.completed === true && updates.progress === undefined) {
      updatedTask.progress = 100;
    } else if (updates.completed === false && existing[index].completed) {
      if (updatedTask.progress === 100) updatedTask.progress = 50;
    }

    existing[index] = updatedTask;
    await AsyncStorage.setItem(storageKey, JSON.stringify(existing));

    // Try Supabase update
    if (isSupabaseConfigured() && userId && !taskId.startsWith('task_') && !taskId.startsWith('task-')) {
      try {
        await supabase
          .from('tasks')
          .update({
            title: updatedTask.title,
            description: updatedTask.description,
            due_date: updatedTask.due_date,
            completed: updatedTask.completed,
            progress: updatedTask.progress,
            priority: updatedTask.priority,
            category: updatedTask.category,
            updated_at: updatedTask.updated_at,
          })
          .eq('id', taskId);
      } catch (err) {
        console.warn('TaskService Supabase update notice:', err);
      }
    }

    return updatedTask;
  }

  /**
   * Toggle task completion
   */
  async toggleTask(userId: string | undefined, taskId: string): Promise<Task> {
    const tasks = await this.getTasks(userId);
    const target = tasks.find((t) => t.id === taskId);
    if (!target) throw new Error('Task not found');

    const nextCompleted = !target.completed;
    return this.updateTask(userId, taskId, {
      completed: nextCompleted,
      progress: nextCompleted ? 100 : target.progress === 100 ? 50 : target.progress,
    });
  }

  /**
   * Delete a task
   */
  async deleteTask(userId: string | undefined, taskId: string): Promise<boolean> {
    const storageKey = this.getStorageKey(userId);
    const existing = await this.getTasks(userId);
    const filtered = existing.filter((t) => t.id !== taskId);

    await AsyncStorage.setItem(storageKey, JSON.stringify(filtered));

    if (isSupabaseConfigured() && userId && !taskId.startsWith('task_') && !taskId.startsWith('task-')) {
      try {
        await supabase.from('tasks').delete().eq('id', taskId);
      } catch (err) {
        console.warn('TaskService Supabase delete notice:', err);
      }
    }

    return true;
  }

  /**
   * Get the current active focus task for the Home hero card.
   * Priority: uncompleted task with highest priority due today, or next uncompleted task.
   */
  async getTodaysFocus(userId?: string): Promise<Task | null> {
    const tasks = await this.getTasks(userId);
    const today = getTodayIso();

    // 1. Uncompleted tasks due today
    const dueTodayUncompleted = tasks.filter((t) => !t.completed && t.due_date === today);
    if (dueTodayUncompleted.length > 0) {
      // Sort by priority (high > medium > low)
      const priorityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };
      dueTodayUncompleted.sort(
        (a, b) => (priorityWeight[b.priority || 'medium'] || 2) - (priorityWeight[a.priority || 'medium'] || 2)
      );
      return dueTodayUncompleted[0];
    }

    // 2. Any uncompleted task
    const anyUncompleted = tasks.filter((t) => !t.completed);
    if (anyUncompleted.length > 0) {
      return anyUncompleted[0];
    }

    // 3. Fallback to first task
    return tasks[0] || null;
  }
}

export const taskService = new TaskService();
