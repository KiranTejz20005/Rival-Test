import { renderHook, waitFor } from '@testing-library/react';
import { useTasks } from '../useTasks';
import api from '../../lib/api';

jest.mock('../../lib/api');

describe('useTasks', () => {
  it('fetches tasks on mount', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: {
        data: {
          tasks: [{ id: '1', title: 'Test Task' }],
          total: 1
        }
      }
    });

    const { result } = renderHook(() => useTasks());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('Test Task');
    expect(result.current.total).toBe(1);
  });
});
