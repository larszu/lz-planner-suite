# Model vs. instance: the measurement behind design question 2

Design question 2 has been parked for the user since the ADR-005 work began:

> Which of the remaining template fields are model properties and which are
> instance properties? Prices propagate into BOMs, so the answer has
> consequences beyond tidiness.

The ADR-005 Increment 4 path walk landed on exactly that question with data.
This note records the measurement, sorts what can be sorted without deciding,
and stops where the decision starts. **Nothing was changed in the code.**

## What was measured

`saveEquipmentAsTemplate` — the "Als Standard-Vorlage überschreiben" button in
the properties panel — converts a placed device into a library template through
one shared function, `templateFromEquipment` (`store/slices/templateSlice.ts`).

| | count |
| --- | --- |
| top-level fields on `EquipmentItem` | **97** |
| fields `templateFromEquipment` names | **25** |
| dropped (excluding `id`, `x`, `y`) | **71** |

The type makes the gap explicit:

```ts
export type EquipmentTemplate = Omit<EquipmentItem, 'id' | 'x' | 'y'> & { … }
```

A template *can* carry everything a device has. The enumeration decides what it
actually does.

## First, a refutation

The path walk reported that the button "replaces the library entry with a
23-field rebuild", implying it loses what matters. Read against the code, the
implication does not hold. The button's own tooltip promises:

> Speichert das aktuelle Gerät (Ports, Netzwerk, SDI-Caps, MV-Config …) als
> Vorlage in der Bibliothek.

`templateFromEquipment` carries all of it: `inputs`/`outputs`, the full network
identity (`ipAddress`, `subnetMask`, `macAddress`, `username`, `password`,
`vlans`, `managementVlanId`, `gateway`, `dnsServers`, `mgmtUrl`, `firmware`,
`portVlans`), plus `sdiCaps`, `atemMvConfig` and `deviceTypeId` — the last with
a comment explaining why it is not optional (ADR-002: dropping it turns a
catalogue device back into a name guess).

**The promise is kept.** What is worth asking is a different question: whether
the 71 unnamed fields *should* travel.

## The 71, sorted as far as they sort themselves

Two groups are not in dispute. The third is the actual question.

### A · Clearly instance — must NOT travel into a template

Carrying these would make every device spawned from the template a copy of one
particular unit, which is worse than losing them.

`sourceIdentityId` · `serialNumber` · `assetTag` · `qrId` ·
`rackInstanceId` · `rackInstanceLabel` · `rackInstanceStartUnit` ·
`rackInternalSnapshot` · `packed` · `installStatus` · `verifiedBy` ·
`serviceHistory` · `purchaseDate` · `warrantyUntil` · `maintenanceIntervalDays` ·
`netboxId` · `netboxPath` · `netboxSourceUrl` · `graphmlId` · `importSource` ·
`libraryRef` · `rentmanRemoved` · `videohubRouting` · `activeModeId` ·
`collapsed` · `positionLocked` · `portsFlipped` · `nodeColor` ·
`favorite` · `hidden` (the last two are carried deliberately from the *existing*
template via `preserveFlags`, which is the right treatment)

### B · Clearly model — a datasheet fact about the type

Losing these means saving a rack device as a template and getting back something
that no longer knows its own height, weight or front panel.

`rackUnits` · `isRackDevice` · `isPatchPanel` · `isRackShelf` ·
`depthMm` · `widthMm` · `heightMm` · `weightKg` ·
`powerWatts` · `powerConsumptionWatts` · `voltage` · `currentAmps` · `powerPhase` ·
`resolution` · `displaySizeInch` ·
`frontPanelImageUrl` · `rearPanelImageUrl` · `frontPanelCrop` · `rearPanelCrop` ·
`stlDataUri` · `icon` · `imageUrl` ·
`modes` · `atemAudioConfig` · `atemMvCapabilitiesOverride` · `categoryProps` ·
`manufacturerUrl` · `shortName` · `subtitle` ·
`isConverter` · `isDistributionAmp` · `embedderRole` · `tallyRole` · `tcRole` ·
`portsUnknown`

`portsUnknown` deserves a note of its own: it is the marker
`multicamCameraImport` sets when it refuses to invent a port layout. Dropping it
when the device becomes a template turns "we do not know this device's ports"
back into "this device has no ports" — the exact confusion ADR-003 exists to
prevent.

### C · The open question — commercial and stock fields

`priceEUR` · `rentPricePerDay` · `rentCurrency` · `ownership` ·
`supplier` · `stockLocation`

These are the fields design question 2 names. Both readings are defensible:

- **Model:** a price list is a property of the equipment type; carrying it means
  a BOM can be costed from the library alone.
- **Instance:** a price is what *this* rental house charges for *this* unit in
  *this* season; carrying it into a shared template silently propagates one
  house's rates into everyone's BOMs.

The measurement cannot settle this, and it should not be settled by whoever
happens to touch the enumeration next. **It is the user's call.**

## What follows once C is answered

The fix is not to extend the enumeration by hand — a second enumeration next to
a richer path is the failure mode Increment 4 keeps finding (`rentmanTemplateCache`
notes three functions building a template from an `EquipmentItem` with 37 / 23 /
15 fields; the `.cpgroup` export had drifted from the save path since #335).

The shape that holds is the one used for the rack preset: derive the template by
**subtracting** the instance fields from the item, so a new field travels by
default and only an explicit exclusion keeps it back. That inverts the failure
mode — a forgotten field is then carried rather than lost, and a field that must
not travel has to be named, which is exactly where a reviewer will look.

Group A above is the subtraction list. Group B needs no list. Group C decides
which side it joins.

## Not done, deliberately

No behaviour changed. Extending `templateFromEquipment` by group B alone would
be defensible on its own merits, but it would also quietly answer group C by
omission — a template that carries weight and depth but not price implies a
decision nobody made. The two belong in one pass, after the question is
answered.
