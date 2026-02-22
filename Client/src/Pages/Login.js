import React, { useContext, useState } from 'react';
import { MDBContainer } from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';
import { PetContext } from '../Context/Context';
import { Input } from '../Components/Input';
import { axios } from '../Utils/Axios';
import Button from '../Components/Button';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {
  const navigate = useNavigate();
  const { setLoginStatus } = useContext(PetContext);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value.trim().toLowerCase();
    const password = e.target.password.value;

    if (!email || !password) {
      return toast.error('Enter all fields');
    }

    try {
      let response;

      // 🔥 Try admin login first
      try {
        response = await axios.post('/api/admin/login', { email, password });
      } catch (adminError) {
        response = await axios.post('/api/users/login', { email, password });
      }

      const data = response?.data?.data;

      if (!data || !data.jwt_token) {
        return toast.error("Invalid login response");
      }

      // 🔥 FIX: ensure role always exists
      const role = data.role ? data.role : "user";

      // ✅ Store properly
      localStorage.setItem('jwt_token', data.jwt_token);
      localStorage.setItem('name', data.name);
      localStorage.setItem('role', role);

      if (role === 'user' && data.userID) {
        localStorage.setItem('userID', data.userID);
      } else {
        localStorage.removeItem('userID');
      }

      // ✅ Update context
      setLoginStatus(true);

      toast.success('Login Successful');

      // ✅ Navigate immediately (NO timeout)
      if (role === 'admin') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }

    } catch (error) {
      toast.error(error.response?.data?.message || 'Login Failed');
    }
  };

  return (
    <MDBContainer className="form-container">
      <form onSubmit={handleSubmit}>
        <h1 className="mb-3 text-black">Welcome back</h1>

        <Input type="email" label="Email Address" name="email" />

        <div style={{ position: 'relative' }}>
          <Input
            type={showPassword ? 'text' : 'password'}
            label="Password"
            name="password"
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer'
            }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <Button type="submit" className="mb-4 w-100" color="black">
          Log in
        </Button>

        <div className="pointer text-center">
          <p>
            Don't have an account?{' '}
            <span
              className="text-black fw-bold"
              onClick={() => navigate('/registration')}
            >
              Register
            </span>
          </p>
        </div>
      </form>
    </MDBContainer>
  );
}

export default Login;