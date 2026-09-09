import * as React from "react";
import { MarkdownContent } from "../../../lib/content/markdown";

type CheckboxFieldProps = {
	id: string;
	name: string;
	label: string;
	checked: boolean;
	required?: boolean;
	invalid?: boolean;
	error?: string;
	onChange: (checked: boolean) => void;
};

// Renders its own label (checkbox first, label follows) instead of using the
// shared `Field` wrapper, and runs the label through the markdown renderer so
// editors can link to the terms page from the CMS text, as on the old site.
export const CheckboxField: React.FC<CheckboxFieldProps> = ({
	id,
	name,
	label,
	checked,
	required,
	invalid,
	error,
	onChange,
}) => (
	<div className="lottery-form__field lottery-form__field--checkbox">
		<label className="lottery-form__checkbox-label" htmlFor={id}>
			<input
				id={id}
				name={name}
				type="checkbox"
				className="lottery-form__checkbox-input"
				checked={checked}
				aria-invalid={invalid || undefined}
				aria-describedby={invalid ? `${id}-error` : undefined}
				onChange={(event) => onChange(event.target.checked)}
			/>
			<span className="lottery-form__checkbox-box" aria-hidden="true" />
			<span className="lottery-form__checkbox-text">
				<MarkdownContent content={label} />
				{required ? (
					<span className="lottery-form__required" aria-hidden="true">
						{" "}
						*
					</span>
				) : null}
			</span>
		</label>
		{error ? (
			<p id={`${id}-error`} className="lottery-form__error" role="alert">
				{error}
			</p>
		) : null}
	</div>
);
