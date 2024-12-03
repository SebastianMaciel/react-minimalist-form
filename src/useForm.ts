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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" && e.target instanceof HTMLInputElement
        ? e.target.checked
        : value;

    setValues((prevValues) => ({
      ...prevValues,
      [name]: newValue,
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
