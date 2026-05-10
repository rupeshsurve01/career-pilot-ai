import React from "react";
import "../auth.form.scss";
import { useNavigate, Link } from "react-router";

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.priventDefault();
  };

  return (
    <main>
      <div className="form-container">
        <h1>Login</h1>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter Email Address"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter Password"
            />
          </div>

          <button className="button primary-button">Login</button>
        </form>

        <p>
          Don't have an Account? <Link to={"/register"}>Register</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
