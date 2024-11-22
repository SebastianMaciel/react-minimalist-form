"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useForm = void 0;
const react_1 = require("react");
const useForm = (initialValues) => {
    const [values, setValues] = (0, react_1.useState)(initialValues);
    const setters = Object.keys(initialValues).reduce((acc, key) => {
        acc[key] = (value) => {
            setValues((prevValues) => (Object.assign(Object.assign({}, prevValues), { [key]: value })));
        };
        return acc;
    }, {});
    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((prevValues) => (Object.assign(Object.assign({}, prevValues), { [name]: value })));
    };
    const resetForm = () => {
        setValues(initialValues);
    };
    const watch = (0, react_1.useCallback)((key) => {
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
exports.useForm = useForm;
