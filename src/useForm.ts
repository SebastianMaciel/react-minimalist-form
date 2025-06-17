import { useCallback, useState, useRef, useEffect } from "react";

type FormValues<T> = T & Record<string, any>;

type Setters<T> = {
  [K in keyof T]: (value: T[K]) => void;
};

export type ValidationRules<T> = {
  [K in keyof T]?: (
    value: T[K],
    values: T
  ) => string | null | Promise<string | null>;
} & {
  [path: string]: (value: any, values: any) => string | null | Promise<string | null>;
};

type Errors<T> = Record<string, string>;

type DirtyFields<T> = Record<string, boolean>;
type TouchedFields<T> = Record<string, boolean>;

export interface UseFormConfig {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseForm<T> {
  values: T & Record<string, any>;
  setters: Setters<T>;
  errors: Errors<T>;
  isValid: boolean;
  isSubmitting: boolean;
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
  resetForm: (nextInitial?: T) => void;
  resetField: (path: string) => void;
  clearErrors: (path?: string) => void;
  validate: () => Promise<boolean>;
  watch: {
    (): T;
    <K extends keyof T>(key: K): T[K];
    (path: string): any;
  };
  setFieldValue: (path: string, value: any) => void;
  registerField: (path: string, initialValue: any) => void;
}

export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules?: ValidationRules<T>,
  config: UseFormConfig = {}
): UseForm<T> => {
  const { validateOnChange = true, validateOnBlur = true } = config;
  const initialRef = useRef(initialValues);
  const [values, setValues] = useState<FormValues<T>>(initialRef.current);
  const [errors, setErrors] = useState<Errors<T>>({});
  const [isValid, setIsValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validationRulesRef = useRef<ValidationRules<T>>(
    (validationRules ?? {}) as ValidationRules<T>
  );
  const initialDirty = Object.keys(initialRef.current).reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as DirtyFields<T>);
  const [dirtyFields, setDirtyFields] = useState<DirtyFields<T>>(initialDirty);
  const initialTouched = Object.keys(initialRef.current).reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as TouchedFields<T>);
  const [touchedFields, setTouchedFields] = useState<TouchedFields<T>>(initialTouched);
  const isDirty = Object.keys(initialRef.current).some((k) => dirtyFields[k]);
  const isTouched = Object.keys(initialRef.current).some((k) => touchedFields[k]);

  const setters = Object.keys(initialRef.current).reduce((acc, key) => {
    acc[key as keyof T] = (value: any) => {
      setValues((prevValues) => {
        const newValues = { ...prevValues, [key]: value };
        setDirtyFields((d) => ({
          ...d,
          [key]:
            newValues[key as keyof T] !== initialRef.current[key as keyof T],
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


    if (
      type === "radio" &&
      e.target instanceof HTMLInputElement &&
      !e.target.checked
    ) {
      return;
    }

    let newValue: any;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      newValue = e.target.checked;
    } else if (type === "number" && e.target instanceof HTMLInputElement) {
      newValue = e.target.valueAsNumber;
    } else if (type === "file" && e.target instanceof HTMLInputElement) {
      newValue = e.target.files;
    } else if (
      e.target instanceof HTMLSelectElement &&
      e.target.multiple
    ) {
      newValue = Array.from(e.target.selectedOptions).map((o) => o.value);
    } else {
      newValue = value;
    }

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
      const topKey = path[0] as string;
      setDirtyFields((d) => ({
        ...d,
        [topKey]: (updated as any)[topKey] !== (initialRef.current as any)[topKey],
      }));
      setTouchedFields((t) => ({
        ...t,
        [topKey]: true,
      }));
      return updated;
    });
  };

  const setFieldValue = useCallback(
    (pathString: string, newValue: any) => {
      setValues((prevValues) => {
        const path = pathString
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
        const topKey = path[0] as string;
        setDirtyFields((d) => ({
          ...d,
          [topKey]: (updated as any)[topKey] !== (initialRef.current as any)[topKey],
        }));
        setTouchedFields((t) => ({
          ...t,
          [topKey]: true,
        }));
      return updated;
    });
  },
  []
  );

  const registerField = useCallback(
    (pathString: string, initialValue: any) => {
      const path = pathString
        .replace(/\[(\w+)\]/g, ".$1")
        .split(".")
        .filter(Boolean)
        .map((seg) => (/^\d+$/.test(seg) ? parseInt(seg, 10) : seg));

      const setNested = (
        obj: any,
        keys: (string | number)[],
        val: any
      ): any => {
        if (!keys.length) return val;
        const [first, ...rest] = keys;
        if (Array.isArray(obj)) {
          const arr = [...obj];
          arr[first as number] = setNested(
            arr[first as number] ?? (typeof rest[0] === "number" ? [] : {}),
            rest,
            val
          );
          return arr;
        }
        return {
          ...obj,
          [first]: setNested(
            obj?.[first] ?? (typeof rest[0] === "number" ? [] : {}),
            rest,
            val
          )
        };
      };

      setValues((prev) => setNested(prev, path, initialValue));
      initialRef.current = setNested(initialRef.current, path, initialValue);
      setDirtyFields((d) => ({ ...d, [pathString]: false }));
      setTouchedFields((t) => ({ ...t, [pathString]: false }));
      if (!(pathString in validationRulesRef.current)) {
        (validationRulesRef.current as any)[pathString] = undefined as any;
      }
    },
    []
  );

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const path = e.target.name
      .replace(/\[(\w+)\]/g, ".$1")
      .split(".")
      .filter(Boolean);
    const topKey = path[0] as string;
    setTouchedFields((t) => ({
      ...t,
      [topKey]: true,
    }));
  };

  const resetForm = (nextInitial?: T) => {
    if (nextInitial) {
      initialRef.current = nextInitial;
    }
    const base = nextInitial ?? initialRef.current;
    setValues(base);
    setErrors({});
    setIsValid(true);
    const newDirty = Object.keys(initialRef.current).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as DirtyFields<T>);
    setDirtyFields(newDirty);
    const newTouched = Object.keys(initialRef.current).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as TouchedFields<T>);
    setTouchedFields(newTouched);
  };

  const resetField = (pathString: string) => {
    const path = pathString
      .replace(/\[(\w+)\]/g, ".$1")
      .split(".")
      .filter(Boolean)
      .map((seg) => (/^\d+$/.test(seg) ? parseInt(seg, 10) : seg));
    const topKey = path[0] as string;

    const getNested = (obj: any, keys: (string | number)[]): any =>
      keys.reduce<any>((acc, key) => acc?.[key], obj);
    const initialVal = getNested(initialRef.current, path);

    setValues((prev) => {
      const setNested = (
        obj: any,
        keys: (string | number)[],
        val: any,
      ): any => {
        if (!keys.length) return val;
        const [first, ...rest] = keys;
        if (Array.isArray(obj)) {
          const arr = [...obj];
          arr[first as number] = setNested(
            arr[first as number] ?? (typeof rest[0] === "number" ? [] : {}),
            rest,
            val,
          );
          return arr;
        }
        return {
          ...obj,
          [first]: setNested(
            obj?.[first] ?? (typeof rest[0] === "number" ? [] : {}),
            rest,
            val,
          ),
        };
      };

      const updated = setNested(prev, path, initialVal);
      return updated;
    });

    setDirtyFields((d) => ({ ...d, [topKey]: false }));
    setTouchedFields((t) => ({ ...t, [topKey]: false }));
  };

  const clearErrors = (pathString?: string) => {
    if (!pathString) {
      setErrors({});
      return;
    }
    const key = pathString
      .replace(/\[(\w+)\]/g, ".$1")
      .split(".")[0];
    setErrors((e) => {
      const ne = { ...e };
      delete ne[key];
      return ne;
    });
  };

  const runValidation = useCallback(
    async (vals: T): Promise<boolean> => {
      if (!validationRulesRef.current || Object.keys(validationRulesRef.current).length === 0) {
        setIsValid(true);
        return true;
      }

      const newErrors: Errors<T> = {};

      await Promise.all(
        Object.keys(validationRulesRef.current).map(async (key) => {
          const rule = validationRulesRef.current[key];
          if (rule) {
            const error = await rule((vals as any)[key], vals);
            if (error) {
              newErrors[key] = error;
            }
          }
        })
      );

      setErrors(newErrors);
      const valid = Object.keys(newErrors).length === 0;
      setIsValid(valid);
      return valid;
    },
    [validationRulesRef]
  );

  const validate = useCallback(async (): Promise<boolean> => {
    return runValidation(values);
  }, [runValidation, values]);

  useEffect(() => {
    if (validateOnChange && validationRulesRef.current) {
      runValidation(values);
    }
  }, [values, validateOnChange, runValidation]);

  useEffect(() => {
    if (validateOnBlur && validationRulesRef.current) {
      runValidation(values);
    }
  }, [touchedFields, validateOnBlur, runValidation]);

  function watch(): T;
  function watch<K extends keyof T>(key: K): T[K];
  function watch(path: string): any;
  function watch(path?: keyof T | string): any {
    if (!path) {
      return values;
    }

    if (typeof path === "string" && (path.includes(".") || path.includes("["))) {
      const segments = path
        .replace(/\[(\w+)\]/g, ".$1")
        .split(".")
        .filter(Boolean)
        .map((seg) => (/^\d+$/.test(seg) ? parseInt(seg, 10) : seg));
      return segments.reduce<any>((acc, seg) => acc?.[seg], values);
    }

    return (values as any)[path];
  }

  const watchCallback = useCallback(watch, [values]) as {
    (): T;
    <K extends keyof T>(key: K): T[K];
    (path: string): any;
  };

  const handleSubmit = useCallback(
    (cb: () => void | Promise<void>) =>
      async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
          if (await validate()) {
            await cb();
          }
        } finally {
          setIsSubmitting(false);
        }
      },
    [validate]
  );

  return {
    values,
    setters,
    errors,
    isValid,
    isSubmitting,
    dirtyFields,
    isDirty,
    touchedFields,
    isTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    resetField,
    clearErrors,
    validate,
    watch: watchCallback,
    setFieldValue,
    registerField,
  };
};
