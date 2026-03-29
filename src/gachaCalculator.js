export const PRIMOGEMS_PER_WISH = 160
export const STARLIGHT_PER_INTERTWINED_FATE = 5

const CHARACTER_HARD_PITY = 90
const CHARACTER_BASE_RATE = 0.006
const CHARACTER_SOFT_PITY_START = 74
const CHARACTER_SOFT_PITY_STEP = 0.06

const WEAPON_HARD_PITY = 80
const WEAPON_BASE_RATE = 0.007
const WEAPON_SOFT_PITY_START = 63
const WEAPON_SOFT_PITY_STEP = 0.07

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const sanitizeNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const sanitizeInteger = (value, min, max) =>
  clamp(Math.floor(Math.max(sanitizeNumber(value), 0)), min, max)

const createDeltaDistribution = (pulls = 0) => {
  const distribution = Array(pulls + 1).fill(0)
  distribution[pulls] = 1
  return distribution
}

const addWeightedDistribution = (
  target,
  pullOffset,
  branchProbability,
  branchDistribution,
) => {
  if (branchProbability === 0) {
    return
  }

  for (let index = 0; index < branchDistribution.length; index += 1) {
    const probability = branchDistribution[index]
    if (probability === 0) {
      continue
    }

    target[pullOffset + index] += branchProbability * probability
  }
}

const combineWithNextFiveStarDistribution = (
  nextFiveStarDistribution,
  outcomes,
) => {
  const maxPulls =
    nextFiveStarDistribution.length +
    Math.max(
      0,
      ...outcomes.map(({ distribution }) => distribution.length - 1),
    )
  const combined = Array(maxPulls).fill(0)

  for (
    let pullsToFiveStar = 1;
    pullsToFiveStar < nextFiveStarDistribution.length;
    pullsToFiveStar += 1
  ) {
    const fiveStarProbability = nextFiveStarDistribution[pullsToFiveStar]
    if (fiveStarProbability === 0) {
      continue
    }

    for (const outcome of outcomes) {
      addWeightedDistribution(
        combined,
        pullsToFiveStar,
        fiveStarProbability * outcome.probability,
        outcome.distribution,
      )
    }
  }

  return combined
}

const convolveDistributions = (left, right) => {
  const convolved = Array(left.length + right.length - 1).fill(0)

  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    const leftProbability = left[leftIndex]
    if (leftProbability === 0) {
      continue
    }

    for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
      const rightProbability = right[rightIndex]
      if (rightProbability === 0) {
        continue
      }

      convolved[leftIndex + rightIndex] += leftProbability * rightProbability
    }
  }

  return convolved
}

const buildDistributionSummary = (distribution, availableWishes) => {
  const expectedWishes = distribution.reduce(
    (total, probability, pulls) => total + probability * pulls,
    0,
  )
  const successProbability = distribution.reduce(
    (total, probability, pulls) =>
      pulls <= availableWishes ? total + probability : total,
    0,
  )

  return {
    distribution,
    successProbability,
    expectedWishes,
    expectedPrimogems: expectedWishes * PRIMOGEMS_PER_WISH,
    remainingWishCount: Math.max(availableWishes - expectedWishes, 0),
  }
}

const getPullRate = ({
  hardPity,
  baseRate,
  softPityStart,
  softPityStep,
  pityBeforePull,
}) => {
  const pityCount = pityBeforePull + 1
  if (pityCount >= hardPity) {
    return 1
  }

  if (pityCount < softPityStart) {
    return baseRate
  }

  return Math.min(
    1,
    baseRate + (pityCount - softPityStart + 1) * softPityStep,
  )
}

const buildNextFiveStarDistribution = ({
  hardPity,
  baseRate,
  softPityStart,
  softPityStep,
  currentPity,
}) => {
  const sanitizedPity = sanitizeInteger(currentPity, 0, hardPity - 1)
  const distribution = Array(hardPity - sanitizedPity + 1).fill(0)
  let missProbability = 1

  for (let pullOffset = 1; pullOffset <= hardPity - sanitizedPity; pullOffset += 1) {
    const pityBeforePull = sanitizedPity + pullOffset - 1
    const hitRate = getPullRate({
      hardPity,
      baseRate,
      softPityStart,
      softPityStep,
      pityBeforePull,
    })

    distribution[pullOffset] = missProbability * hitRate
    missProbability *= 1 - hitRate
  }

  return distribution
}

const getCharacterNextFiveStarDistribution = (currentPity) =>
  buildNextFiveStarDistribution({
    hardPity: CHARACTER_HARD_PITY,
    baseRate: CHARACTER_BASE_RATE,
    softPityStart: CHARACTER_SOFT_PITY_START,
    softPityStep: CHARACTER_SOFT_PITY_STEP,
    currentPity,
  })

const getWeaponNextFiveStarDistribution = (currentPity) =>
  buildNextFiveStarDistribution({
    hardPity: WEAPON_HARD_PITY,
    baseRate: WEAPON_BASE_RATE,
    softPityStart: WEAPON_SOFT_PITY_START,
    softPityStep: WEAPON_SOFT_PITY_STEP,
    currentPity,
  })

const calculateCharacterCompletionDistribution = (
  copiesNeeded,
  guaranteed,
  pity,
  memo = new Map(),
) => {
  if (copiesNeeded <= 0) {
    return createDeltaDistribution()
  }

  const memoKey = `${copiesNeeded}|${guaranteed ? 1 : 0}|${pity}`
  const cached = memo.get(memoKey)
  if (cached) {
    return cached
  }

  const nextFiveStarDistribution = getCharacterNextFiveStarDistribution(pity)
  const outcomes = []

  if (guaranteed) {
    outcomes.push({
      probability: 1,
      distribution: calculateCharacterCompletionDistribution(
        copiesNeeded - 1,
        false,
        0,
        memo,
      ),
    })
  } else {
    outcomes.push({
      probability: 0.5,
      distribution: calculateCharacterCompletionDistribution(
        copiesNeeded - 1,
        false,
        0,
        memo,
      ),
    })
    outcomes.push({
      probability: 0.5,
      distribution: calculateCharacterCompletionDistribution(
        copiesNeeded,
        true,
        0,
        memo,
      ),
    })
  }

  const distribution = combineWithNextFiveStarDistribution(
    nextFiveStarDistribution,
    outcomes,
  )
  memo.set(memoKey, distribution)
  return distribution
}

const calculateWeaponCompletionDistribution = (
  copiesNeeded,
  featuredGuarantee,
  epitomizedPathPoints,
  pity,
  memo = new Map(),
) => {
  if (copiesNeeded <= 0) {
    return createDeltaDistribution()
  }

  const memoKey = `${copiesNeeded}|${featuredGuarantee ? 1 : 0}|${epitomizedPathPoints}|${pity}`
  const cached = memo.get(memoKey)
  if (cached) {
    return cached
  }

  const nextFiveStarDistribution = getWeaponNextFiveStarDistribution(pity)
  const outcomes = []

  if (epitomizedPathPoints >= 1) {
    outcomes.push({
      probability: 1,
      distribution: calculateWeaponCompletionDistribution(
        copiesNeeded - 1,
        false,
        0,
        0,
        memo,
      ),
    })
  } else if (featuredGuarantee) {
    outcomes.push({
      probability: 0.5,
      distribution: calculateWeaponCompletionDistribution(
        copiesNeeded - 1,
        false,
        0,
        0,
        memo,
      ),
    })
    outcomes.push({
      probability: 0.5,
      distribution: calculateWeaponCompletionDistribution(
        copiesNeeded,
        false,
        epitomizedPathPoints + 1,
        0,
        memo,
      ),
    })
  } else {
    outcomes.push({
      probability: 0.375,
      distribution: calculateWeaponCompletionDistribution(
        copiesNeeded - 1,
        false,
        0,
        0,
        memo,
      ),
    })
    outcomes.push({
      probability: 0.375,
      distribution: calculateWeaponCompletionDistribution(
        copiesNeeded,
        false,
        epitomizedPathPoints + 1,
        0,
        memo,
      ),
    })
    outcomes.push({
      probability: 0.25,
      distribution: calculateWeaponCompletionDistribution(
        copiesNeeded,
        true,
        epitomizedPathPoints + 1,
        0,
        memo,
      ),
    })
  }

  const distribution = combineWithNextFiveStarDistribution(
    nextFiveStarDistribution,
    outcomes,
  )
  memo.set(memoKey, distribution)
  return distribution
}

export const buildAvailableWishes = (resources) => {
  const primogems = Math.max(sanitizeInteger(resources.primogems, 0, 99999999), 0)
  const intertwinedFates = Math.max(
    sanitizeInteger(resources.intertwinedFates, 0, 999999),
    0,
  )
  const starlight = Math.max(sanitizeInteger(resources.starlight, 0, 999999), 0)

  const starlightConvertibleFates = Math.floor(
    starlight / STARLIGHT_PER_INTERTWINED_FATE,
  )
  const totalPrimogemEquivalent =
    primogems +
    intertwinedFates * PRIMOGEMS_PER_WISH +
    starlightConvertibleFates * PRIMOGEMS_PER_WISH
  const totalWishCount = Math.floor(totalPrimogemEquivalent / PRIMOGEMS_PER_WISH)

  return {
    primogems,
    intertwinedFates,
    starlight,
    starlightConvertibleFates,
    totalPrimogemEquivalent,
    totalWishCount,
    leftoverPrimogems: totalPrimogemEquivalent % PRIMOGEMS_PER_WISH,
  }
}

export const calculateCharacterBannerPlan = (input) => {
  const availableWishes = sanitizeInteger(input.availableWishes, 0, 999999)
  const currentConstellation = sanitizeInteger(input.currentConstellation, 0, 7)
  const targetConstellation = sanitizeInteger(input.targetConstellation, 0, 7)
  const copiesNeeded = Math.max(targetConstellation - currentConstellation, 0)
  const characterPity = sanitizeInteger(input.characterPity, 0, 89)
  const characterGuaranteed = Boolean(input.characterGuaranteed)

  const distribution = calculateCharacterCompletionDistribution(
    copiesNeeded,
    characterGuaranteed,
    characterPity,
  )

  return {
    ...buildDistributionSummary(distribution, availableWishes),
    copiesNeeded,
    currentConstellation,
    targetConstellation,
    characterPity,
    characterGuaranteed,
  }
}

export const calculateWeaponBannerPlan = (input) => {
  const availableWishes = sanitizeInteger(input.availableWishes, 0, 999999)
  const currentRefinement = sanitizeInteger(input.currentRefinement, 0, 5)
  const targetRefinement = sanitizeInteger(input.targetRefinement, 0, 5)
  const copiesNeeded = Math.max(targetRefinement - currentRefinement, 0)
  const weaponPity = sanitizeInteger(input.weaponPity, 0, 79)
  const weaponGuaranteed = Boolean(input.weaponGuaranteed)
  const epitomizedPathPoints = sanitizeInteger(input.epitomizedPathPoints, 0, 1)

  const distribution = calculateWeaponCompletionDistribution(
    copiesNeeded,
    weaponGuaranteed,
    epitomizedPathPoints,
    weaponPity,
  )

  return {
    ...buildDistributionSummary(distribution, availableWishes),
    copiesNeeded,
    currentRefinement,
    targetRefinement,
    weaponPity,
    weaponGuaranteed,
    epitomizedPathPoints,
  }
}

export const calculateCombinedPlan = (input) => {
  const availableWishes = sanitizeInteger(input.availableWishes, 0, 999999)

  const characterPlan = calculateCharacterBannerPlan(input)
  const weaponPlan = calculateWeaponBannerPlan(input)
  const combinedDistribution = convolveDistributions(
    characterPlan.distribution,
    weaponPlan.distribution,
  )
  const combinedSummary = buildDistributionSummary(
    combinedDistribution,
    availableWishes,
  )

  return {
    ...combinedSummary,
    availableWishes,
    characterPlan,
    weaponPlan,
    totalExpectedWishes:
      characterPlan.expectedWishes + weaponPlan.expectedWishes,
    totalExpectedPrimogems:
      (characterPlan.expectedWishes + weaponPlan.expectedWishes) *
      PRIMOGEMS_PER_WISH,
  }
}
