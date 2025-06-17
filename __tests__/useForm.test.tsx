import { renderHook, act } from '@testing-library/react-hooks';
import { useForm } from '../src';

describe('useForm', () => {
  it('initializes with given values', () => {
    const { result } = renderHook(() => useForm({ name: 'foo' }));
    expect(result.current.values.name).toBe('foo');
  });

  it('updates values and tracks dirty/touched', () => {
    const { result } = renderHook(() => useForm({ name: '' }));

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'bar', type: 'text' }
      } as any);
    });

    expect(result.current.values.name).toBe('bar');
    expect(result.current.dirtyFields.name).toBe(true);
    expect(result.current.isDirty).toBe(true);
    expect(result.current.touchedFields.name).toBe(true);
    expect(result.current.isTouched).toBe(true);
  });

  it('runs validation rules', async () => {
    const { result } = renderHook(() =>
      useForm({ name: '' }, { name: (v) => (!v ? 'Required' : null) })
    );

    await act(async () => {
      await result.current.validate();
    });

    expect(result.current.errors.name).toBe('Required');
    expect(result.current.isValid).toBe(false);
  });
});

