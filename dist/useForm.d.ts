type Setters<T> = {
    [K in keyof T]: (value: T[K]) => void;
};
interface UseForm<T> {
    values: T;
    setters: Setters<T>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    resetForm: () => void;
    watch: <K extends keyof T>(key?: K) => T[K] | T;
}
export declare const useForm: <T extends Record<string, any>>(initialValues: T) => UseForm<T>;
export {};
