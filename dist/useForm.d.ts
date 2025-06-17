type Setters<T> = {
    [K in keyof T]: (value: T[K]) => void;
};
export type ValidationRules<T> = {
    [K in keyof T]?: (value: T[K], values: T) => string | null | Promise<string | null>;
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
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleSubmit: (cb: () => void | Promise<void>) => (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    resetForm: () => void;
    validate: () => Promise<boolean>;
    watch: <K extends keyof T>(key?: K) => T[K] | T;
}
export declare const useForm: <T extends Record<string, any>>(initialValues: T, validationRules?: ValidationRules<T>) => UseForm<T>;
export {};
