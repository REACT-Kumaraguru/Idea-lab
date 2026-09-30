/**
 * Comprehensive master catalog of lab consumables, raw materials, and components
 * available in the AICTE IDEA Lab for prototype fabrication and testing.
 */

export const LAB_CONSUMABLE_CATEGORIES = [
  {
    id: "3d-printing",
    name: "3D Printing & Additive Fabrication",
    icon: "Layers",
    items: [
      { id: "c-pla-white", name: "PLA Filament 1.75mm (White)", unit: "Grams (g)", defaultQty: 50, standardPack: "Spool (1kg)" },
      { id: "c-pla-black", name: "PLA Filament 1.75mm (Black)", unit: "Grams (g)", defaultQty: 50, standardPack: "Spool (1kg)" },
      { id: "c-pla-color", name: "PLA Filament 1.75mm (Assorted Colors)", unit: "Grams (g)", defaultQty: 50, standardPack: "Spool (1kg)" },
      { id: "c-petg", name: "PETG Filament 1.75mm (Industrial)", unit: "Grams (g)", defaultQty: 50, standardPack: "Spool (1kg)" },
      { id: "c-abs", name: "ABS Filament 1.75mm (High-Temp)", unit: "Grams (g)", defaultQty: 50, standardPack: "Spool (1kg)" },
      { id: "c-tpu", name: "TPU Flexible Filament 1.75mm (95A)", unit: "Grams (g)", defaultQty: 30, standardPack: "Spool (500g)" },
      { id: "c-bed-adhesive", name: "3D Printing Bed Adhesive / PVA Glue", unit: "Pcs", defaultQty: 1, standardPack: "Bottle (100ml)" },
      { id: "c-brass-nozzle", name: "Brass Extruder Nozzle 0.4mm", unit: "Pcs", defaultQty: 1, standardPack: "Individual" },
      { id: "c-ipa-wipes", name: "Isopropyl Alcohol (IPA 99%) Cleaning Wipes", unit: "Wipes", defaultQty: 5, standardPack: "Pack" },
    ],
  },
  {
    id: "laser-cutting",
    name: "Laser Cutting & Sheet Stock",
    icon: "Scissors",
    items: [
      { id: "c-acrylic-3mm-clear", name: "Cast Acrylic Sheet 3mm (Transparent)", unit: "Sheets (300x200mm)", defaultQty: 1, standardPack: "Sheet" },
      { id: "c-acrylic-3mm-black", name: "Cast Acrylic Sheet 3mm (Black/Opaque)", unit: "Sheets (300x200mm)", defaultQty: 1, standardPack: "Sheet" },
      { id: "c-acrylic-5mm", name: "Cast Acrylic Sheet 5mm (Heavy Duty)", unit: "Sheets (300x200mm)", defaultQty: 1, standardPack: "Sheet" },
      { id: "c-mdf-3mm", name: "MDF Prototyping Board 3mm", unit: "Sheets (300x200mm)", defaultQty: 1, standardPack: "Sheet" },
      { id: "c-birch-ply", name: "Birch Laser Plywood 3mm", unit: "Sheets (300x200mm)", defaultQty: 1, standardPack: "Sheet" },
      { id: "c-vinyl-roll", name: "Vinyl Cutting Plotter Roll (24\" Matte/Glossy)", unit: "Meters", defaultQty: 1, standardPack: "Roll" },
      { id: "c-transfer-tape", name: "Transfer Application Tape", unit: "Meters", defaultQty: 1, standardPack: "Roll" },
      { id: "c-kraft-board", name: "Cardboard / Laser Kraft Sheet 2mm", unit: "Sheets", defaultQty: 2, standardPack: "Sheet" },
    ],
  },
  {
    id: "pcb-soldering",
    name: "PCB Prototyping & Soldering",
    icon: "Cpu",
    items: [
      { id: "c-pcb-single", name: "Single-Sided Copper Clad Board (FR4 10x15cm)", unit: "Pcs", defaultQty: 1, standardPack: "Board" },
      { id: "c-pcb-double", name: "Double-Sided Copper Clad Board (FR4 10x15cm)", unit: "Pcs", defaultQty: 1, standardPack: "Board" },
      { id: "c-micro-drill", name: "Carbide Micro Drill Bit Set (0.6mm - 1.2mm)", unit: "Set", defaultQty: 1, standardPack: "Case (10 pcs)" },
      { id: "c-v-bit", name: "PCB Isolation V-Bit (30° / 0.1mm)", unit: "Pcs", defaultQty: 1, standardPack: "Bit" },
      { id: "c-solder-wire", name: "Lead-Free Solder Wire (60/40 Rosin Core)", unit: "Meters", defaultQty: 2, standardPack: "Spool (100g)" },
      { id: "c-solder-paste", name: "Rosin Soldering Flux Paste (No-Clean)", unit: "Tub", defaultQty: 1, standardPack: "Tub (50g)" },
      { id: "c-desolder-wick", name: "Desoldering Copper Braid / Wick 2.5mm", unit: "Meters", defaultQty: 1, standardPack: "Roll (1.5m)" },
      { id: "c-heatshrink", name: "Heat Shrink Tubing Assortment (1mm - 6mm)", unit: "Pcs", defaultQty: 10, standardPack: "Strips" },
      { id: "c-copper-tape", name: "Conductive Copper Foil Tape (10mm)", unit: "Meters", defaultQty: 1, standardPack: "Roll" },
    ],
  },
  {
    id: "wiring-hardware",
    name: "Wiring, Connectors & Fasteners",
    icon: "Wrench",
    items: [
      { id: "c-jumper-mm", name: "Male-to-Male Jumper Wires (40-Pin Ribbon)", unit: "Set (40 pcs)", defaultQty: 1, standardPack: "Ribbon" },
      { id: "c-jumper-mf", name: "Male-to-Female Jumper Wires (40-Pin Ribbon)", unit: "Set (40 pcs)", defaultQty: 1, standardPack: "Ribbon" },
      { id: "c-jumper-ff", name: "Female-to-Female Jumper Wires (40-Pin Ribbon)", unit: "Set (40 pcs)", defaultQty: 1, standardPack: "Ribbon" },
      { id: "c-hookup-wire", name: "22 AWG Flexible Hookup Wire (Red / Black)", unit: "Meters", defaultQty: 3, standardPack: "Spool" },
      { id: "c-breadboard", name: "Solderless Breadboard (830 Tie Points)", unit: "Pcs", defaultQty: 1, standardPack: "Unit" },
      { id: "c-m3-screws", name: "M3 Screws, Nuts & Washers Assortment", unit: "Pack (20 pcs)", defaultQty: 1, standardPack: "Pack" },
      { id: "c-standoffs", name: "Brass Hex Standoffs Assortment (M3)", unit: "Pack (10 pcs)", defaultQty: 1, standardPack: "Pack" },
      { id: "c-zip-ties", name: "Nylon Cable Ties / Zip Ties (150mm)", unit: "Pcs", defaultQty: 10, standardPack: "Pack (100 pcs)" },
      { id: "c-mounting-tape", name: "Double-Sided Heavy Duty Foam Tape", unit: "Meters", defaultQty: 1, standardPack: "Roll" },
      { id: "c-battery-9v", name: "9V Heavy Duty Alkaline Battery & Snap Clip", unit: "Pcs", defaultQty: 1, standardPack: "Unit" },
      { id: "c-battery-18650", name: "18650 Li-Ion Rechargeable Battery Cell (3.7V)", unit: "Pcs", defaultQty: 1, standardPack: "Cell" },
    ],
  },
  {
    id: "mechanical-welding",
    name: "Machining, Sanding & Welding",
    icon: "Flame",
    items: [
      { id: "c-wood-blank", name: "Hardwood Turning Blank for Lathe", unit: "Pcs", defaultQty: 1, standardPack: "Blank" },
      { id: "c-end-mill", name: "CNC Solid Carbide End Mill Bit (1/8\" 2-Flute)", unit: "Pcs", defaultQty: 1, standardPack: "Bit" },
      { id: "c-sandpaper", name: "Sandpaper Sheets Assortment (120/240/400 Grit)", unit: "Sheets", defaultQty: 3, standardPack: "Sheet" },
      { id: "c-wood-glue", name: "Industrial Wood Glue (PVA Adhesion)", unit: "Grams", defaultQty: 50, standardPack: "Bottle" },
      { id: "c-welding-rods", name: "Mild Steel Arc Welding Rods (E6013 2.5mm)", unit: "Pcs", defaultQty: 5, standardPack: "Pack" },
      { id: "c-metal-scrap", name: "Mild Steel Flat Strip / Angle Iron Offcuts", unit: "Pcs", defaultQty: 2, standardPack: "Piece" },
      { id: "c-abrasive-disc", name: "Abrasive Metal Cut-Off / Grinding Wheel (4\")", unit: "Pcs", defaultQty: 1, standardPack: "Wheel" },
      { id: "c-coolant", name: "Metal Machining Cutting Fluid / Lubricant", unit: "ml", defaultQty: 50, standardPack: "Bottle" },
    ],
  },
];

/** Flattened list of all predefined consumables */
export const ALL_PRESET_CONSUMABLES = LAB_CONSUMABLE_CATEGORIES.flatMap((c) =>
  c.items.map((i) => ({ ...i, categoryId: c.id, categoryName: c.name }))
);
