import { useCallback, useState } from "react";
export const useForm = (initialValues) => {
    const [values, setValues] = useState(initialValues);
    const setters = Object.keys(initialValues).reduce((acc, key) => {
        acc[key] = (value) => {
            setValues((prevValues) => (Object.assign(Object.assign({}, prevValues), { [key]: value })));
        };
        return acc;
    }, {});
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const newValue = type === "checkbox" && e.target instanceof HTMLInputElement
            ? e.target.checked
            : value;
        setValues((prevValues) => (Object.assign(Object.assign({}, prevValues), { [name]: newValue })));
    };
    const resetForm = () => {
        setValues(initialValues);
    };
    const watch = useCallback((key) => {
        return key ? values[key] : values;
    }, [values]);
    return {
        values,
        setters,
        handleChange,
        resetForm,
        watch,
    };
};
