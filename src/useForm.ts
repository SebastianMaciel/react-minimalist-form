import { useCallback, useState } from "react";

type FormValues<T> = {
  [K in keyof T]: T[K];
};

type Setters<T> = {
  [K in keyof T]: (value: T[K]) => void;
};

interface UseForm<T> {
  values: T;
  setters: Setters<T>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  resetForm: () => void;
  watch: <K extends keyof T>(key?: K) => T[K] | T;
}

export const useForm = <T extends Record<string, any>>(
  initialValues: T
): UseForm<T> => {
  const [values, setValues] = useState<FormValues<T>>(initialValues);

  const setters = Object.keys(initialValues).reduce((acc, key) => {
    acc[key as keyof T] = (value: any) => {
      setValues((prevValues) => ({ ...prevValues, [key]: value }));
    };
    return acc;
  }, {} as Setters<T>);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setValues(initialValues);
  };

  const watch = useCallback(
    <K extends keyof T>(key?: K): T[K] | T => {
      return key ? values[key] : values;
    },
    [values]
  );

  return {
    values,
    setters,
    handleChange,
    resetForm,
    watch,
  };
};
