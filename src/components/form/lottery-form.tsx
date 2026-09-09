import * as React from "react";
import { useEffect, useRef, useState } from "react";
import type {
	LanguageCode,
	NormalizedLotteryForm,
	NormalizedLotteryFormField,
} from "../../lib/content/types";
import { MarkdownContent } from "../../lib/content/markdown";
import { Button, LinkButton } from "./button";
import { CheckboxField } from "./fields/checkbox";
import { InputField } from "./fields/input-field";
import { SelectField } from "./fields/select";
import { Field } from "./field";

type LotteryFormProps = {
	form: NormalizedLotteryForm;
	homeUrl: string;
	language: LanguageCode;
};

type FieldValue = string | boolean;

type FormValues = Record<string, FieldValue>;

type Status = "idle" | "sending" | "success" | "failure" | "retrying";

// Kleine UI-Texte, die nicht über das CMS laufen (Select-Platzhalter,
// Honeypot-Label) - je nach Seitensprache.
const UI_TEXT: Record<
	LanguageCode,
	{ selectPlaceholder: string; honeypotLabel: string }
> = {
	de: { selectPlaceholder: "Bitte wählen", honeypotLabel: "Bitte leer lassen" },
	en: {
		selectPlaceholder: "Please select",
		honeypotLabel: "Leave empty",
	},
};

// Netlify Forms prüft serverseitig keine Formate - die E-Mail-Prüfung
// passiert hier, damit keine wertlosen Einträge im Postfach landen.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialValue = (field: NormalizedLotteryFormField): FieldValue =>
	field.type === "CHECKBOX" ? false : "";

const isFieldValid = (
	field: NormalizedLotteryFormField,
	value: FieldValue | undefined,
): boolean => {
	if (!field.required) {
		return true;
	}

	if (field.type === "CHECKBOX") {
		return value === true;
	}

	if (typeof value !== "string" || value.trim().length === 0) {
		return false;
	}

	return field.type === "EMAIL" ? EMAIL_PATTERN.test(value.trim()) : true;
};

// HTML-Attribute je LotteryFieldType; SELECT/CHECKBOX werden von eigenen
// Komponenten gerendert und brauchen die Zuordnung nicht.
const INPUT_ATTRIBUTES_BY_FIELD_TYPE: Record<
	NormalizedLotteryFormField["type"],
	{
		htmlType?: string;
		inputMode?: "text" | "email" | "numeric";
		autoComplete?: string;
		multiline?: boolean;
	}
> = {
	TEXT: {},
	EMAIL: { htmlType: "email", inputMode: "email", autoComplete: "email" },
	NUMBER: { htmlType: "number", inputMode: "numeric" },
	DATE: { htmlType: "date" },
	TEXTAREA: { multiline: true },
	SELECT: {},
	CHECKBOX: {},
};

export const LotteryForm: React.FC<LotteryFormProps> = ({
	form,
	homeUrl,
	language,
}) => {
	const uiText = UI_TEXT[language] ?? UI_TEXT.de;
	const [values, setValues] = useState<FormValues>(() =>
		Object.fromEntries(
			form.fields.map((field) => [field.name, initialValue(field)]),
		),
	);
	const [hasSubmitted, setHasSubmitted] = useState(false);
	const [status, setStatus] = useState<Status>("idle");

	const honeypotRef = useRef<HTMLInputElement>(null);
	const messageRef = useRef<HTMLDivElement>(null);

	const setFieldValue = (name: string, value: FieldValue) => {
		setValues((current) => ({ ...current, [name]: value }));
	};

	const submit = async () => {
		const payload: Record<string, string> = { "form-name": form.name };
		for (const field of form.fields) {
			const value = values[field.name];
			payload[field.name] =
				typeof value === "boolean" ? String(value) : value ?? "";
		}

		const response = await fetch("/", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams(payload).toString(),
		});

		if (!response.ok) {
			throw new Error(`Lottery form submission failed: ${response.status}`);
		}
	};

	const focusFirstInvalid = () => {
		const firstInvalid = form.fields.find(
			(field) => !isFieldValid(field, values[field.name]),
		);

		if (firstInvalid) {
			document.getElementById(`${form.name}-${firstInvalid.name}`)?.focus();
		}
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (status === "sending" || status === "retrying") {
			return;
		}

		setHasSubmitted(true);

		// Honeypot: a bot fills every visible-looking field, a human never
		// sees this one. A filled value is dropped silently, not reported as
		// an error, so a bot gets no signal that it was caught.
		if (honeypotRef.current?.value) {
			return;
		}

		const isValid = form.fields.every((field) =>
			isFieldValid(field, values[field.name]),
		);

		if (!isValid) {
			focusFirstInvalid();
			return;
		}

		try {
			setStatus("sending");
			await submit();
			setStatus("success");
		} catch (error) {
			console.error(error);
			setStatus("failure");
		}
	};

	const handleRetry = async () => {
		if (status === "sending" || status === "retrying") {
			return;
		}

		try {
			setStatus("retrying");
			await submit();
			setStatus("success");
		} catch (error) {
			console.error(error);
			setStatus("failure");
		}
	};

	useEffect(() => {
		if (status !== "success" && status !== "failure") {
			return;
		}

		// Das Header-Menü ist sticky und überlappt das Ziel sonst - der
		// scroll-margin in _forms.scss hält Abstand.
		messageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
	}, [status]);

	if (status === "success") {
		return (
			<div ref={messageRef} className="lottery-form__message" role="status">
				<div className="lottery-form__panel lottery-form__panel--success">
					<span className="lottery-form__panel-badge" aria-hidden="true" />
					<h3 className="lottery-form__panel-title">
						{form.state.success.title}
					</h3>
					{form.state.success.content ? (
						<MarkdownContent content={form.state.success.content} />
					) : null}
				</div>
				<div className="lottery-form__panel-action">
					<LinkButton to={homeUrl}>{form.state.success.button}</LinkButton>
				</div>
			</div>
		);
	}

	return (
		<>
			{status === "failure" || status === "retrying" ? (
				<div ref={messageRef} className="lottery-form__message" role="alert">
					<div className="lottery-form__panel lottery-form__panel--failure">
						<span className="lottery-form__panel-badge" aria-hidden="true" />
						<h3 className="lottery-form__panel-title">
							{form.state.failure.title}
						</h3>
						{form.state.failure.content ? (
							<MarkdownContent content={form.state.failure.content} />
						) : null}
					</div>
					<div className="lottery-form__panel-action">
						<Button
							onClick={handleRetry}
							disabled={status === "retrying"}
							loading={status === "retrying"}
						>
							{status === "retrying"
								? form.state.sending.button
								: form.state.retrying.button}
						</Button>
					</div>
				</div>
			) : null}
			<form
				name={form.name}
				method="POST"
				action="/"
				acceptCharset="UTF-8"
				data-netlify="true"
				data-netlify-honeypot="bot-field"
				className="lottery-form"
				onSubmit={handleSubmit}
				noValidate
			>
				{/* Netlify needs a static form-name input in the built HTML to detect
				    a JS-rendered form (see risk noted in the plan). */}
				<input type="hidden" name="form-name" value={form.name} />
				<p className="lottery-form__honeypot" aria-hidden="true">
					<label htmlFor={`${form.name}-bot-field`}>
						{uiText.honeypotLabel}
						<input
							ref={honeypotRef}
							id={`${form.name}-bot-field`}
							name="bot-field"
							type="text"
							tabIndex={-1}
							autoComplete="off"
						/>
					</label>
				</p>

				{form.fields.map((field) => {
					const id = `${form.name}-${field.name}`;
					const value = values[field.name];
					const error =
						hasSubmitted && !isFieldValid(field, value)
							? form.state.failure.requiredError
							: undefined;

					if (field.type === "CHECKBOX") {
						return (
							<CheckboxField
								key={field.name}
								id={id}
								name={field.name}
								label={field.label}
								checked={value === true}
								required={field.required}
								invalid={Boolean(error)}
								error={error}
								onChange={(checked) => setFieldValue(field.name, checked)}
							/>
						);
					}

					if (field.type === "SELECT") {
						return (
							<Field
								key={field.name}
								id={id}
								label={field.label}
								required={field.required}
								error={error}
							>
								<SelectField
									id={id}
									name={field.name}
									value={typeof value === "string" ? value : ""}
									invalid={Boolean(error)}
									options={field.options}
									placeholder={uiText.selectPlaceholder}
									onChange={(next) => setFieldValue(field.name, next)}
								/>
							</Field>
						);
					}

					const stringValue = typeof value === "string" ? value : "";

					return (
						<Field
							key={field.name}
							id={id}
							label={field.label}
							required={field.required}
							error={error}
						>
							<InputField
								id={id}
								name={field.name}
								value={stringValue}
								invalid={Boolean(error)}
								{...INPUT_ATTRIBUTES_BY_FIELD_TYPE[field.type]}
								onChange={(next) => setFieldValue(field.name, next)}
							/>
						</Field>
					);
				})}

				<div className="lottery-form__submit-row">
					<Button
						type="submit"
						disabled={status === "sending" || status === "retrying"}
						loading={status === "sending" || status === "retrying"}
					>
						{status === "sending" || status === "retrying"
							? form.state.sending.button
							: form.state.idle.button}
					</Button>
				</div>
			</form>
		</>
	);
};
