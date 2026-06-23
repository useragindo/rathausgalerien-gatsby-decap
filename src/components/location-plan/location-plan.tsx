import * as React from "react";
import { resolveCategoryLabels } from "../../lib/content/categories";
import { MarkdownContent } from "../../lib/content/markdown";
import type {
	ImportedFrontmatter,
	LanguageCode,
	NormalizedCategory,
	NormalizedLocation,
	NormalizedPage,
} from "../../lib/content/types";

type LocationPlanPhoto = NonNullable<ImportedFrontmatter["photos"]>[number];

type LocationPlanProps = {
	page: NormalizedPage;
	locations: NormalizedLocation[];
	categories: NormalizedCategory[];
};

type TooltipState = {
	location: NormalizedLocation;
	labels: string[];
	x: number;
	y: number;
};

type HafasWidget = {
	container?: Element | null;
};

type HafasApi = {
	Config?: {
		Widgets?: HafasWidget[];
	};
	ps?: {
		pub?: (eventName: string, widgets?: HafasWidget[]) => void;
	};
};

type WindowWithHafas = Window & {
	Hafas?: HafasApi;
};

const SVG_PATH = "/misc/view.svg";
const WIDGET_CUSTOMER = "vs_ivb";
const WIDGET_INIT_EVENT = "/widgets/init";
const WIDGET_BASE_URL =
	"https://fahrplan.ivb.at/webapp/staticfiles/hafas-widget-core.1.0.0.js";
const GOOGLE_MAP_URL =
	"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2707.4889601157665!2d11.391680815976578!3d47.265695519457616!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479d6bfb5b2edc3f%3A0xa8ea57a84d2e8c14!2sRathausGalerien!5e0!3m2!1sde!2sat!4v1562579709686!5m2!1sde!2sat";

const LOCATION_PLAN_COPY: Record<
	LanguageCode,
	{
		mapTitle: string;
		directionsTitle: string;
		photoDialogLabel: string;
		closeLabel: string;
		googleMapTitle: string;
		loadingLabel: string;
	}
> = {
	de: {
		mapTitle: "Lageplan",
		directionsTitle: "Anfahrt",
		photoDialogLabel: "Lageplan Foto",
		closeLabel: "Schließen",
		googleMapTitle: "RathausGalerien auf Google Maps",
		loadingLabel: "Lageplan wird geladen …",
	},
	en: {
		mapTitle: "Location map",
		directionsTitle: "Directions",
		photoDialogLabel: "Location map photo",
		closeLabel: "Close",
		googleMapTitle: "RathausGalerien on Google Maps",
		loadingLabel: "Loading location map …",
	},
};

const getPointerPosition = (event: MouseEvent | TouchEvent) => {
	if ("changedTouches" in event && event.changedTouches.length > 0) {
		const touch = event.changedTouches[0];
		return { x: touch.clientX, y: touch.clientY };
	}

	const mouseEvent = event as MouseEvent;
	return { x: mouseEvent.clientX, y: mouseEvent.clientY };
};

const getIvbLanguage = (language: LanguageCode): string =>
	language === "de" ? "de_DE" : "en_GB";

const LocationPlanIvbWidget: React.FC<{ language: LanguageCode }> = ({
	language,
}) => {
	const widgetRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const widgetElement = widgetRef.current;

		if (!widgetElement || typeof window === "undefined") {
			return;
		}

		const widgetWindow = window as WindowWithHafas;
		const widgetApi = widgetWindow.Hafas;
		const widgets = widgetApi?.Config?.Widgets;

		if (widgetApi && widgets?.length) {
			widgets[0].container = widgetElement;
			widgetApi.ps?.pub?.(WIDGET_INIT_EVENT, widgets);
			return;
		}

		const src = `${WIDGET_BASE_URL}?L=${WIDGET_CUSTOMER}&language=${getIvbLanguage(language)}`;
		const existingScript = document.querySelector<HTMLScriptElement>(
			`script[src="${src}"]`,
		);

		if (existingScript) {
			return;
		}

		const script = document.createElement("script");
		script.async = true;
		script.src = src;
		document.body.appendChild(script);
	}, [language]);

	return (
		<div
			ref={widgetRef}
			className="location-plan__ivb"
			data-hfs-widget="true"
			data-hfs-widget-tp="true"
			data-hfs-widget-tp-postform="newtab"
			data-hfs-widget-tp-arralias="RathausGalerien"
		/>
	);
};

const LocationPlanLightbox: React.FC<{
	photo: LocationPlanPhoto;
	copy: (typeof LOCATION_PLAN_COPY)[LanguageCode];
	onClose: () => void;
}> = ({ photo, copy, onClose }) => {
	React.useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [onClose]);

	if (!photo.image) {
		return null;
	}

	return (
		<div
			className="location-plan__lightbox"
			role="dialog"
			aria-modal="true"
			aria-label={photo.label ?? copy.photoDialogLabel}
			onClick={onClose}
		>
			<div
				className="location-plan__lightbox-content"
				onClick={(event) => event.stopPropagation()}
			>
				<button
					className="location-plan__lightbox-close"
					type="button"
					onClick={onClose}
				>
					<span aria-hidden="true">×</span>
					<span className="visually-hidden">{copy.closeLabel}</span>
				</button>
				<img src={photo.image} alt={photo.label ?? ""} />
				{photo.label ? <p>{photo.label}</p> : null}
			</div>
		</div>
	);
};

export const LocationPlan: React.FC<LocationPlanProps> = ({
	page,
	locations,
	categories,
}) => {
	const [svg, setSvg] = React.useState<string>();
	const [tooltip, setTooltip] = React.useState<TooltipState>();
	const copy = LOCATION_PLAN_COPY[page.language];
	const [activePhoto, setActivePhoto] = React.useState<LocationPlanPhoto>();
	const svgContainerRef = React.useRef<HTMLDivElement>(null);

	const pageLocations = React.useMemo(
		() =>
			locations.filter(
				(location) =>
					location.language === page.language && location.frontmatter.viewId,
			),
		[locations, page.language],
	);
	const photos = React.useMemo(
		() =>
			(page.frontmatter.photos ?? []).filter(
				(photo) => photo?.viewId && photo.image,
			),
		[page.frontmatter.photos],
	);

	React.useEffect(() => {
		let isMounted = true;

		fetch(SVG_PATH)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Unable to load ${SVG_PATH}`);
				}
				return response.text();
			})
			.then((svgContent) => {
				if (isMounted) {
					setSvg(svgContent);
				}
			})
			.catch(() => {
				if (isMounted) {
					setSvg(undefined);
				}
			});

		return () => {
			isMounted = false;
		};
	}, []);

	React.useEffect(() => {
		const container = svgContainerRef.current;

		if (!container || !svg) {
			return undefined;
		}

		const cleanups: Array<() => void> = [];
		let activeElement: Element | undefined;
		let touchStart = 0;

		const setActiveElement = (element?: Element) => {
			activeElement?.classList.remove("is-active");
			activeElement = element;
			activeElement?.classList.add("is-active");
		};

		for (const location of pageLocations) {
			const element = container.querySelector(
				`#${location.frontmatter.viewId}`,
			);

			if (!element) {
				continue;
			}

			element.classList.add("location-plan__svg-location");
			const labels = resolveCategoryLabels(
				location.frontmatter.categories,
				categories,
				page.language,
				location.group === "culinary" ? "Gastronomie" : "Shop",
			);

			const showTooltip = (event: MouseEvent | TouchEvent) => {
				event.preventDefault();
				setActiveElement(element);
				setTooltip({
					location,
					labels,
					...getPointerPosition(event),
				});
			};

			const moveTooltip = (event: MouseEvent | TouchEvent) => {
				event.preventDefault();
				setTooltip((current) =>
					current ? { ...current, ...getPointerPosition(event) } : current,
				);
			};

			const hideTooltip = (event?: Event) => {
				event?.preventDefault();
				setActiveElement(undefined);
				setTooltip(undefined);
			};

			const onTouchStart = ((event: TouchEvent) => {
				touchStart = Date.now();
				showTooltip(event);
			}) as EventListener;

			const onTouchEnd = ((event: TouchEvent) => {
				hideTooltip(event);
				if (Date.now() - touchStart < 300) {
					window.location.href = location.path;
				}
			}) as EventListener;

			const onClick = ((event: MouseEvent) => {
				event.preventDefault();
				window.location.href = location.path;
			}) as EventListener;
			const onMouseOver = showTooltip as EventListener;
			const onMouseMove = moveTooltip as EventListener;
			const onMouseOut = hideTooltip as EventListener;

			element.addEventListener("mouseover", onMouseOver);
			element.addEventListener("mousemove", onMouseMove);
			element.addEventListener("mouseout", onMouseOut);
			element.addEventListener("touchstart", onTouchStart, { passive: false });
			element.addEventListener("touchmove", onMouseMove, { passive: false });
			element.addEventListener("touchend", onTouchEnd, { passive: false });
			element.addEventListener("click", onClick);

			cleanups.push(() => {
				element.classList.remove("location-plan__svg-location", "is-active");
				element.removeEventListener("mouseover", onMouseOver);
				element.removeEventListener("mousemove", onMouseMove);
				element.removeEventListener("mouseout", onMouseOut);
				element.removeEventListener("touchstart", onTouchStart);
				element.removeEventListener("touchmove", onMouseMove);
				element.removeEventListener("touchend", onTouchEnd);
				element.removeEventListener("click", onClick);
			});
		}

		for (const photo of photos) {
			const element = container.querySelector(`#${photo.viewId}`);

			if (!element) {
				continue;
			}

			element.classList.add("location-plan__svg-photo");
			const onClick = (event: MouseEvent | TouchEvent) => {
				event.preventDefault();
				setActivePhoto(photo);
			};

			element.addEventListener("click", onClick as EventListener);
			element.addEventListener("touchend", onClick as EventListener, {
				passive: false,
			});

			cleanups.push(() => {
				element.classList.remove("location-plan__svg-photo");
				element.removeEventListener("click", onClick as EventListener);
				element.removeEventListener("touchend", onClick as EventListener);
			});
		}

		return () => {
			setActiveElement(undefined);
			cleanups.forEach((cleanup) => cleanup());
		};
	}, [categories, page.language, pageLocations, photos, svg]);

	return (
		<div className="location-plan">
			<section
				className="location-plan__section"
				aria-labelledby="location-plan-title"
			>
				<header className="location-plan__header">
					<p className="location-plan__eyebrow">RathausGalerien</p>
					<h2 id="location-plan-title">{copy.mapTitle}</h2>
				</header>
				<div className="location-plan__map">
					{svg ? (
						<div
							ref={svgContainerRef}
							className="location-plan__svg"
							dangerouslySetInnerHTML={{ __html: svg }}
						/>
					) : (
						<p className="location-plan__fallback">{copy.loadingLabel}</p>
					)}
					{tooltip ? (
						<div
							className="location-plan__tooltip"
							style={{ left: tooltip.x, top: tooltip.y }}
						>
							<strong>{tooltip.location.title}</strong>
							<span>{tooltip.labels.join(", ")}</span>
						</div>
					) : null}
				</div>
			</section>

			<section className="location-plan__section location-plan__section--transport">
				<div className="location-plan__text">
					<h2>{copy.directionsTitle}</h2>
					<MarkdownContent content={page.frontmatter.traffic_information} />
				</div>
				<div className="location-plan__transport-grid">
					<div className="location-plan__google-map">
						<iframe
							title={copy.googleMapTitle}
							src={GOOGLE_MAP_URL}
							loading="lazy"
							allowFullScreen
						/>
					</div>
					<LocationPlanIvbWidget language={page.language} />
				</div>
			</section>

			{activePhoto ? (
				<LocationPlanLightbox
					photo={activePhoto}
					copy={copy}
					onClose={() => setActivePhoto(undefined)}
				/>
			) : null}
		</div>
	);
};
