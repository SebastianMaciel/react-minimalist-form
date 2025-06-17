"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useForm = void 0;
const react_1 = require("react");
const useForm = (initialValues, validationRules, config = {}) => {
    const { validateOnChange = true, validateOnBlur = true } = config;
    const initialRef = (0, react_1.useRef)(initialValues);
    const [values, setValues] = (0, react_1.useState)(initialRef.current);
    const [errors, setErrors] = (0, react_1.useState)({});
    const [isValid, setIsValid] = (0, react_1.useState)(true);
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const initialDirty = Object.keys(initialRef.current).reduce((acc, key) => {
        acc[key] = false;
        return acc;
    }, {});
    const [dirtyFields, setDirtyFields] = (0, react_1.useState)(initialDirty);
    const initialTouched = Object.keys(initialRef.current).reduce((acc, key) => {
        acc[key] = false;
        return acc;
    }, {});
    const [touchedFields, setTouchedFields] = (0, react_1.useState)(initialTouched);
    const isDirty = Object.keys(initialRef.current).some((k) => dirtyFields[k]);
    const isTouched = Object.keys(initialRef.current).some((k) => touchedFields[k]);
    const setters = Object.keys(initialRef.current).reduce((acc, key) => {
        acc[key] = (value) => {
            setValues((prevValues) => {
                const newValues = Object.assign(Object.assign({}, prevValues), { [key]: value });
                setDirtyFields((d) => (Object.assign(Object.assign({}, d), { [key]: newValues[key] !== initialRef.current[key] })));
                return newValues;
            });
        };
        return acc;
    }, {});
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (type === "radio" &&
            e.target instanceof HTMLInputElement &&
            !e.target.checked) {
            return;
        }
        let newValue;
        if (type === "checkbox" && e.target instanceof HTMLInputElement) {
            newValue = e.target.checked;
        }
        else if (type === "number" && e.target instanceof HTMLInputElement) {
            newValue = e.target.valueAsNumber;
        }
        else if (type === "file" && e.target instanceof HTMLInputElement) {
            newValue = e.target.files;
        }
        else if (e.target instanceof HTMLSelectElement &&
            e.target.multiple) {
            newValue = Array.from(e.target.selectedOptions).map((o) => o.value);
        }
        else {
            newValue = value;
        }
        setValues((prevValues) => {
            const path = name
                .replace(/\[(\w+)\]/g, ".$1")
                .split(".")
                .filter(Boolean)
                .map((seg) => (/^\d+$/.test(seg) ? parseInt(seg, 10) : seg));
            const setNestedValue = (obj, keys, val) => {
                var _a, _b;
                if (!keys.length)
                    return val;
                const [first, ...rest] = keys;
                if (Array.isArray(obj)) {
                    const arr = [...obj];
                    arr[first] = setNestedValue((_a = arr[first]) !== null && _a !== void 0 ? _a : (typeof rest[0] === "number" ? [] : {}), rest, val);
                    return arr;
                }
                return Object.assign(Object.assign({}, obj), { [first]: setNestedValue((_b = obj === null || obj === void 0 ? void 0 : obj[first]) !== null && _b !== void 0 ? _b : (typeof rest[0] === "number" ? [] : {}), rest, val) });
            };
            const updated = setNestedValue(prevValues, path, newValue);
            const topKey = path[0];
            setDirtyFields((d) => (Object.assign(Object.assign({}, d), { [topKey]: updated[topKey] !== initialRef.current[topKey] })));
            setTouchedFields((t) => (Object.assign(Object.assign({}, t), { [topKey]: true })));
            return updated;
        });
    };
    const setFieldValue = (0, react_1.useCallback)((pathString, newValue) => {
        setValues((prevValues) => {
            const path = pathString
                .replace(/\[(\w+)\]/g, ".$1")
                .split(".")
                .filter(Boolean)
                .map((seg) => (/^\d+$/.test(seg) ? parseInt(seg, 10) : seg));
            const setNestedValue = (obj, keys, val) => {
                var _a, _b;
                if (!keys.length)
                    return val;
                const [first, ...rest] = keys;
                if (Array.isArray(obj)) {
                    const arr = [...obj];
                    arr[first] = setNestedValue((_a = arr[first]) !== null && _a !== void 0 ? _a : (typeof rest[0] === "number" ? [] : {}), rest, val);
                    return arr;
                }
                return Object.assign(Object.assign({}, obj), { [first]: setNestedValue((_b = obj === null || obj === void 0 ? void 0 : obj[first]) !== null && _b !== void 0 ? _b : (typeof rest[0] === "number" ? [] : {}), rest, val) });
            };
            const updated = setNestedValue(prevValues, path, newValue);
            const topKey = path[0];
            setDirtyFields((d) => (Object.assign(Object.assign({}, d), { [topKey]: updated[topKey] !== initialRef.current[topKey] })));
            setTouchedFields((t) => (Object.assign(Object.assign({}, t), { [topKey]: true })));
            return updated;
        });
    }, []);
    const handleBlur = (e) => {
        const path = e.target.name
            .replace(/\[(\w+)\]/g, ".$1")
            .split(".")
            .filter(Boolean);
        const topKey = path[0];
        setTouchedFields((t) => (Object.assign(Object.assign({}, t), { [topKey]: true })));
    };
    const resetForm = (nextInitial) => {
        if (nextInitial) {
            initialRef.current = nextInitial;
        }
        const base = nextInitial !== null && nextInitial !== void 0 ? nextInitial : initialRef.current;
        setValues(base);
        setErrors({});
        setIsValid(true);
        const newDirty = Object.keys(initialRef.current).reduce((acc, key) => {
            acc[key] = false;
            return acc;
        }, {});
        setDirtyFields(newDirty);
        const newTouched = Object.keys(initialRef.current).reduce((acc, key) => {
            acc[key] = false;
            return acc;
        }, {});
        setTouchedFields(newTouched);
    };
    const resetField = (pathString) => {
        const path = pathString
            .replace(/\[(\w+)\]/g, ".$1")
            .split(".")
            .filter(Boolean)
            .map((seg) => (/^\d+$/.test(seg) ? parseInt(seg, 10) : seg));
        const topKey = path[0];
        const getNested = (obj, keys) => keys.reduce((acc, key) => acc === null || acc === void 0 ? void 0 : acc[key], obj);
        const initialVal = getNested(initialRef.current, path);
        setValues((prev) => {
            const setNested = (obj, keys, val) => {
                var _a, _b;
                if (!keys.length)
                    return val;
                const [first, ...rest] = keys;
                if (Array.isArray(obj)) {
                    const arr = [...obj];
                    arr[first] = setNested((_a = arr[first]) !== null && _a !== void 0 ? _a : (typeof rest[0] === "number" ? [] : {}), rest, val);
                    return arr;
                }
                return Object.assign(Object.assign({}, obj), { [first]: setNested((_b = obj === null || obj === void 0 ? void 0 : obj[first]) !== null && _b !== void 0 ? _b : (typeof rest[0] === "number" ? [] : {}), rest, val) });
            };
            const updated = setNested(prev, path, initialVal);
            return updated;
        });
        setDirtyFields((d) => (Object.assign(Object.assign({}, d), { [topKey]: false })));
        setTouchedFields((t) => (Object.assign(Object.assign({}, t), { [topKey]: false })));
    };
    const clearErrors = (pathString) => {
        if (!pathString) {
            setErrors({});
            return;
        }
        const key = pathString
            .replace(/\[(\w+)\]/g, ".$1")
            .split(".")[0];
        setErrors((e) => {
            const ne = Object.assign({}, e);
            delete ne[key];
            return ne;
        });
    };
    const runValidation = (0, react_1.useCallback)((vals) => __awaiter(void 0, void 0, void 0, function* () {
        if (!validationRules) {
            setIsValid(true);
            return true;
        }
        const newErrors = {};
        yield Promise.all(Object.keys(validationRules).map((key) => __awaiter(void 0, void 0, void 0, function* () {
            const rule = validationRules[key];
            if (rule) {
                const error = yield rule(vals[key], vals);
                if (error) {
                    newErrors[key] = error;
                }
            }
        })));
        setErrors(newErrors);
        const valid = Object.keys(newErrors).length === 0;
        setIsValid(valid);
        return valid;
    }), [validationRules]);
    const validate = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        return runValidation(values);
    }), [runValidation, values]);
    (0, react_1.useEffect)(() => {
        if (validateOnChange && validationRules) {
            runValidation(values);
        }
    }, [values, validateOnChange, runValidation, validationRules]);
    (0, react_1.useEffect)(() => {
        if (validateOnBlur && validationRules) {
            runValidation(values);
        }
    }, [touchedFields, validateOnBlur, runValidation, validationRules]);
    function watch(path) {
        if (!path) {
            return values;
        }
        if (typeof path === "string" && (path.includes(".") || path.includes("["))) {
            const segments = path
                .replace(/\[(\w+)\]/g, ".$1")
                .split(".")
                .filter(Boolean)
                .map((seg) => (/^\d+$/.test(seg) ? parseInt(seg, 10) : seg));
            return segments.reduce((acc, seg) => acc === null || acc === void 0 ? void 0 : acc[seg], values);
        }
        return values[path];
    }
    const watchCallback = (0, react_1.useCallback)(watch, [values]);
    const handleSubmit = (0, react_1.useCallback)((cb) => (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (yield validate()) {
                yield cb();
            }
        }
        finally {
            setIsSubmitting(false);
        }
    }), [validate]);
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
    };
};
exports.useForm = useForm;
