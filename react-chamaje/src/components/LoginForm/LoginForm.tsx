import React from 'react';
import './LoginForm.css';
import Button from '../Shared/Button/Button';

const LoginForm = () => {
	return (
		<div>
			<form id="loginFormWrapper">
				<fieldset>
					<div className="formRow">
						{/* <label htmlFor="email-input">email</label> */}
						<input
							id="email-input"
							type="email"
							placeholder="email"
							title="please enter your email"
						></input>
					</div>
					<div className="formRow">
						{/* <label htmlFor="password-input">password</label> */}
						<input
							id="password-input"
							type="password"
							placeholder="password"
							title="please enter your password"
						></input>
					</div>
					{/* <h1>login</h1> */}
					<div className="submitRow">
						<Button buttonText="login" baseColor={[308, 80, 92]} />
						{/* <Button buttonText="42" baseColor={[309, 0, 71]}/> */}
						{/* <p>login with 42</p> */}
					</div>
				</fieldset>
			</form>
		</div>
	);
};

export default LoginForm;
