import React, { Component, createRef } from "react";
import CMS from "decap-cms-app";

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
	`;
	document.head.appendChild(style);
};

class ColorTokenSelect extends Component {
	state = {
		isOpen: false,
		schemeColors: null,
	};

	containerRef = createRef();

	componentDidMount() {
		injectStyles();
		document.addEventListener("mousedown", this._handleClickOutside);
		this._loadSchemeColors();
	}

	componentWillUnmount() {
		document.removeEventListener("mousedown", this._handleClickOutside);
	}

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
			const colors = schemeResult?.entry?.data?.colors;
			if (colors && typeof colors === "object") {
				const map = {};
				for (const [slot, value] of Object.entries(colors)) {
					if (typeof value === "string" && value.trim()) {
						map[slot] = value.trim();
					}
				}
				if (Object.keys(map).length > 0) {
					this.setState({ schemeColors: map });
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
		const { value, options = [], className } = this.props;
		const { isOpen } = this.state;
		const selected =
			options.find((o) => o.value === value) ?? options[0];

		const selectedColor = selected ? this._resolveColor(selected) : null;

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