import React from 'react';
import './InputField.css';

interface InputFieldProps {
	value?: string;
	onChange?: (newValue: string) => void;
}

const InputField: React.FC<InputFieldProps> = ({ value, onChange }) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		if (onChange) {
			onChange(newValue);
		}
	};

	return (
		<input
			className="input"
			type="text"
			value={value}
			onChange={handleChange}
		/>
	);
};

export default InputField;
