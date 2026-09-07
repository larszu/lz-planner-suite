// ───────────────────────────────────────────────────────────────────────────
// SUITE-OVERLAY: die Lager-Typen der App.
//
// Im eigenstaendigen light-planner steht hier die Definition; in der Suite
// liegt sie im gemeinsamen Paket `@avplan/inventory-core`, weil alle drei
// Planer denselben Wire-Contract `avplan-inventory` bedienen. Diese Datei ist
// die eine Stelle, an der die Suite das uebersetzt.
//
// WARUM ALS DATEI UND NICHT ALS GEAENDERTER IMPORT IN JEDEM MODUL. Ohne sie
// muesste jedes vendorte Modul, das Lager-Typen braucht, in der Suite eine
// andere Import-Zeile tragen als upstream — und waere damit fuer immer ein
// Fork, den der Drift-Waechter bei jedem Vendorieren erneut meldet und den
// jemand von Hand nachziehen muss. Mit ihr bleiben die Module zeichengleich.
//
// Hier steht KEINE eigene Definition. Ein zweiter Typ mit demselben Namen
// waere genau der Zustand, den der Wire-Contract verhindert.
// ───────────────────────────────────────────────────────────────────────────
export type {
  InventoryItem,
  InventoryOwnership,
  InventoryCodeType,
  InventoryMaterialKind,
  PhysicalDimensions,
  StorageNode,
  InventorySet,
  InventoryUnit,
} from '@avplan/inventory-core';
