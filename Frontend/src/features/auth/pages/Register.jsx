import React from 'react'
import { useNavigate,Link } from 'react-router'

const Register = () => {

  const navigate = useNavigate()
  
    const handleSubmit = (e) => {
        e.priventDefault()
    }


  return (
     <main>
        <div className="form-container">
            <h1>Register</h1>

            <form onSubmit={handleSubmit}>

                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" name="username" id="username" placeholder='Enter Username ' />
                </div>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" name="email" id="email" placeholder='Enter Email Address' />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" placeholder='Enter Password' />
                </div>

                <button className='button primary-button'>Register</button>

            </form>

            <p>Alreday have an Account? <Link to={"/login"}>Login</Link></p>
        </div>
    </main>
  )
}

export default Register
