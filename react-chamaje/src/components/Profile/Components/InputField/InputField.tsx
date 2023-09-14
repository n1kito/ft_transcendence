import React from 'react';
import './InputField.css';

interface InputFieldProps {
	value?: string;
	onChange?: (newValue: string) => void;
	error?: string | null;
	success?: string;
	maxlength?: number;
}

const InputField: React.FC<InputFieldProps> = ({
	value,
	onChange,
	error,
	success,
	maxlength,
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
				className={`input ${error ? 'error' : success ? 'success' : ''}`}
				type="text"
				value={value}
				onChange={handleChange}
				maxLength={maxlength}
			/>
			{error && <div className="errorMessage">{error}</div>}
			{success && <div className="successMessage">{success}</div>}
		</div>
	);
};

export default InputField;
