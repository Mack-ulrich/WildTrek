export interface GearList {
  id: string
  name: string
  activity: "fishing" | "hunting" | "outdoors"
  description: string
  sections: { title: string; items: string[] }[]
}

export const GEAR_LISTS: GearList[] = [
  {
    id: "inshore-wade",
    name: "Inshore Wade Fishing",
    activity: "fishing",
    description: "Everything for a day wading the flats for trout and reds.",
    sections: [
      { title: "Licenses & safety", items: ["Fishing license + saltwater endorsement", "Red drum & trout tags", "Stingray guards or wading boots", "Wading belt with back support", "Inflatable PFD", "Phone in dry bag"] },
      { title: "Tackle", items: ["7' medium rod & reel (spooled)", "Fluorocarbon leader 20 lb", "Jigheads 1/8 & 1/4 oz", "Soft plastics (dark + light)", "Gold weedless spoon", "Topwater plug", "Pliers & line cutter"] },
      { title: "Comfort", items: ["Sun shirt & buff", "Polarized sunglasses", "Hat", "Reef-safe sunscreen", "Water (1 gal)", "Snacks"] },
      { title: "Keeping fish", items: ["Stringer with float", "Measuring device", "Cooler with ice"] },
    ],
  },
  {
    id: "offshore",
    name: "Offshore Day Trip",
    activity: "fishing",
    description: "Guests' checklist for a guided blue-water trip.",
    sections: [
      { title: "Licenses", items: ["Fishing license + saltwater endorsement", "ID"] },
      { title: "Personal", items: ["Seasickness medicine (take the night before)", "Non-marking shoes", "Rain jacket", "Sunscreen", "Polarized sunglasses", "Hat", "Change of clothes"] },
      { title: "Food & drink", items: ["Water & electrolytes", "Lunch & snacks", "Large cooler for fillets"] },
      { title: "Extras", items: ["Cash for crew tip", "Camera or GoPro", "Fish bags"] },
    ],
  },
  {
    id: "bass-boat",
    name: "Freshwater Bass Day",
    activity: "fishing",
    description: "Lake day checklist for bass and crappie.",
    sections: [
      { title: "Licenses & safety", items: ["Fishing license (freshwater)", "Life jackets", "Kill switch lanyard", "Boat registration"] },
      { title: "Tackle", items: ["Baitcaster & spinning rods", "Crankbaits", "Texas-rig worms & hooks", "Jigs", "Topwater", "Scale or culling system"] },
      { title: "Comfort", items: ["Rain gear", "Sunscreen", "Water & snacks"] },
    ],
  },
  {
    id: "deer-blind",
    name: "Deer Hunt (Rifle)",
    activity: "hunting",
    description: "Rifle-season whitetail checklist for the blind or stand.",
    sections: [
      { title: "Licenses & legal", items: ["Hunting license with deer tags", "Hunter education certificate", "Landowner permission / lease contract", "Pen for harvest log"] },
      { title: "Weapon", items: ["Rifle (sighted in)", "Ammunition", "Shooting sticks or rest", "Rifle sling"] },
      { title: "Optics", items: ["Binoculars", "Rangefinder", "Headlamp (red light)"] },
      { title: "Clothing", items: ["Base layer", "Insulated jacket", "Gloves & beanie", "Blaze orange (if public land)", "Quiet boots"] },
      { title: "Field dressing", items: ["Sharp knife", "Gloves", "Game bags", "Zip ties", "Drag rope", "Paper towels & water"] },
    ],
  },
  {
    id: "waterfowl",
    name: "Waterfowl Hunt",
    activity: "hunting",
    description: "Marsh or field duck and goose hunt.",
    sections: [
      { title: "Licenses & stamps", items: ["Hunting license", "Migratory Game Bird Endorsement", "Federal Duck Stamp (signed)", "HIP certification"] },
      { title: "Gear", items: ["Shotgun (plugged to 3 shells)", "Non-toxic shot", "Waders", "Duck call", "Headlamp", "Blind bag"] },
      { title: "Clothing", items: ["Camo jacket", "Gloves", "Face mask or paint", "Hand warmers"] },
    ],
  },
  {
    id: "hog-night",
    name: "Night Hog Hunt",
    activity: "hunting",
    description: "Thermal and night hunting essentials.",
    sections: [
      { title: "Legal", items: ["Hunting license", "Landowner permission"] },
      { title: "Gear", items: ["Rifle with thermal or NV scope", "Spare batteries", "Red/green headlamp", "Shooting sticks", "Ear protection"] },
      { title: "Field care", items: ["Heavy gloves", "Knife & saw", "Game bags", "Cooler with ice"] },
    ],
  },
  {
    id: "backpacking",
    name: "Desert Backpacking",
    activity: "outdoors",
    description: "Big Bend and Trans-Pecos overnight gear list.",
    sections: [
      { title: "Navigation & safety", items: ["Map & compass", "Satellite messenger", "First aid kit", "Permits"] },
      { title: "Water", items: ["1 gal per person per day", "Filter", "Electrolytes"] },
      { title: "Shelter & sleep", items: ["Tent", "Sleeping bag (rated for 30°F)", "Sleeping pad"] },
      { title: "Clothing", items: ["Sun hoody", "Wide-brim hat", "Warm layer for night", "Hiking boots"] },
    ],
  },
]
