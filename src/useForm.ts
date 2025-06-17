import { useCallback, useState } from "react";

type FormValues<T> = {
  [K in keyof T]: T[K];
};

type Setters<T> = {
  [K in keyof T]: (value: T[K]) => void;
};

export type ValidationRules<T> = {
  [K in keyof T]?: (
    value: T[K],
    values: T
  ) => string | null | Promise<string | null>;
};

type Errors<T> = Partial<Record<keyof T, string>>;

type DirtyFields<T> = Record<keyof T, boolean>;
type TouchedFields<T> = Record<keyof T, boolean>;

interface UseForm<T> {
  values: T;
  setters: Setters<T>;
  errors: Errors<T>;
  dirtyFields: DirtyFields<T>;
  isDirty: boolean;
  touchedFields: TouchedFields<T>;
  isTouched: boolean;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleBlur: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleSubmit: (
    cb: () => void | Promise<void>
  ) => (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  resetForm: () => void;
  validate: () => Promise<boolean>;
  watch: <K extends keyof T>(key?: K) => T[K] | T;
}

export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules?: ValidationRules<T>
): UseForm<T> => {
  const [values, setValues] = useState<FormValues<T>>(initialValues);
  const [errors, setErrors] = useState<Errors<T>>({});
  const initialDirty = Object.keys(initialValues).reduce((acc, key) => {
    acc[key as keyof T] = false;
    return acc;
  }, {} as DirtyFields<T>);
  const [dirtyFields, setDirtyFields] = useState<DirtyFields<T>>(initialDirty);
  const initialTouched = Object.keys(initialValues).reduce((acc, key) => {
    acc[key as keyof T] = false;
    return acc;
  }, {} as TouchedFields<T>);
  const [touchedFields, setTouchedFields] = useState<TouchedFields<T>>(initialTouched);
  const isDirty = Object.keys(initialValues).some(
    (k) => dirtyFields[k as keyof T]
  );
  const isTouched = Object.keys(initialValues).some(
    (k) => touchedFields[k as keyof T]
  );

  const setters = Object.keys(initialValues).reduce((acc, key) => {
    acc[key as keyof T] = (value: any) => {
      setValues((prevValues) => {
        const newValues = { ...prevValues, [key]: value };
        setDirtyFields((d) => ({
          ...d,
          [key]: newValues[key as keyof T] !== initialValues[key as keyof T],
        }));
        return newValues;
      });
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

      const updated = setNestedValue(prevValues, path, newValue);
      const topKey = path[0] as keyof T;
      setDirtyFields((d) => ({
        ...d,
        [topKey]: updated[topKey] !== initialValues[topKey],
      }));
      setTouchedFields((t) => ({
        ...t,
        [topKey]: true,
      }));
      return updated;
    });
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const path = e.target.name
      .replace(/\[(\w+)\]/g, ".$1")
      .split(".")
      .filter(Boolean);
    const topKey = path[0] as keyof T;
    setTouchedFields((t) => ({
      ...t,
      [topKey]: true,
    }));
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setDirtyFields(initialDirty);
    setTouchedFields(initialTouched);
  };

  const validate = useCallback(async (): Promise<boolean> => {
    if (!validationRules) {
      return true;
    }

    const newErrors: Errors<T> = {};

    await Promise.all(
      Object.keys(validationRules).map(async (key) => {
        const rule = validationRules[key as keyof T];
        if (rule) {
          const error = await rule(values[key as keyof T], values);
          if (error) {
            newErrors[key as keyof T] = error;
          }
        }
      })
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validationRules, values]);

  const watch = useCallback(
    <K extends keyof T>(key?: K): T[K] | T => {
      return key ? values[key] : values;
    },
    [values]
  );

  const handleSubmit = useCallback(
    (cb: () => void | Promise<void>) =>
      async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (await validate()) {
          await cb();
        }
      },
    [validate]
  );

  return {
    values,
    setters,
    errors,
    dirtyFields,
    isDirty,
    touchedFields,
    isTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    validate,
    watch,
  };
};
