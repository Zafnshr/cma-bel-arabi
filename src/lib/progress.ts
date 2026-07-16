/**
 * Utility for session-isolated progress tracking in LocalStorage.
 * The storage key dynamically uses the authenticated user's email.
 */

export function saveUserProgress(email: string, data: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`cma_progress_${email}`, data);
  } catch (error) {
    console.error("Error saving user progress to localStorage", error);
  }
}

export function getUserProgress(email: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(`cma_progress_${email}`);
  } catch (error) {
    console.error("Error loading user progress from localStorage", error);
    return null;
  }
}

export function clearUserProgress(email: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`cma_progress_${email}`);
}
