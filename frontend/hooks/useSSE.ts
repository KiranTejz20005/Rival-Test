import { useEffect, useRef } from 'react';

export function useSSE(onEvent: (event: string, data: unknown) => void) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const url = `${baseUrl}/api/tasks/events?token=${encodeURIComponent(token)}`;

    const eventSource = new EventSource(url);

    eventSource.addEventListener('task_created', (e) => {
      try { onEventRef.current('task_created', JSON.parse(e.data)); } catch {}
    });

    eventSource.addEventListener('task_updated', (e) => {
      try { onEventRef.current('task_updated', JSON.parse(e.data)); } catch {}
    });

    eventSource.addEventListener('task_deleted', (e) => {
      try { onEventRef.current('task_deleted', JSON.parse(e.data)); } catch {}
    });

    eventSource.onerror = () => {};

    return () => {
      eventSource.close();
    };
  }, []);
}
