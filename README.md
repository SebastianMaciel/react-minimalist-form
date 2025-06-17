# React Minimalist Form

A lightweight and flexible React custom hook for managing form state with TypeScript support.

Designed to provide a simple and intuitive API for common form needs, including field setters, value tracking, and field-level watching, while keeping your codebase clean and manageable.

### Try it out on CodeSandbox

[![Edit react-minimalist-form](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/devbox/rough-wildflower-7wsd5y?embed=1)

## Features

🎯 Minimal API: Simple and clear interface to handle forms without additional dependencies.

🧑‍💻 TypeScript Support: Fully type-safe, ensuring robust and predictable behavior.

⚡ Dynamic Setters: Automatic creation of setters for all fields.

👀 Watch Functionality: Track individual fields or the entire form state in real-time.

📝 Dirty State Tracking: `dirtyFields` and `isDirty` indicate modified fields and overall form changes.
🙌 Touched State Tracking: `touchedFields` and `isTouched` tell you which fields have been blurred.

🔄 Reset Support: Easily reset form values to their initial state or new defaults.

🧹 `resetField` to restore any field to its initial value.
🚫 `clearErrors` to remove validation messages.
⏳ `isSubmitting` flag while the submit callback runs.

🪶 Lightweight: No unnecessary overhead, just what you need for managing form state in React.

✅ Field-level Validation: Pass custom (sync or async) validation rules that receive both the field value and the full form state.

❌ Optional Validation: Define validation rules and control error state when needed.
⚙️ Configurable Validation Triggers: Choose to validate on change, blur, or both.

🌳 Nested Names: Use dot or bracket notation in `name` attributes to update nested fields automatically.
➕ Dynamic Field Registration with `registerField` for runtime fields.

## Installation

Install the library using `pnpm` (recommended) or your preferred package manager.

```bash
pnpm add react-minimalist-form
```

## Usage

Here’s how to use the useForm hook in your project:

```tsx
import React from "react";
import { useForm } from "react-minimalist-form";

interface FormData {
  username: string;
  email: string;
}

const MyForm = () => {
  const {
    values,
    errors,
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
    isSubmitting,
    validate
  } = useForm<FormData>(
    {
      username: "",
      email: "",
    },
    {
      username: (v) => (!v ? "Username is required" : null),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Invalid email"),
    }
  );

  const onSubmit = () => {
    console.log("submit", values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        name='username'
        value={values.username}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder='Username'
      />
      {errors.username && <span>{errors.username}</span>}
      <input
        name='email'
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder='Email'
      />
      {errors.email && <span>{errors.email}</span>}
      <button type='submit' disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Submit'}
      </button>
      <button type='button' onClick={() => resetField('username')}>Reset username</button>
      <button type='button' onClick={() => clearErrors()}>Clear errors</button>
      <button type='button' onClick={resetForm}>Reset</button>
    </form>
  );
};
```

`dirtyFields` lets you know which fields changed from their initial value, while `isDirty` tells you if any field has been modified. `touchedFields` and `isTouched` track fields that have been blurred. Calling `resetForm` clears all of these states. Use `resetField` to restore a single field and `clearErrors()` to remove validation messages. The `isSubmitting` flag is `true` while the submit callback runs. Pass new defaults to `resetForm` if you want to start over with a different initial state.

```tsx
resetForm({ username: "", email: "" });
```

## Advanced Example with Watch

The watch function allows you to track individual fields or the entire form state.

```tsx
import React from "react";
import { useForm } from "./simpleForm";

interface FormData {
  username: string;
  email: string;
  role: string;
  isSubscribed: boolean;
}

const App = () => {
  const { values, handleChange, watch } = useForm<FormData>({
    username: "",
    email: "",
    role: "",
    isSubscribed: false,
  });

  // Watch the username field
  const watchedUsername = watch("username");
  console.log(values);

  return (
    <form
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        maxWidth: "200px",
        gap: "1rem",
      }}
    >
      <input
        name='username'
        value={values.username}
        onChange={handleChange}
        placeholder='Username'
      />

      <input
        name='email'
        value={values.email}
        onChange={handleChange}
        placeholder='Email'
      />

      <select
        name='role'
        value={values.role}
        onChange={handleChange}
      >
        <option value='student'>Student</option>
        <option value='teacher'>Teacher</option>
      </select>

      <label>
        <input
          type='checkbox'
          name='isSubscribed'
          checked={values.isSubscribed}
          onChange={handleChange}
        />
        Subscribe to newsletter
      </label>

      <p>
        Current Username: <pre>{JSON.stringify(values, null, 2)}</pre>
      </p>
    </form>
  );
};

export default App;
```

### Watching Nested Fields

`watch` also accepts dot or bracket notation to access nested values:

```tsx
const { watch } = useForm({
  user: { firstName: "", lastName: "" },
  tags: ["react"]
});

const first = watch("user.firstName");
const firstTag = watch("tags[0]");
```

## Async Validation Example

Validation rules can return promises, enabling checks like verifying username availability:

```tsx
interface FormData {
  username: string;
}

const checkUsername = async (u: string) => {
  const taken = await api.isUserTaken(u);
  return taken ? "Username already taken" : null;
};

const App = () => {
  const { values, handleChange, handleSubmit, validate, errors } = useForm<FormData>(
    { username: "" },
    { username: checkUsername }
  );

  const onSubmit = () => {
    console.log("submit", values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        name="username"
        value={values.username}
        onChange={handleChange}
      />
      {errors.username && <span>{errors.username}</span>}
      <button type="submit">Submit</button>
    </form>
  );
};
```

## Nested Objects and Arrays

The hook also works with more complex structures. You can store nested objects
and arrays in your form state and update them using the generated setters or by
using dot/bracket notation in the `name` attribute.

```tsx
interface FormData {
  user: {
    firstName: string;
    lastName: string;
  };
  tags: string[];
}

const ComplexForm = () => {
  const { values, setters, handleChange, handleSubmit, validate, errors } = useForm<FormData>(
    {
      user: { firstName: "", lastName: "" },
      tags: [],
    },
    {
      user: ({ firstName, lastName }) =>
        firstName && lastName ? null : "Both names are required",
      tags: (t) => (t.length ? null : "At least one tag"),
    }
  );

  const addTag = () => setters.tags([...values.tags, ""]);

  const onSubmit = () => {
    console.log(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        name="user.firstName"
        value={values.user.firstName}
        onChange={handleChange}
        placeholder="First name"
      />
      <input
        name="user.lastName"
        value={values.user.lastName}
        onChange={handleChange}
        placeholder="Last name"
      />

      {values.tags.map((tag, index) => (
        <input
          key={index}
          name={`tags[${index}]`}
          value={tag}
          onChange={handleChange}
        />
      ))}

      <button type="button" onClick={addTag}>
        Add tag
      </button>

      <pre>{JSON.stringify(errors, null, 2)}</pre>
    </form>
  );
};
```

You can also update fields programmatically using the same path syntax:

```tsx
const { setFieldValue } = useForm({
  user: { address: { city: "" } },
});

setFieldValue("user.address.city", "New York");
```
## Handling Special Input Types

`handleChange` automatically adapts to several HTML input types:

- **Radio buttons** only update state when checked.
- **Number inputs** store the numeric value.
- **File inputs** store the `FileList` from `e.target.files`.
- **Multiple selects** return an array of selected values.

```tsx
<label>
  <input type="radio" name="color" value="red" onChange={handleChange} />
  Red
</label>
<input type="number" name="age" value={values.age} onChange={handleChange} />
<input type="file" name="avatar" onChange={handleChange} />
<select multiple name="tags" onChange={handleChange}>
  <option value="a">A</option>
  <option value="b">B</option>
</select>
```

## Dynamic Field Registration

Add fields after initialization using `registerField(path, initialValue)`.

```tsx
const { registerField } = useForm({});
registerField("extra", "");
```

## API

`useForm<T>(initialValues: T, validationRules?: ValidationRules<T>, config?: { validateOnChange?: boolean; validateOnBlur?: boolean }): UseForm<T>`

A custom hook that provides utilities for managing form state.

#### Parameters

- `initialValues`: An object representing the initial state of your form. The shape of this object defines the structure of the form.
- `validationRules` *(optional)*: An object with validation functions (sync or async) for each field.
- `config` *(optional)*: Object with `validateOnChange` and `validateOnBlur` booleans (both default to `true`) that control when automatic validation runs.

#### Returns

- `values`: Current state of the form.
- `setters`: A dynamic object containing setter functions for each field.
- `handleChange`: A function to handle onChange events for input fields.
- `handleSubmit`: Wraps validation and `event.preventDefault` for easier form submission.
- `handleBlur`: Marks a field as touched when an input loses focus.
- `resetForm`: Resets the form to its initial values. Pass new defaults to `resetForm` to update the initial state.
- `resetField`: Restore a single field to its initial value.
- `clearErrors`: Remove error messages for a field or the whole form.
- `watch`: A function to track specific fields or the entire form state in real-time.
- `setFieldValue`: Programmatically update any field by path.
- `registerField`: Add new fields at runtime.
- `errors`: Object containing validation errors.
- `isValid`: `true` when the form has no validation errors.
- `isSubmitting`: `true` while `handleSubmit` is running.
- `validate`: Run validation and update the errors state. Returns a promise that resolves to `true` when the form is valid.
- `dirtyFields`: Object tracking which fields have been modified.
- `isDirty`: `true` when any field has changed.
- `touchedFields`: Object tracking which fields have been blurred.
- `isTouched`: `true` when any field has been touched.

### Example

```tsx
const {
  values,
  errors,
  isValid,
  setters,
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
  isSubmitting,
  validate,
  watch,
  setFieldValue,
} = useForm(
  { username: "", email: "" },
  {
    username: (v) => (!v ? "Required" : null),
  },
  {
    validateOnChange: false,
  }
);
```

## Contributing

We welcome contributions! Feel free to submit issues or pull requests to improve this library. Please ensure all changes are accompanied by appropriate documentation updates.

#### Setup

1. Clone the repository:

```bash
git clone https://github.com/sebastianmaciel/react-minimalist-form.git

cd react-minimalist-form
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the tests:

```bash
pnpm test
```

4. Build the project locally:

```bash
pnpm build
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

👤 **Sebastian Maciel**

Follow me on GitHub: [github.com/SebastianMaciel](https://github.com/SebastianMaciel)

Linkedin: [Sebastian Maciel](https://www.linkedin.com/in/sebastianmaciel/)
