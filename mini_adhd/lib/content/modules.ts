export interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: 'Focus' | 'Mindfulness' | 'Organization' | 'Wellbeing';
  duration: number; // minutes
  xpReward: number;
  content: string; // Markdown supported
}

export const modules: LearningModule[] = [
  {
    id: 'pomodoro-technique',
    title: 'The Pomodoro Technique',
    description: 'Master the art of focused work intervals.',
    category: 'Focus',
    duration: 10,
    xpReward: 100,
    content: `
# The Pomodoro Technique

The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. It uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks.

## How it works

1.  **Choose a task** you'd like to get done.
2.  **Set the Pomodoro** (timer) for 25 minutes.
3.  **Work on the task** until the Pomodoro rings.
4.  **Take a short break** (5 minutes).
5.  **Every 4 Pomodoros**, take a longer break (15-30 minutes).

## Why it works for ADHD

-   **Reduces friction**: 25 minutes feels manageable.
-   **Provides structure**: Clear start and end times.
-   **Regular breaks**: Prevents burnout and mental fatigue.
    `
  },
  {
    id: 'mindfulness-basics',
    title: 'Mindfulness 101',
    description: 'Simple breathing exercises to regain control.',
    category: 'Mindfulness',
    duration: 5,
    xpReward: 50,
    content: `
# Mindfulness Basics

Mindfulness is the psychological process of bringing one's attention to experiences occurring in the present moment without judgment.

## Box Breathing

Use this technique when you feel overwhelmed:

1.  **Inhale** slowly for 4 seconds.
2.  **Hold** your breath for 4 seconds.
3.  **Exhale** slowly for 4 seconds.
4.  **Hold** your breath for 4 seconds.

Repeat this cycle 4 times.
    `
  },
  {
    id: 'digital-declutter',
    title: 'Digital Declutter',
    description: 'Organize your digital workspace for better focus.',
    category: 'Organization',
    duration: 15,
    xpReward: 150,
    content: `
# Digital Decluttering

A messy digital environment can be just as distracting as a messy desk.

## Steps to Declutter

1.  **Desktop Zero**: Clear all icons from your desktop.
2.  **Notification Audit**: Turn off all non-essential notifications.
3.  **Tab Management**: Use tab suspenders or bookmark managers to keep your browser clean.
4.  **Email Inbox**: Unsubscribe from 5 newsletters today that you never read.

## Maintenance

Set a reminder every Friday afternoon to do a 10-minute digital cleanup.
    `
  },
   {
    id: 'eat-that-frog',
    title: 'Eat That Frog!',
    description: 'Tackle your hardest task first.',
    category: 'Focus',
    duration: 8,
    xpReward: 80,
    content: `
# Eat That Frog!

"If it's your job to eat a frog, it's best to do it first thing in the morning. And If it's your job to eat two frogs, it's best to eat the biggest one first." - Mark Twain

## The Concept

Your "frog" is your biggest, most important task, the one you are most likely to procrastinate on if you don't do something about it.

## The Rule

1.  Identify your frog. (The hardest/most important task).
2.  Eat it first thing in the morning.
3.  Don't think about it too long, just do it.

Completing your hardest task first gives you a massive dopamine boost and momentum for the rest of the day.
    `
  }
];
