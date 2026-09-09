import * as React from "react";
import type { LotteryInputProps } from "./types";

type InputFieldProps = LotteryInputProps & {
	htmlType?: string;
	inputMode?: "text" | "email" | "numeric";
	autoComplete?: string;
	multiline?: boolean;
};

// Ein Input für alle einzeiligen Typen und die Textarea - nur das
// HTML-type-Attribut und die Tastatur-/Autocomplete-Hinweise unterscheiden
// sich je LotteryFieldType (Zuordnung siehe lottery-form.tsx).
export const InputField: React.FC<InputFieldProps> = ({
	id,
	name,
	value,
	invalid,
	onChange,
	htmlType = "text",
	inputMode,
	autoComplete,
	multiline,
}) => {
	const describedBy = invalid ? `${id}-error` : undefined;

	if (multiline) {
		return (
			<textarea
				id={id}
				name={name}
				className="lottery-form__input lottery-form__input--textarea"
				rows={4}
				value={value}
				aria-invalid={invalid || undefined}
				aria-describedby={describedBy}
				onChange={(event) => onChange(event.target.value)}
			/>
		);
	}

	return (
		<input
			id={id}
			name={name}
			type={htmlType}
			inputMode={inputMode}
			autoComplete={autoComplete}
			className="lottery-form__input"
			value={value}
			aria-invalid={invalid || undefined}
			aria-describedby={describedBy}
			onChange={(event) => onChange(event.target.value)}
		/>
	);
};
