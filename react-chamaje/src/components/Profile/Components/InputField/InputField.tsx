import React from 'react';
import './InputField.css';

interface InputFieldProps {
	value?: string;
	onChange?: (newValue: string) => void;
	error?: string | null;
	type?: '2fa' | '';
}

const InputField: React.FC<InputFieldProps> = ({
	value,
	onChange,
	error,
	type,
}) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		if (onChange) {
			onChange(newValue);
		}
	};

	return (
		<div className="inputFieldWrapper">
			<input
				className={`input ${error ? 'error' : ''}`}
				type="text"
				value={value}
				onChange={handleChange}
				// maxLength={6}
				maxLength={type === '2fa' ? 6 : undefined}
			/>
			{error && <div className="errorMessage">{error}</div>}
		</div>
	);
};

export default InputField;
