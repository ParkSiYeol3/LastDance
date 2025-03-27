// Signup.js
import React, { useState } from 'react';
import { auth } from './firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const Signup = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleSignup = async (e) => {
		e.preventDefault();
		try {
			await createUserWithEmailAndPassword(auth, email, password);
			alert('회원가입 성공!');
			setEmail('');
			setPassword('');
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<div className='container'>
			<h2>회원가입</h2>
			<form onSubmit={handleSignup}>
				<input type='email' placeholder='이메일' value={email} onChange={(e) => setEmail(e.target.value)} required />
				<input type='password' placeholder='비밀번호' value={password} onChange={(e) => setPassword(e.target.value)} required />
				<button type='submit'>회원가입</button>
			</form>
			{error && <p>{error}</p>}
		</div>
	);
};

export default Signup;
