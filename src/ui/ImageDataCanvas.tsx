import { useRef, useEffect, type ComponentPropsWithoutRef } from "react";

export type ImageDataCanvasProps = {
	readonly imageData: ImageData;
} & ComponentPropsWithoutRef<"canvas">;

export function ImageDataCanvas({
	imageData,
	...canvasProps
}: ImageDataCanvasProps): React.ReactNode {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}
		canvas.width = imageData.width;
		canvas.height = imageData.height;
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			return;
		}
		ctx.putImageData(imageData, 0, 0);
	}, [imageData]);

	return (
		<canvas
			{...canvasProps}
			style={{ ...canvasProps.style, imageRendering: "pixelated" }}
			ref={canvasRef}
		/>
	);
}
