"use client";
import { useLanguage } from "@/hooks/use-language";
export interface Template {
  id: string;
  name: string;
  size: string;
  aspectRatio: number;
  orientation: "portrait" | "landscape";
  photoCount: number;
  layout: "vertical" | "grid" | "single";
  hasBorders?: boolean;
  flattened?: boolean;
}
export function LayoutMiniature({ template }: { template: Template }) {
  return (
    <span
      className={`layout-miniature ${template.layout}`}
      style={{ aspectRatio: template.aspectRatio }}
      aria-hidden="true"
    >
      {Array.from({ length: template.photoCount }, (_, i) => (
        <span key={i} />
      ))}
    </span>
  );
}
export default function TemplateSelector({
  templates,
  selectedTemplate,
  onSelectTemplate,
  disabled = false,
}: {
  templates: Template[];
  selectedTemplate: string;
  onSelectTemplate: (id: string) => void;
  disabled?: boolean;
}) {
  const { t, copy } = useLanguage();
  return (
    <div className="layout-options">
      {templates.map((template, index) => (
        <button
          key={template.id}
          type="button"
          className="layout-option"
          aria-pressed={selectedTemplate === template.id}
          disabled={disabled}
          onClick={() => onSelectTemplate(template.id)}
        >
          <LayoutMiniature template={template} />
          <span>
            <strong>{copy.layoutNames[index]}</strong>
            <small>
              {template.photoCount}{" "}
              {template.photoCount === 1 ? t.photo : t.photos} · {template.size}
            </small>
          </span>
          {selectedTemplate === template.id && (
            <span className="selected-mark" aria-hidden="true">
              ✓
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
