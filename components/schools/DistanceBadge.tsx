"use client";

import { Badge } from "@/components/ui/Badge";
import { MapPinIcon } from "@/components/ui/Icon";
import { useUserPosition } from "@/components/location/useUserPosition";
import { distanceKm, formatDistance } from "@/lib/utils";

interface Props {
  lat: number | null;
  lng: number | null;
}

export function DistanceBadge({ lat, lng }: Props) {
  const pos = useUserPosition();
  if (lat == null || lng == null || !pos) return null;
  const km = distanceKm(pos.lat, pos.lng, lat, lng);
  return (
    <Badge className="bg-cream-dark text-navy/70">
      <MapPinIcon size={12} /> {formatDistance(km)}
    </Badge>
  );
}
