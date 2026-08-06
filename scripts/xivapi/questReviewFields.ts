export const QUEST_REVIEW_FIELDS = [
  // Identity
  'Name',
  'Id',
  'Icon',

  // Classification
  'Expansion.Name',
  'JournalGenre.Name',
  'JournalGenre.JournalCategory.Name',
  'ClassJobLevel',
  'ClassJobRequired.NameEnglish',
  'ClassJobRequired.Abbreviation',
  'ClassJobRequired.ClassJobCategory.Name',
  'ClassJobCategory0.Name',
  'ClassJobCategory1.Name',
  'QuestLevelOffset',
  'LevelMax',
  'SortKey',
  'Type',
  'EventIconType',

  // Starting actor
  'IssuerStart.Singular',
  'IssuerStart.Title',
  'PlaceName.Name',

  // Starting location
  'IssuerLocation.X',
  'IssuerLocation.Y',
  'IssuerLocation.Z',
  'IssuerLocation.Map.Id',
  'IssuerLocation.Map.SizeFactor',
  'IssuerLocation.Map.OffsetX',
  'IssuerLocation.Map.OffsetY',
  'IssuerLocation.Map.PlaceName.Name',
  'IssuerLocation.Map.PlaceNameRegion.Name',
  'IssuerLocation.Territory.Name',
  'IssuerLocation.Territory.PlaceName.Name',
  'IssuerLocation.Territory.PlaceNameRegion.Name',

  // Quest relationships
  'PreviousQuest[].Name',
  'PreviousQuest[].Id',
  'PreviousQuestJoin',
  'QuestLock[].Name',
  'QuestLock[].Id',
  'QuestLockJoin',

  // Script references and objectives
  'QuestParams',
  'QuestListenerParams',
  'TodoParams[].CountableNum',
  'TodoParams[].ToDoCompleteSeq',
  'TodoParams[].ToDoQty',

  'TodoParams[].ToDoLocation[].X',
  'TodoParams[].ToDoLocation[].Y',
  'TodoParams[].ToDoLocation[].Z',

  'TodoParams[].ToDoLocation[].Object@as(raw)',

  'TodoParams[].ToDoLocation[].Map.Id',
  'TodoParams[].ToDoLocation[].Map.SizeFactor',
  'TodoParams[].ToDoLocation[].Map.OffsetX',
  'TodoParams[].ToDoLocation[].Map.OffsetY',
  'TodoParams[].ToDoLocation[].Map.PlaceName.Name',
  'TodoParams[].ToDoLocation[].Map.PlaceNameRegion.Name',

  'TodoParams[].ToDoLocation[].Territory.Name',
  'TodoParams[].ToDoLocation[].Territory.PlaceName.Name',
  'TodoParams[].ToDoLocation[].Territory.PlaceNameRegion.Name',

  // Basic rewards
  'ExpFactor',
  'GilReward',

  // Guaranteed item rewards
  'Reward[].Name',
  'Reward[].Icon',
  'Reward[].ItemUICategory.Name',
  'Reward[].ItemAction.Action.row_id',
  'Reward[].ItemAction.Data',
  'Reward[].AdditionalData.Name',
  'Reward[].AdditionalData.Singular',
  'ItemCountReward',
  'ItemIsHQReward',
  'RewardStain[].Name',

  // Choice rewards
  'OptionalItemReward[].Name',
  'OptionalItemReward[].Icon',
  'OptionalItemCountReward',
  'OptionalItemIsHQReward',
  'OptionalItemStainReward[].Name',

  // Currency and miscellaneous rewards
  'CurrencyReward.Name',
  'CurrencyRewardCount',
  'OtherReward.Name',
  'Tomestone',
  'TomestoneReward',
  'TomestoneCountReward',
  'ReputationReward',
  'GCTypeReward',
  'SystemReward',

  // Unlocks
  'ActionReward.Name',
  'EmoteReward.Name',
  'GeneralActionReward[].Name',
  'ClassJobUnlock.NameEnglish',

  // Duties
  'InstanceContent[].ContentFinderCondition.Name',
  'InstanceContent[].ContentFinderCondition.ContentType.Name',
  'InstanceContent[].ContentFinderCondition.ClassJobLevelRequired',
  'InstanceContent[].ContentFinderCondition.ClassJobLevelSync',
  'InstanceContent[].ContentFinderCondition.ItemLevelRequired',
  'InstanceContent[].ContentFinderCondition.ItemLevelSync',
  'InstanceContent[].ContentFinderCondition.QueueMaxPlayers',
  'InstanceContent[].TimeLimitmin',

  'InstanceContentUnlock.ContentFinderCondition.Name',
  'InstanceContentUnlock.ContentFinderCondition.ContentType.Name',
  'InstanceContentUnlock.ContentFinderCondition.ClassJobLevelRequired',
  'InstanceContentUnlock.ContentFinderCondition.ItemLevelRequired',
  'InstanceContentUnlock.ContentFinderCondition.QueueMaxPlayers',

  // Access restrictions
  'GrandCompany.Name',
  'GrandCompanyRank',
  'BeastTribe.Name',
  'BeastReputationRank.Name',
  'BeastReputationValue',
  'Festival.Name',
  'FestivalBegin',
  'FestivalEnd',
  'MountRequired.Singular',

  // Repeatability and behavioral flags
  'IsRepeatable',
  'RepeatIntervalType',
  'QuestRepeatFlag',
  'DailyQuestPool',
  'IsHouseRequired',
  'CanCancel',
  'Introduction',
  'HideOfferIcon',
  'HideInScenarioGuide',

  // Supply/delivery relationships worth investigating
  'QuestClassJobSupply@as(raw)',
  'DeliveryQuest@as(raw)',
  'SatisfactionNpc@as(raw)',
  'SatisfactionLevel',
].join(',');
