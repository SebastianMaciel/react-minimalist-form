import { useCallback, useState } from "react";
export const useForm = (initialValues, validationRules) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
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
        setErrors({});
    };
    const validate = useCallback(() => {
        if (!validationRules) {
            return true;
        }
        const newErrors = {};
        Object.keys(validationRules).forEach((key) => {
            const rule = validationRules[key];
            if (rule) {
                const error = rule(values[key], values);
                if (error) {
                    newErrors[key] = error;
                }
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [validationRules, values]);
    const watch = useCallback((key) => {
        return key ? values[key] : values;
    }, [values]);
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
