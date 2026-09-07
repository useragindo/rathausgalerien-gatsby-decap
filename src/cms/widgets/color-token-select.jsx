import React, { Component, createRef } from "react";
import { Map as ImMap, List as ImList } from "immutable";
import CMS from "decap-cms-app";

const toOption = (raw) => {
	if (typeof raw === "string") {
		return { label: raw, value: raw };
	}
	if (ImMap.isMap(raw)) {
		return raw.toJS();
	}
	return raw;
};

const readOptions = (props) => {
	if (Array.isArray(props.options) && props.options.length > 0) {
		return props.options;
	}
	if (props.field && typeof props.field.get === "function") {
		const fieldOptions = props.field.get("options");
		if (ImList.isList(fieldOptions)) {
			return fieldOptions.map(toOption).toArray();
		}
		if (Array.isArray(fieldOptions)) {
			return fieldOptions.map(toOption);
		}
	}
	return [];
};

const isRelevantEntry = (entry) => {
	if (!entry) return false;
	const collectionRaw =
		typeof entry.get === "function" ? entry.get("collection") : entry.collection;
	const collectionName =
		typeof collectionRaw === "string"
			? collectionRaw
			: collectionRaw && typeof collectionRaw.get === "function"
				? collectionRaw.get("name")
				: null;
	return collectionName === "settings" || collectionName === "color-schemes";
};

const STYLE_ID = "color-token-select-styles";

const injectStyles = () => {
	if (typeof document === "undefined") return;
	if (document.getElementById(STYLE_ID)) return;

	const style = document.createElement("style");
	style.id = STYLE_ID;
	style.textContent = `
		.color-token-select {
			position: relative;
			display: block;
			font: inherit;
		}
		.color-token-select__trigger {
			align-items: center;
			background: #fff;
			border: 1px solid #c5d2dd;
			border-radius: 4px;
			color: inherit;
			cursor: pointer;
			display: flex;
			font: inherit;
			gap: 10px;
			padding: 8px 12px;
			text-align: left;
			width: 100%;
		}
		.color-token-select__trigger:focus-visible {
			border-color: #5e9eff;
			outline: 2px solid rgba(94, 158, 255, 0.4);
			outline-offset: 1px;
		}
		.color-token-select__swatch {
			background-image: linear-gradient(45deg, #e6ebef 25%, transparent 25%, transparent 75%, #e6ebef 75%, #e6ebef), linear-gradient(45deg, #e6ebef 25%, transparent 25%, transparent 75%, #e6ebef 75%, #e6ebef);
			background-position: 0 0, 6px 6px;
			background-size: 12px 12px;
			border: 1px solid rgba(0, 0, 0, 0.18);
			border-radius: 50%;
			display: inline-block;
			flex: 0 0 auto;
			height: 18px;
			width: 18px;
		}
		.color-token-select__swatch--filled {
			background-image: none;
		}
		.color-token-select__label {
			flex: 1 1 auto;
		}
		.color-token-select__caret {
			color: #6b7785;
			flex: 0 0 auto;
		}
		.color-token-select__menu {
			background: #fff;
			border: 1px solid #c5d2dd;
			border-radius: 4px;
			box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
			left: 0;
			list-style: none;
			margin: 4px 0 0;
			max-height: 280px;
			overflow-y: auto;
			padding: 4px 0;
			position: absolute;
			right: 0;
			top: 100%;
			z-index: 1000;
		}
		.color-token-select__option {
			align-items: center;
			cursor: pointer;
			display: flex;
			gap: 10px;
			padding: 8px 12px;
		}
		.color-token-select__option:hover,
		.color-token-select__option:focus-visible {
			background: #f5f8fa;
			outline: none;
		}
		.color-token-select__option.is-selected {
			background: #e6f3ff;
		}
		.color-token-select__header {
			align-items: center;
			background: #f5f8fa;
			border-bottom: 1px solid #e6ebef;
			color: #6b7785;
			display: flex;
			font-size: 11px;
			font-weight: 600;
			letter-spacing: 0.04em;
			padding: 6px 12px;
			text-transform: uppercase;
		}
		.color-token-select__header.is-empty {
			background: #fff7e6;
			border-bottom-color: #f0d9a8;
			color: #8a6d3b;
		}
		.color-token-select__header-dot {
			background: var(--header-color, #c5d2dd);
			border: 1px solid rgba(0, 0, 0, 0.12);
			border-radius: 50%;
			display: inline-block;
			height: 10px;
			margin-right: 8px;
			width: 10px;
		}
		.color-token-select__header.is-empty .color-token-select__header-dot {
			background: repeating-linear-gradient(
				45deg,
				#d9c089 0,
				#d9c089 3px,
				#fff7e6 3px,
				#fff7e6 6px
			);
		}
	`;
	document.head.appendChild(style);
};

class ColorTokenSelect extends Component {
	state = {
		isOpen: false,
		schemeColors: null,
		schemeName: null,
	};

	containerRef = createRef();
	_isMounted = false;

	componentDidMount() {
		this._isMounted = true;
		injectStyles();
		document.addEventListener("mousedown", this._handleClickOutside);
		this._loadSchemeColors();
		this._registerSchemeListener();
	}

	componentWillUnmount() {
		this._isMounted = false;
		document.removeEventListener("mousedown", this._handleClickOutside);
		this._unregisterSchemeListener();
	}

	_registerSchemeListener = () => {
		if (typeof CMS.registerEventListener !== "function") return;
		this._schemeListener = ({ entry } = {}) => {
			if (isRelevantEntry(entry)) {
				this._loadSchemeColors();
			}
		};
		try {
			CMS.registerEventListener({
				name: "postSave",
				handler: this._schemeListener,
			});
		} catch {
			// Event API missing or invalid name — silently fall back to mount-time
			// load only.
		}
	};

	_unregisterSchemeListener = () => {
		if (
			typeof CMS.removeEventListener === "function" &&
			this._schemeListener
		) {
			try {
				CMS.removeEventListener({
					name: "postSave",
					handler: this._schemeListener,
				});
			} catch {
				// ignore
			}
		}
		this._schemeListener = null;
	};

	_handleClickOutside = (event) => {
		if (
			this.containerRef.current &&
			!this.containerRef.current.contains(event.target)
		) {
			this.setState({ isOpen: false });
		}
	};

	_loadSchemeColors = async () => {
		try {
			const backend =
				typeof CMS.getBackend === "function" ? CMS.getBackend() : null;
			if (!backend || typeof backend.getEntry !== "function") return;

			const themeResult = await backend.getEntry("settings", "theme");
			const activeScheme = themeResult?.entry?.data?.active_scheme;
			if (!activeScheme) return;

			const schemeResult = await backend.getEntry(
				"color-schemes",
				activeScheme,
			);
			const data = schemeResult?.entry?.data;
			const colors = data?.colors;
			if (colors && typeof colors === "object") {
				const map = {};
				for (const [slot, value] of Object.entries(colors)) {
					if (typeof value === "string" && value.trim()) {
						map[slot] = value.trim();
					}
				}
				if (this._isMounted) {
					this.setState({
						schemeColors: map,
						schemeName: data?.name || activeScheme,
					});
				}
			}
		} catch {
			// Silent fallback to the config-supplied swatch colors.
		}
	};

	_toggleOpen = () => {
		this.setState((s) => ({ isOpen: !s.isOpen }));
	};

	_select = (option) => {
		this.props.onChange(option.value);
		this.setState({ isOpen: false });
	};

	_resolveColor = (option) => {
		const { schemeColors } = this.state;
		if (
			schemeColors &&
			option.value &&
			schemeColors[option.value]
		) {
			return schemeColors[option.value];
		}
		return option.color || null;
	};

	render() {
		const { value, className } = this.props;
		const { isOpen, schemeColors, schemeName } = this.state;
		const options = readOptions(this.props);
		const selected =
			options.find((o) => o.value === value) ?? options[0];

		const selectedColor = selected ? this._resolveColor(selected) : null;
		const schemeLoaded = Boolean(schemeName && schemeColors);
		const headerDotColor = schemeLoaded
			? schemeColors.bg || schemeColors.c1 || null
			: null;

		return (
			<div
				ref={this.containerRef}
				className={["color-token-select", className].filter(Boolean).join(" ")}
			>
				<button
					type="button"
					className="color-token-select__trigger"
					aria-haspopup="listbox"
					aria-expanded={isOpen}
					onClick={this._toggleOpen}
				>
					<span
						className={[
							"color-token-select__swatch",
							selectedColor ? "color-token-select__swatch--filled" : "",
						]
							.filter(Boolean)
							.join(" ")}
						style={selectedColor ? { backgroundColor: selectedColor } : undefined}
						aria-hidden="true"
					/>
					<span className="color-token-select__label">
						{selected ? selected.label : "–"}
					</span>
					<span className="color-token-select__caret" aria-hidden="true">
						▾
					</span>
				</button>
				{isOpen ? (
					<ul className="color-token-select__menu" role="listbox">
						<li
							className={[
								"color-token-select__header",
								schemeLoaded ? "" : "is-empty",
							]
								.filter(Boolean)
								.join(" ")}
							aria-hidden="true"
						>
							<span
								className="color-token-select__header-dot"
								style={
									headerDotColor
										? { "--header-color": headerDotColor }
										: undefined
								}
							/>
							<span>
								{schemeLoaded
									? `Schema: ${schemeName}`
									: "Kein Schema aktiv"}
							</span>
						</li>
						{options.map((option) => {
							const swatchColor = this._resolveColor(option);
							const isSelected = option.value === value;
							return (
								<li
									key={option.value}
									role="option"
									aria-selected={isSelected}
									className={[
										"color-token-select__option",
										isSelected ? "is-selected" : "",
									]
										.filter(Boolean)
										.join(" ")}
									onClick={() => this._select(option)}
									onKeyDown={(event) => {
										if (event.key === "Enter" || event.key === " ") {
											event.preventDefault();
											this._select(option);
										}
									}}
									tabIndex={0}
								>
									<span
										className={[
											"color-token-select__swatch",
											swatchColor ? "color-token-select__swatch--filled" : "",
										]
											.filter(Boolean)
											.join(" ")}
										style={
											swatchColor ? { backgroundColor: swatchColor } : undefined
										}
										aria-hidden="true"
									/>
									<span className="color-token-select__label">
										{option.label}
									</span>
								</li>
							);
						})}
					</ul>
				) : null}
			</div>
		);
	}
}

export default ColorTokenSelect;