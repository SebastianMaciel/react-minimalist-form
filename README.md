# React Minimalist Form

A lightweight and flexible React custom hook for managing form state with TypeScript support. Designed to provide a simple and intuitive API for common form needs, including field setters, value tracking, and field-level watching, while keeping your codebase clean and manageable.

---

## Features

🎯 Minimal API: Simple and clear interface to handle forms without additional dependencies.
🧑‍💻 TypeScript Support: Fully type-safe, ensuring robust and predictable behavior.
⚡ Dynamic Setters: Automatic creation of setters for all fields.
👀 Watch Functionality: Track individual fields or the entire form state in real-time.
🔄 Reset Support: Easily reset form values to their initial state.
🪶 Lightweight: No unnecessary overhead, just what you need for managing form state in React.

---

## Installation

Install the library using `pnpm` (recommended) or your preferred package manager.

```bash
pnpm add react-minimalist-form
```

---

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
  const { values, handleChange, resetForm } = useForm<FormData>({
    username: "",
    email: "",
  });

  return (
    <form>
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
      <button
        type='button'
        onClick={resetForm}
      >
        Reset
      </button>
    </form>
  );
};
```

## Advanced Example with Watch

The watch function allows you to track individual fields or the entire form state.

```tsx
import React from "react";
import { useForm } from "react-minimalist-form";

interface FormData {
  username: string;
  email: string;
}

const MyForm = () => {
  const { values, handleChange, watch } = useForm<FormData>({
    username: "",
    email: "",
  });

  const watchedUsername = watch("username"); // Watch specific field
  const watchedValues = watch(); // Watch entire form state

  return (
    <form>
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
      <p>Watched Username: {watchedUsername}</p>
      <p>Form Values: {JSON.stringify(watchedValues)}</p>
    </form>
  );
};
```

---

## API

`useForm<T>(initialValues: T): UseForm<T>`

A custom hook that provides utilities for managing form state.

#### Parameters

- `initialValues`: An object representing the initial state of your form. The shape of this object defines the structure of the form.

#### Returns

- `values`: Current state of the form.
- `setters`: A dynamic object containing setter functions for each field.
- `handleChange`: A function to handle onChange events for input fields.
- `resetForm`: Resets the form to its initial values.
- `watch`: A function to track specific fields or the entire form state in real-time.

### Example

```tsx
const { values, setters, handleChange, resetForm, watch } = useForm({
  username: "",
  email: "",
});
```

---

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

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

👤 **Sebastian Maciel**

Follow me on GitHub: [github.com/SebastianMaciel](https://github.com/SebastianMaciel)
Linkedin: [Sebastian Maciel](https://www.linkedin.com/in/sebastianmaciel/)
