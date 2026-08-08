/**
 * XIVAPI Quest rows that still exist in the game data but cannot currently
 * be accepted or completed.
 *
 * Keep this catalog row-ID-only. These rows remain in the raw XIVAPI quest
 * index for historical comparison, but they must never be exported or
 * published by the app.
 */
export const excludedQuestRowIds: ReadonlySet<number> = new Set([
  // Removed during the Patch 5.3 ARR MSQ overhaul.
  65616, // Doman Connection
  65692, // Ruffled Feathers
  65695, // Lights Out
  65732, // An Eft for Effort
  65734, // Butcher of Greentear
  65841, // Until a Quieter Time
  65860, // Disorderly Conduct
  65863, // Spriggan Cleaning
  65871, // Compulsory Catering
  65910, // Feeding Time
  65918, // Skeletons in My Deepcroft
  65934, // Courier for a Day
  65940, // Farmer of Fortune
  66000, // Further Afield
  66288, // Ratting It Out
  66351, // The Penitent Man
  66352, // Changing of the Guard
  66356, // The Drake Exception
  66383, // Not My War
  66390, // A Final Ignominy
  66407, // With a Little Elbow Grease
  66413, // The Warden Works in Mysterious Ways
  66417, // A Tall Drink of Aqua del Sol
  66432, // Feats of Strength
  66461, // Opportunity Knocks
  66462, // All By Ourselves
  66490, // All Due Precautions
  66507, // Of Sylphs and Spriggans
  66510, // Crazy Enough to Work
  66575, // The Ladle in the Darkness
  66578, // All upon the Watchtowers
  66582, // Setting the Stage
  66713, // Flowers for One
  66715, // The Resolute
  66717, // Better Late than Sever
  66718, // Rock-solid Protection
  66719, // Crate Go Kaboom
  66722, // You're Gonna Carry That
  66723, // The Things We Do for Tea
  66885, // A Small-scale Operation
  66887, // If Wishes Were Horsebirds
  66890, // Full Belly, Happy Heart
  66891, // Writhing in the Dark
  66893, // Fireworks and Fish Don't Mix
  66985, // A Sylphlands Sting
  66986, // Scattered Scions
  66987, // True to Form
  66990, // A Hard Hapalit to Break
  66991, // Picking Up the Sledge
  67097, // Welcome to Morbol Country
  67098, // Answering the Call

  // Permanently retired feature/Chronicles quests.
  66033, // But I Hardly Noah — removed in 6.3
  66034, // The Gift of the Archmagus — removed in 6.3
  67653, // I Believe I Can Fly — removed in 5.3
  67819, // A Seat at the Feast — removed in 6.1
]);

export function isExcludedQuestRowId(value: unknown): boolean {
  const rowId =
    typeof value === 'number' && Number.isInteger(value)
      ? value
      : typeof value === 'string' && /^[1-9]\d*$/.test(value)
        ? Number(value)
        : undefined;

  return rowId !== undefined && excludedQuestRowIds.has(rowId);
}
