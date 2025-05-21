// src/pages/Login.jsx
import { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation }   from 'react-router-dom';
import { useLogin }                   from '../hooks/useLogin';
import { useAuthContext }             from '../context/auth';
import { usePathContext }             from '../context/path';
import { ROLES }                      from '../config/roles';
import { Link }                       from 'react-router-dom';
import { FaEye, FaEyeSlash }         from 'react-icons/fa';
import usePersist                     from '../hooks/usePersist';
import PersistLoginAlert              from '../components/auth/PersistLoginAlert';
import PersistLoginCheckbox           from '../components/auth/PersistLoginCheckbox';
import SignInWithGoogleButton         from '../components/auth/SignInWithGoogleButton';

const Login = () => {
  const { login, error, isLoading } = useLogin();
  const { auth }                   = useAuthContext();
  const { link }                   = usePathContext();            // for default link
  const { persist, setPersist }    = usePersist();
  const [showPw, setShowPw]        = useState(false);
  const emailRef                   = useRef('');
  const passwordRef                = useRef('');
  const navigate                    = useNavigate();
  const location                    = useLocation();

  // replicate App.js getRedirectPath
  const getRedirectPath = () => {
    if (!auth) return '/guest';
    if (auth.roles.includes(ROLES.Guest)) return '/guest';
    if (auth.roles.includes(ROLES.Staff) || auth.roles.includes(ROLES.Admin))
      return '/user';
    if (auth.roles.includes(ROLES.Trade))
      return '/trade';
    return link || '/';
  };

  useEffect(() => {
    if (!auth) return;

    // if ProductList kicked us here with planner state, resume it:
    const {
      from = null,
      pendingAction,
      roomData,
      currentStep
    } = location.state || {};

    if (from) {
      return navigate(from, {
        replace: true,
        state: { resumeAction: pendingAction, roomData, currentStep }
      });
    }

    // otherwise fall back to role-based
    navigate(getRedirectPath(), { replace: true });
  }, [auth, location.state, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(
      emailRef.current.value.trim(),
      passwordRef.current.value.trim(),
      persist
    );
  };

  return (
    <>
      <form className="login" onSubmit={handleSubmit}>
        <h3 className="text-center mb-4">Log In</h3>

        <label>Email Address:</label>
        <input type="email" ref={emailRef} required className="inputs" />

        <label>Password:</label>
        <div className="d-flex">
          <input
            type={showPw ? 'text' : 'password'}
            ref={passwordRef}
            required
            autoComplete="on"
            className="inputs"
          />
          <button
            className="btn mb-2"
            onClick={(e) => {
              e.preventDefault();
              setShowPw((v) => !v);
            }}
          >
            {showPw ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="d-flex justify-content-between">
          <PersistLoginCheckbox
            persist={persist}
            setPersist={setPersist}
          />
          <label className="form-check-label">
            <Link to="/recover-password">Forgot Password?</Link>
          </label>
        </div>

        <button className="w-100 mt-3" disabled={isLoading}>
          Log In
        </button>

        <div className="signup-prompt mt-3">
          Create an account? <Link to="/signup">Signup</Link>
        </div>
        {error && <div className="error">{error}</div>}
      </form>

      <hr />
      <SignInWithGoogleButton
        persist={persist}
        setPersist={setPersist}
      />

      {persist && (
        <PersistLoginAlert
          maxWidth="400px"
          marginAuto
        />
      )}
    </>
  );
};

export default Login;
