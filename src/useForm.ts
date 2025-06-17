import { useCallback, useState } from "react";

type FormValues<T> = {
  [K in keyof T]: T[K];
};

type Setters<T> = {
  [K in keyof T]: (value: T[K]) => void;
};

export type ValidationRules<T> = {
  [K in keyof T]?: (value: T[K], values: T) => string | null;
};

type Errors<T> = Partial<Record<keyof T, string>>;

interface UseForm<T> {
  values: T;
  setters: Setters<T>;
  errors: Errors<T>;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  resetForm: () => void;
  validate: () => boolean;
  watch: <K extends keyof T>(key?: K) => T[K] | T;
}

export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules?: ValidationRules<T>
): UseForm<T> => {
  const [values, setValues] = useState<FormValues<T>>(initialValues);
  const [errors, setErrors] = useState<Errors<T>>({});

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

    setValues((prevValues) => {
      const path = name
        .replace(/\[(\w+)\]/g, ".$1")
        .split(".")
        .filter(Boolean)
        .map((seg) => (/^\d+$/.test(seg) ? parseInt(seg, 10) : seg));

      const setNestedValue = (
        obj: any,
        keys: (string | number)[],
        val: any,
      ): any => {
        if (!keys.length) return val;

        const [first, ...rest] = keys;

        if (Array.isArray(obj)) {
          const arr = [...obj];
          arr[first as number] = setNestedValue(
            arr[first as number] ?? (typeof rest[0] === "number" ? [] : {}),
            rest,
            val,
          );
          return arr;
        }

        return {
          ...obj,
          [first]: setNestedValue(
            obj?.[first] ?? (typeof rest[0] === "number" ? [] : {}),
            rest,
            val,
          ),
        };
      };

      return setNestedValue(prevValues, path, newValue);
    });
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  const validate = useCallback((): boolean => {
    if (!validationRules) {
      return true;
    }

    const newErrors: Errors<T> = {};

    Object.keys(validationRules).forEach((key) => {
      const rule = validationRules[key as keyof T];
      if (rule) {
        const error = rule(values[key as keyof T], values);
        if (error) {
          newErrors[key as keyof T] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validationRules, values]);

  const watch = useCallback(
    <K extends keyof T>(key?: K): T[K] | T => {
      return key ? values[key] : values;
    },
    [values]
  );

  return {
    values,
    setters,
    errors,
    handleChange,
    resetForm,
    validate,
    watch,
  };
};
