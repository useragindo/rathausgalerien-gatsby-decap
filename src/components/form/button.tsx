import * as React from "react";

type ButtonProps = {
	type?: "button" | "submit";
	disabled?: boolean;
	loading?: boolean;
	onClick?: () => void;
	children: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
	type = "button",
	disabled,
	loading,
	onClick,
	children,
}) => (
	<button
		type={type}
		className="lottery-form__submit"
		disabled={disabled}
		onClick={onClick}
	>
		{loading ? (
			<span className="lottery-form__spinner" aria-hidden="true" />
		) : null}
		<span>{children}</span>
	</button>
);

type LinkButtonProps = {
	to: string;
	children: React.ReactNode;
};

// Interner Link als plain anchor - das entspricht der Konvention der
// Listing-Karten im Rest der Seite. gatsby <Link> würde auch gehen; ein
// voller Reload nach dem Absenden ist hier gewollt unkritisch.
export const LinkButton: React.FC<LinkButtonProps> = ({ to, children }) => (
	<a className="lottery-form__submit lottery-form__submit--link" href={to}>
		<span>{children}</span>
	</a>
);
