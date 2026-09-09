import * as React from "react";

type FieldProps = {
	id: string;
	label: React.ReactNode;
	required?: boolean;
	error?: string;
	children: React.ReactNode;
};

// Shared label/required-marker/error chrome around a single form control.
// The checkbox field renders its own layout (label follows the box, not the
// input) so it does not use this wrapper.
export const Field: React.FC<FieldProps> = ({
	id,
	label,
	required,
	error,
	children,
}) => (
	<div className="lottery-form__field">
		<label className="lottery-form__label" htmlFor={id}>
			{label}
			{required ? (
				<span className="lottery-form__required" aria-hidden="true">
					{" "}
					*
				</span>
			) : null}
		</label>
		{children}
		{error ? (
			<p id={`${id}-error`} className="lottery-form__error" role="alert">
				{error}
			</p>
		) : null}
	</div>
);
