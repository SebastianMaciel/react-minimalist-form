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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useForm = void 0;
const react_1 = require("react");
const parsePath = (path) => path
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
const removeNestedValue = (obj, keys) => {
    if (!obj)
        return obj;
    const [first, ...rest] = keys;
    if (rest.length === 0) {
        if (Array.isArray(obj)) {
            const arr = [...obj];
            arr.splice(first, 1);
            return arr;
        }
        const _a = obj, _b = first, _omit = _a[_b], restObj = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
        return restObj;
    }
    if (Array.isArray(obj)) {
        const arr = [...obj];
        arr[first] = removeNestedValue(arr[first], rest);
        return arr;
    }
    return Object.assign(Object.assign({}, obj), { [first]: removeNestedValue(obj[first], rest) });
};
const useForm = (initialValues, validationRules, config = {}) => {
    const { validateOnChange = true, validateOnBlur = true } = config;
    const initialRef = (0, react_1.useRef)(initialValues);
    const [values, setValues] = (0, react_1.useState)(initialRef.current);
    const [errors, setErrors] = (0, react_1.useState)({});
    const [isValid, setIsValid] = (0, react_1.useState)(true);
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const validationRulesRef = (0, react_1.useRef)((validationRules !== null && validationRules !== void 0 ? validationRules : {}));
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
    const setters = (0, react_1.useMemo)(() => {
        return Object.keys(initialRef.current).reduce((acc, key) => {
            acc[key] = (value) => {
                setValues((prevValues) => {
                    const newValues = Object.assign(Object.assign({}, prevValues), { [key]: value });
                    setDirtyFields((d) => (Object.assign(Object.assign({}, d), { [key]: newValues[key] !== initialRef.current[key] })));
                    return newValues;
                });
            };
            return acc;
        }, {});
    }, [initialRef.current]);
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
            const path = parsePath(name);
            const updated = setNestedValue(prevValues, path, newValue);
            const topKey = path[0];
            setDirtyFields((d) => (Object.assign(Object.assign({}, d), { [topKey]: updated[topKey] !== initialRef.current[topKey] })));
            setTouchedFields((t) => (Object.assign(Object.assign({}, t), { [topKey]: true })));
            return updated;
        });
    };
    const setFieldValue = (0, react_1.useCallback)((pathString, newValue) => {
        setValues((prevValues) => {
            const path = parsePath(pathString);
            const updated = setNestedValue(prevValues, path, newValue);
            const topKey = path[0];
            setDirtyFields((d) => (Object.assign(Object.assign({}, d), { [topKey]: updated[topKey] !== initialRef.current[topKey] })));
            setTouchedFields((t) => (Object.assign(Object.assign({}, t), { [topKey]: true })));
            return updated;
        });
    }, []);
    const registerField = (0, react_1.useCallback)((pathString, initialValue) => {
        const path = parsePath(pathString);
        const topKey = path[0];
        // update baseline first so dirtiness check uses the latest initial values
        const nextInitial = setNestedValue(initialRef.current, path, initialValue);
        initialRef.current = nextInitial;
        setValues((prev) => {
            const updated = setNestedValue(prev, path, initialValue);
            setDirtyFields((d) => (Object.assign(Object.assign({}, d), { [topKey]: updated[topKey] !== initialRef.current[topKey] })));
            setTouchedFields((t) => t[topKey] === undefined ? Object.assign(Object.assign({}, t), { [topKey]: false }) : t);
            return updated;
        });
        if (!(pathString in validationRulesRef.current)) {
            validationRulesRef.current[pathString] = undefined;
        }
    }, []);
    const handleBlur = (e) => {
        const path = parsePath(e.target.name);
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
        const path = parsePath(pathString);
        const topKey = path[0];
        const getNested = (obj, keys) => keys.reduce((acc, key) => acc === null || acc === void 0 ? void 0 : acc[key], obj);
        const initialVal = getNested(initialRef.current, path);
        setValues((prev) => {
            const updated = setNestedValue(prev, path, initialVal);
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
        const normalized = parsePath(pathString).join(".");
        setErrors((e) => {
            const ne = Object.assign({}, e);
            if (normalized in ne) {
                delete ne[normalized];
            }
            else {
                const topKey = normalized.split(".")[0];
                delete ne[topKey];
            }
            return ne;
        });
    };
    const unregisterField = (0, react_1.useCallback)((pathString) => {
        const path = parsePath(pathString);
        const topKey = path[0];
        initialRef.current = removeNestedValue(initialRef.current, path);
        setValues((prev) => {
            const updated = removeNestedValue(prev, path);
            setDirtyFields((d) => (Object.assign(Object.assign({}, d), { [topKey]: updated[topKey] !== initialRef.current[topKey] })));
            setTouchedFields((t) => {
                if (updated[topKey] === undefined) {
                    const _a = t, _b = topKey, _omit = _a[_b], rest = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
                    return rest;
                }
                return t;
            });
            return updated;
        });
        clearErrors(pathString);
        if (pathString in validationRulesRef.current) {
            delete validationRulesRef.current[pathString];
        }
    }, []);
    const runValidation = (0, react_1.useCallback)((vals) => __awaiter(void 0, void 0, void 0, function* () {
        if (!validationRulesRef.current || Object.keys(validationRulesRef.current).length === 0) {
            setIsValid(true);
            return true;
        }
        const newErrors = {};
        yield Promise.all(Object.keys(validationRulesRef.current).map((key) => __awaiter(void 0, void 0, void 0, function* () {
            const rule = validationRulesRef.current[key];
            if (rule) {
                const path = parsePath(key);
                const value = path.reduce((acc, seg) => acc === null || acc === void 0 ? void 0 : acc[seg], vals);
                const error = yield rule(value, vals);
                if (error) {
                    newErrors[key] = error;
                }
            }
        })));
        setErrors(newErrors);
        const valid = Object.keys(newErrors).length === 0;
        setIsValid(valid);
        return valid;
    }), [validationRulesRef]);
    const validate = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        return runValidation(values);
    }), [runValidation, values]);
    const validateField = (0, react_1.useCallback)((pathString) => __awaiter(void 0, void 0, void 0, function* () {
        const path = parsePath(pathString);
        const normalized = path.join(".");
        const rule = validationRulesRef.current[normalized];
        if (!rule) {
            let nextErrors = {};
            setErrors((prev) => {
                const ne = Object.assign({}, prev);
                delete ne[normalized];
                nextErrors = ne;
                return ne;
            });
            const valid = Object.keys(nextErrors).length === 0;
            setIsValid(valid);
            return valid;
        }
        const value = path.reduce((acc, seg) => acc === null || acc === void 0 ? void 0 : acc[seg], values);
        const error = yield rule(value, values);
        let nextErrors = {};
        setErrors((prev) => {
            const ne = Object.assign({}, prev);
            if (error) {
                ne[normalized] = error;
            }
            else {
                delete ne[normalized];
            }
            nextErrors = ne;
            return ne;
        });
        const valid = Object.keys(nextErrors).length === 0;
        setIsValid(valid);
        return valid;
    }), [values]);
    (0, react_1.useEffect)(() => {
        if (validateOnChange && validationRulesRef.current) {
            runValidation(values);
        }
    }, [values, validateOnChange, runValidation]);
    (0, react_1.useEffect)(() => {
        if (validateOnBlur && validationRulesRef.current) {
            runValidation(values);
        }
    }, [touchedFields, validateOnBlur, runValidation]);
    function watch(path) {
        if (!path) {
            return values;
        }
        if (typeof path === "string" && (path.includes(".") || path.includes("["))) {
            const segments = parsePath(path);
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
        validateField,
        watch: watchCallback,
        setFieldValue,
        registerField,
        unregisterField,
    };
};
exports.useForm = useForm;
