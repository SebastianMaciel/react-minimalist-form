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

🔄 Reset Support: Easily reset form values to their initial state.

🪶 Lightweight: No unnecessary overhead, just what you need for managing form state in React.

❌ Optional Validation: Define validation rules and control error state when needed.

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
  const { values, errors, handleChange, resetForm, validate } = useForm<FormData>(
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
    if (validate()) {
      console.log("submit", values);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <input
        name='username'
        value={values.username}
        onChange={handleChange}
        placeholder='Username'
      />
      {errors.username && <span>{errors.username}</span>}
      <input
        name='email'
        value={values.email}
        onChange={handleChange}
        placeholder='Email'
      />
      {errors.email && <span>{errors.email}</span>}
      <button type='submit'>Submit</button>
      <button type='button' onClick={resetForm}>Reset</button>
    </form>
  );
};
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

## API

`useForm<T>(initialValues: T, validationRules?: ValidationRules<T>): UseForm<T>`

A custom hook that provides utilities for managing form state.

#### Parameters

- `initialValues`: An object representing the initial state of your form. The shape of this object defines the structure of the form.
- `validationRules` *(optional)*: An object with validation functions for each field.

#### Returns

- `values`: Current state of the form.
- `setters`: A dynamic object containing setter functions for each field.
- `handleChange`: A function to handle onChange events for input fields.
- `resetForm`: Resets the form to its initial values.
- `watch`: A function to track specific fields or the entire form state in real-time.
- `errors`: Object containing validation errors.
- `validate`: Run validation and update the errors state. Returns `true` when the form is valid.

### Example

```tsx
const {
  values,
  errors,
  setters,
  handleChange,
  resetForm,
  validate,
  watch,
} = useForm(
  { username: "", email: "" },
  {
    username: (v) => (!v ? "Required" : null),
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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

👤 **Sebastian Maciel**

Follow me on GitHub: [github.com/SebastianMaciel](https://github.com/SebastianMaciel)

Linkedin: [Sebastian Maciel](https://www.linkedin.com/in/sebastianmaciel/)
