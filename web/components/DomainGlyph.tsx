import {
  Mountain,
  Plane,
  UsersRound,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { DomainIcon } from "@/lib/data";

const MAP: Record<DomainIcon, LucideIcon> = {
  food: UtensilsCrossed,
  places: Mountain,
  culture: UsersRound,
  travel: Plane,
};

export function DomainGlyph({ icon }: { icon: DomainIcon }) {
  const Icon = MAP[icon];
  return <Icon size={18} strokeWidth={1.75} aria-hidden="true" />;
}
