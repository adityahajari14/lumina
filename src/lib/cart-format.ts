import type { ProductConfiguration } from "@/types";
import {
  BLIND_COLOR_LABELS,
  FRAME_COLOR_LABELS,
  OPENING_DIRECTION_LABELS,
} from "@/data/customizations";

export function formatCartConfiguration(config: ProductConfiguration): string {
  const dimension = (whole: number, fraction: string, unit: 'inches' | 'cm') => {
    if (unit === 'cm') return `${whole} cm${fraction && fraction !== '0' ? ` + ${fraction} mm` : ''}`;
    return `${whole}${fraction && fraction !== '0' ? ` ${fraction}` : ''} in`;
  };
  const parts = [`${dimension(config.width, config.widthFraction, config.widthUnit)} ? ${dimension(config.height, config.heightFraction, config.heightUnit)}`];

  if (config.blindColor) parts.push(`Fabric: ${BLIND_COLOR_LABELS[config.blindColor] || config.blindColor}`);
  if (config.frameColor) parts.push(`Frame: ${FRAME_COLOR_LABELS[config.frameColor] || config.frameColor}`);
  if (config.openingDirection) parts.push(OPENING_DIRECTION_LABELS[config.openingDirection] || config.openingDirection);

  return parts.join(" · ");
}
