import * as React from "react";
import type { ImportedImage } from "../../lib/content/types";

type ImageSliderProps = {
	images: ImportedImage[];
	className?: string;
};

export const ImageSlider: React.FC<ImageSliderProps> = ({
	images,
	className = "",
}) => {
	const validImages = images.filter((image) => image.image);
	const [currentIndex, setCurrentIndex] = React.useState(0);

	if (validImages.length === 0) {
		return null;
	}

	const goToPrevious = (): void => {
		setCurrentIndex((index) =>
			index === 0 ? validImages.length - 1 : index - 1,
		);
	};

	const goToNext = (): void => {
		setCurrentIndex((index) =>
			index === validImages.length - 1 ? 0 : index + 1,
		);
	};

	return (
		<div className={`image-slider ${className}`.trim()}>
			<div className="image-slider__track">
				{validImages.map((image, index) => (
					<div
						key={`${image.image}-${index}`}
						className="image-slider__slide"
						aria-hidden={index !== currentIndex}
					>
						<img
							src={image.image ?? undefined}
							alt={image.alt ?? ""}
							loading="lazy"
						/>
					</div>
				))}
			</div>

			{validImages.length > 1 ? (
				<>
					<button
						type="button"
						className="image-slider__button image-slider__button--prev"
						onClick={goToPrevious}
						aria-label="Vorheriges Bild"
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<polyline points="15 18 9 12 15 6" />
						</svg>
					</button>
					<button
						type="button"
						className="image-slider__button image-slider__button--next"
						onClick={goToNext}
						aria-label="Nächstes Bild"
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<polyline points="9 18 15 12 9 6" />
						</svg>
					</button>
				</>
			) : null}
		</div>
	);
};
