export const PLACE_TYPES = [
  { value: "RESTAURANT", label: "Restaurant", icon: "🍽️" },
  { value: "CAFE", label: "Cafe", icon: "☕" },
  { value: "DOG_PARK", label: "Dog Park", icon: "🌳" },
  { value: "PET_STORE", label: "Pet Store", icon: "🏪" },
  { value: "VET", label: "Veterinarian", icon: "🏥" },
  { value: "GROOMER", label: "Groomer", icon: "✂️" },
  { value: "BREWERY", label: "Brewery", icon: "🍺" },
  { value: "HOTEL", label: "Hotel", icon: "🏨" },
  { value: "BEACH", label: "Beach", icon: "🏖️" },
  { value: "TRAIL", label: "Trail", icon: "🥾" },
  { value: "OTHER", label: "Other", icon: "📍" },
] as const;

export const DOG_SIZES = [
  { value: "SMALL", label: "Small (under 25 lbs)" },
  { value: "MEDIUM", label: "Medium (25-50 lbs)" },
  { value: "LARGE", label: "Large (50-100 lbs)" },
  { value: "XLARGE", label: "Extra Large (100+ lbs)" },
] as const;

export const YES_NO_FEATURES = [
  { key: "hasWater", label: "Water Bowls Available", icon: "💧" },
  { key: "hasFreeTreats", label: "Free Treats", icon: "🦴" },
  { key: "patioFriendly", label: "Patio Friendly", icon: "☀️" },
  { key: "canComeInside", label: "Dogs Can Come Inside", icon: "🏠" },
  { key: "hasWasteStations", label: "Waste Stations", icon: "🗑️" },
  { key: "isOffLeashOk", label: "Off-Leash OK", icon: "🐕" },
  { key: "hasFencedArea", label: "Fenced Area", icon: "🔒" },
  { key: "hasParking", label: "Parking Available", icon: "🅿️" },
  { key: "hasDogMenu", label: "Dog Menu", icon: "📋" },
] as const;

export const SUB_RATINGS = {
  general: [
    { key: "staffFriendliness", label: "Staff Friendliness to Dogs" },
    { key: "dogFriendliness", label: "Dog Friendliness" },
    { key: "treatsQuality", label: "Treats Quality" },
    { key: "waterAvailability", label: "Water Availability" },
    { key: "safetyRating", label: "Safety" },
    { key: "spaceRating", label: "Space for Dogs" },
  ],
  DOG_PARK: [
    { key: "cleanliness", label: "Cleanliness" },
    { key: "dogFriendliness", label: "Dog Friendliness" },
    { key: "dogParentRating", label: "Dog Parent Rating" },
    { key: "safetyRating", label: "Safety" },
    { key: "spaceRating", label: "Space & Room to Play" },
  ],
} as const;

export function getPlaceIcon(type: string): string {
  return PLACE_TYPES.find((t) => t.value === type)?.icon ?? "📍";
}

export function getPlaceLabel(type: string): string {
  return PLACE_TYPES.find((t) => t.value === type)?.label ?? type;
}
