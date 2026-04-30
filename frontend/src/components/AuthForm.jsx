import { useState } from "react";

const initialState = {
    name: "",
    email: "",
    password: ""
};

export default function AuthForm({ mode, onSubmit, isBusy }) {
    const [formState, setFormState] = useState(initialState);

    const isRegisterMode = mode === "register";

    function handleChange(event) {
        const { name, value } = event.target;
        setFormState((currentState) => ({
            ...currentState,
            [name]: value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        await onSubmit(formState);

        setFormState((currentState) => ({
            ...initialState,
            email: currentState.email
        }));
    }

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            {isRegisterMode && (
                <label className="field">
                    <span>Full Name</span>
                    <input
                        name="name"
                        type="text"
                        value={formState.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        required
                    />
                </label>
            )}

            <label className="field">
                <span>Email Address</span>
                <input
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                />
            </label>

            <label className="field">
                <span>Password</span>
                <input
                    name="password"
                    type="password"
                    value={formState.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    minLength={6}
                    required
                />
            </label>

            <button className="primary-button" type="submit" disabled={isBusy}>
                {isBusy
                    ? "Please wait..."
                    : isRegisterMode
                        ? "Create Account"
                        : "Login"}
            </button>
        </form>
    );
}
