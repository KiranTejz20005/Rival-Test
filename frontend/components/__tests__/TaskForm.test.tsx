import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TaskForm from '../TaskForm';

describe('TaskForm', () => {
  it('renders form with all fields', () => {
    render(<TaskForm onSubmit={jest.fn()} onClose={jest.fn()} />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });
  
  it('shows validation error for empty title', async () => {
    render(<TaskForm onSubmit={jest.fn()} onClose={jest.fn()} />);
    const submit = screen.getByRole('button', { name: /create task/i });
    await userEvent.click(submit);
    
    expect(await screen.findByText(/title required/i)).toBeInTheDocument();
  });
  
  it('calls onSubmit with valid data', async () => {
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} onClose={jest.fn()} />);
    
    await userEvent.type(screen.getByLabelText(/title/i), 'Test task');
    await userEvent.click(screen.getByRole('button', { name: /create task/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test task'
      }));
    });
  });
});
