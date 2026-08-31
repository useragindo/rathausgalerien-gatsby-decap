import CMS from "decap-cms-app";
import UUID from "./widgets/uuid";
import ColorTokenSelect from "./widgets/color-token-select";

CMS.registerWidget("uuid", UUID);
CMS.registerWidget("color-token-select", ColorTokenSelect);

if (typeof document !== "undefined") {
	const style = document.createElement("style");
	style.textContent = `
		/* Visual separator in the sidebar between content types and
		   configuration entries (Blocks, Farbschemas, Einstellungen). */
		li [data-testid="blocks"] {
			border-top: 1px solid #c5d2dd;
			margin-top: 8px;
			padding-top: 8px;
		}
	`;
	document.head.appendChild(style);
}
