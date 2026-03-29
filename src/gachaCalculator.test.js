import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildAvailableWishes,
  calculateCharacterBannerPlan,
  calculateCombinedPlan,
  calculateWeaponBannerPlan,
} from './gachaCalculator.js'

test('buildAvailableWishes converts mixed resources into wishes', () => {
  const result = buildAvailableWishes({
    primogems: 320,
    intertwinedFates: 3,
    starlight: 12,
  })

  assert.equal(result.starlightConvertibleFates, 2)
  assert.equal(result.totalPrimogemEquivalent, 1120)
  assert.equal(result.totalWishCount, 7)
})

test('character plan is guaranteed complete when no additional copies are needed', () => {
  const result = calculateCharacterBannerPlan({
    availableWishes: 0,
    currentConstellation: 3,
    targetConstellation: 3,
    characterPity: 0,
    characterGuaranteed: false,
  })

  assert.equal(result.successProbability, 1)
  assert.equal(result.expectedWishes, 0)
})

test('character guarantee improves the success probability', () => {
  const baseInput = {
    availableWishes: 90,
    currentConstellation: 0,
    targetConstellation: 1,
    characterPity: 0,
  }

  const notGuaranteed = calculateCharacterBannerPlan({
    ...baseInput,
    characterGuaranteed: false,
  })
  const guaranteed = calculateCharacterBannerPlan({
    ...baseInput,
    characterGuaranteed: true,
  })

  assert.ok(guaranteed.successProbability > notGuaranteed.successProbability)
})

test('character pity never hurts the success probability', () => {
  const lowPity = calculateCharacterBannerPlan({
    availableWishes: 40,
    currentConstellation: 0,
    targetConstellation: 1,
    characterPity: 0,
    characterGuaranteed: false,
  })
  const highPity = calculateCharacterBannerPlan({
    availableWishes: 40,
    currentConstellation: 0,
    targetConstellation: 1,
    characterPity: 70,
    characterGuaranteed: false,
  })

  assert.ok(highPity.successProbability >= lowPity.successProbability)
})

test('weapon plan is guaranteed complete when no additional copies are needed', () => {
  const result = calculateWeaponBannerPlan({
    availableWishes: 0,
    currentRefinement: 2,
    targetRefinement: 2,
    weaponPity: 0,
    weaponGuaranteed: false,
    epitomizedPathPoints: 0,
  })

  assert.equal(result.successProbability, 1)
  assert.equal(result.expectedWishes, 0)
})

test('weapon path point at one guarantees the next selected weapon', () => {
  const result = calculateWeaponBannerPlan({
    availableWishes: 80,
    currentRefinement: 0,
    targetRefinement: 1,
    weaponPity: 0,
    weaponGuaranteed: false,
    epitomizedPathPoints: 1,
  })

  assert.ok(Math.abs(result.successProbability - 1) < 1e-12)
})

test('weapon guarantee improves the success probability', () => {
  const baseInput = {
    availableWishes: 80,
    currentRefinement: 0,
    targetRefinement: 1,
    weaponPity: 0,
    epitomizedPathPoints: 0,
  }

  const notGuaranteed = calculateWeaponBannerPlan({
    ...baseInput,
    weaponGuaranteed: false,
  })
  const guaranteed = calculateWeaponBannerPlan({
    ...baseInput,
    weaponGuaranteed: true,
  })

  assert.ok(guaranteed.successProbability > notGuaranteed.successProbability)
})

test('weapon pity never worsens the expected wishes', () => {
  const lowPity = calculateWeaponBannerPlan({
    availableWishes: 160,
    currentRefinement: 0,
    targetRefinement: 1,
    weaponPity: 0,
    weaponGuaranteed: false,
    epitomizedPathPoints: 0,
  })
  const highPity = calculateWeaponBannerPlan({
    availableWishes: 160,
    currentRefinement: 0,
    targetRefinement: 1,
    weaponPity: 60,
    weaponGuaranteed: false,
    epitomizedPathPoints: 0,
  })

  assert.ok(highPity.expectedWishes <= lowPity.expectedWishes)
})

test('combined plan expected wishes are the sum of both banners', () => {
  const result = calculateCombinedPlan({
    availableWishes: 150,
    currentConstellation: 0,
    targetConstellation: 2,
    characterPity: 70,
    characterGuaranteed: false,
    currentRefinement: 0,
    targetRefinement: 1,
    weaponPity: 0,
    weaponGuaranteed: false,
    epitomizedPathPoints: 0,
  })

  assert.equal(
    result.totalExpectedWishes,
    result.characterPlan.expectedWishes + result.weaponPlan.expectedWishes,
  )
})

test('combined plan reduces to the unfinished banner when the other target is already met', () => {
  const combined = calculateCombinedPlan({
    availableWishes: 100,
    currentConstellation: 1,
    targetConstellation: 1,
    characterPity: 0,
    characterGuaranteed: false,
    currentRefinement: 0,
    targetRefinement: 1,
    weaponPity: 0,
    weaponGuaranteed: false,
    epitomizedPathPoints: 0,
  })
  const weaponOnly = calculateWeaponBannerPlan({
    availableWishes: 100,
    currentRefinement: 0,
    targetRefinement: 1,
    weaponPity: 0,
    weaponGuaranteed: false,
    epitomizedPathPoints: 0,
  })

  assert.equal(combined.successProbability, weaponOnly.successProbability)
})

test('combined plan returns zero chance with zero budget and unmet targets', () => {
  const result = calculateCombinedPlan({
    availableWishes: 0,
    currentConstellation: 0,
    targetConstellation: 1,
    characterPity: 0,
    characterGuaranteed: false,
    currentRefinement: 0,
    targetRefinement: 1,
    weaponPity: 0,
    weaponGuaranteed: false,
    epitomizedPathPoints: 0,
  })

  assert.equal(result.successProbability, 0)
})
