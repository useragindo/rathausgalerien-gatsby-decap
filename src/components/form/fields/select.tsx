import * as React from "react";
import type { LotteryInputProps, LotteryOption } from "./types";

type SelectFieldProps = LotteryInputProps & {
	options: LotteryOption[];
	placeholder?: string;
};

export const SelectField: React.FC<SelectFieldProps> = ({
	id,
	name,
	value,
	invalid,
	options,
	placeholder,
	onChange,
}) => (
	<select
		id={id}
		name={name}
		className="lottery-form__input lottery-form__input--select"
		value={value}
		aria-invalid={invalid || undefined}
		aria-describedby={invalid ? `${id}-error` : undefined}
		onChange={(event) => onChange(event.target.value)}
	>
		<option value="">{placeholder}</option>
		{options.map((option) => (
			<option key={option.value} value={option.value}>
				{option.label}
			</option>
		))}
	</select>
);
