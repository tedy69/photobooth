"use client";
import { templateGeometry } from "@/lib/composition";
import type { Template } from "./template-selector";
export default function StripPreview({
  template,
  photos,
  caption,
}: {
  template: Template;
  photos: string[];
  caption: string;
}) {
  const geometry = templateGeometry(template);
  return (
    <div
      className="strip-preview"
      style={{ aspectRatio: template.aspectRatio }}
      aria-label={caption}
    >
      {geometry.slots.map((slot, i) => (
        <div
          key={i}
          className="preview-slot"
          style={{
            left: `${(slot.x / geometry.width) * 100}%`,
            top: `${(slot.y / geometry.height) * 100}%`,
            width: `${(slot.width / geometry.width) * 100}%`,
            height: `${(slot.height / geometry.height) * 100}%`,
          }}
        >
          {photos[i] ? (
            <img src={photos[i]} alt={`${caption} ${i + 1}`} />
          ) : (
            <span>{String(i + 1).padStart(2, "0")}</span>
          )}
        </div>
      ))}
      <span className="strip-caption">Photo Booth</span>
    </div>
  );
}
