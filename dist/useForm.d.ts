type Setters<T> = {
    [K in keyof T]: (value: T[K]) => void;
};
export type ValidationRules<T> = {
    [K in keyof T]?: (value: T[K], values: T) => string | null | Promise<string | null>;
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
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleSubmit: (cb: () => void | Promise<void>) => (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
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
export declare const useForm: <T extends Record<string, any>>(initialValues: T, validationRules?: ValidationRules<T>, config?: UseFormConfig) => UseForm<T>;
export {};
