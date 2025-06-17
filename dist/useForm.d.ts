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
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    resetForm: () => void;
    validate: () => boolean;
    watch: <K extends keyof T>(key?: K) => T[K] | T;
}
export declare const useForm: <T extends Record<string, any>>(initialValues: T, validationRules?: ValidationRules<T>) => UseForm<T>;
export {};
