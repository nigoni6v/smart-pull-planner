import { useState } from 'react'
import backgroundImage from './assets/1.0KV1_2560x1440.jpg'
import intertwinedFateIcon from './assets/Intertwined Fate.png'
import starlightIcon from './assets/Masterless Starglitter.png'
import primogemIcon from './assets/primogem.png'
import './App.css'
import {
  PRIMOGEMS_PER_WISH,
  STARLIGHT_PER_INTERTWINED_FATE,
  buildAvailableWishes,
  calculateCombinedPlan,
} from './gachaCalculator'

const characterOptions = [
  { value: '0', label: '未所持' },
  { value: '1', label: '無凸' },
  { value: '2', label: '1凸' },
  { value: '3', label: '2凸' },
  { value: '4', label: '3凸' },
  { value: '5', label: '4凸' },
  { value: '6', label: '5凸' },
  { value: '7', label: '完凸' },
]

const weaponOptions = [
  { value: '0', label: '未所持' },
  { value: '1', label: '精錬1' },
  { value: '2', label: '精錬2' },
  { value: '3', label: '精錬3' },
  { value: '4', label: '精錬4' },
  { value: '5', label: '精錬5' },
]

const probabilityLabel = (probability) => `${(probability * 100).toFixed(1)}%`
const numberLabel = (value) => value.toLocaleString(undefined, {
  maximumFractionDigits: 1,
  minimumFractionDigits: value % 1 === 0 ? 0 : 1,
})
const getRequiredWishesForProbability = (distribution, probabilityPercent) => {
  if (probabilityPercent <= 0) {
    return 0
  }

  const targetProbability = probabilityPercent / 100
  let cumulativeProbability = 0

  for (let wishes = 0; wishes < distribution.length; wishes += 1) {
    cumulativeProbability += distribution[wishes] ?? 0

    if (cumulativeProbability + Number.EPSILON >= targetProbability) {
      return wishes
    }
  }

  return distribution.length - 1
}

const probabilityToneClass = (probability) => {
  if (probability >= 0.75) {
    return 'summary-card--success'
  }

  if (probability >= 0.5) {
    return 'summary-card--warn'
  }

  return 'summary-card--danger'
}

function App() {
  const [characterTargetProbability, setCharacterTargetProbability] = useState(80)
  const [weaponTargetProbability, setWeaponTargetProbability] = useState(80)
  const [form, setForm] = useState({
    currentConstellation: '0',
    targetConstellation: '0',
    characterPity: '',
    characterGuaranteed: 'false',
    currentRefinement: '0',
    targetRefinement: '0',
    weaponPity: '',
    weaponGuaranteed: 'false',
    epitomizedPathPoints: '0',
    primogems: '',
    intertwinedFates: '',
    starlight: '',
  })

  const updateField = (key) => (event) => {
    setForm((prev) => ({
      ...prev,
      [key]: event.target.value,
    }))
  }

  const resources = buildAvailableWishes(form)
  const combinedPlan = calculateCombinedPlan({
    ...form,
    availableWishes: resources.totalWishCount,
    characterGuaranteed: form.characterGuaranteed === 'true',
    weaponGuaranteed: form.weaponGuaranteed === 'true',
  })

  const {
    characterPlan,
    weaponPlan,
    totalExpectedWishes,
    totalExpectedPrimogems,
    successProbability,
  } = combinedPlan
  const expectedPrimogemGap = Math.max(
    Math.round(totalExpectedPrimogems - resources.totalPrimogemEquivalent),
    0,
  )
  const characterRequiredPrimogems =
    getRequiredWishesForProbability(
      characterPlan.distribution,
      characterTargetProbability,
    ) * PRIMOGEMS_PER_WISH
  const weaponRequiredPrimogems =
    getRequiredWishesForProbability(
      weaponPlan.distribution,
      weaponTargetProbability,
    ) * PRIMOGEMS_PER_WISH
  const pageStyle = {
    '--app-background-image': `url(${backgroundImage})`,
  }

  return (
    <div className="page-shell" style={pageStyle}>
      <header className="site-band">
        <div className="site-band__inner">
          <p className="eyebrow">Genshin Smart Pull Planner</p>
          <h1>原神ガチャプランナー</h1>
        </div>
      </header>

      <main className="app-shell">
        <section className="hero-panel">
          <p className="section-label">Probability Planner</p>
          <h2>入力した条件から、キャラと武器を両取りできる確率をすぐ計算</h2>
          <p className="hero-copy">
            現在の凸数、精錬数、天井、保証状態、命定値、所持資源を入力すると、
            限定キャラ祈願と武器祈願を両方達成できる確率と期待値を即時計算します。
          </p>
        </section>

        <section className="workspace-grid">
          <section className="panel">
            <p className="section-label">Inputs</p>
            <h2>ガチャ条件を入力</h2>

            <div className="panel-split">
              <div className="split-column">
                <h3>キャラ祈願</h3>

                <label className="form-field">
                  <span className="field-label">現在の所持状態</span>
                  <select
                    className="field-control"
                    value={form.currentConstellation}
                    onChange={updateField('currentConstellation')}
                  >
                    {characterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span className="field-label">目標の所持状態</span>
                  <select
                    className="field-control"
                    value={form.targetConstellation}
                    onChange={updateField('targetConstellation')}
                  >
                    {characterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span className="field-label">現在の天井カウント</span>
                  <input
                    className="field-control"
                    type="number"
                    min="0"
                    max="89"
                    value={form.characterPity}
                    onChange={updateField('characterPity')}
                    placeholder="0-89"
                  />
                </label>

                <label className="form-field">
                  <span className="field-label">次の★5は限定キャラ確定</span>
                  <select
                    className="field-control"
                    value={form.characterGuaranteed}
                    onChange={updateField('characterGuaranteed')}
                  >
                    <option value="false">いいえ</option>
                    <option value="true">はい</option>
                  </select>
                </label>
              </div>

              <div className="split-column">
                <h3>武器祈願</h3>

                <label className="form-field">
                  <span className="field-label">現在の所持状態</span>
                  <select
                    className="field-control"
                    value={form.currentRefinement}
                    onChange={updateField('currentRefinement')}
                  >
                    {weaponOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span className="field-label">目標の所持状態</span>
                  <select
                    className="field-control"
                    value={form.targetRefinement}
                    onChange={updateField('targetRefinement')}
                  >
                    {weaponOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span className="field-label">現在の天井カウント</span>
                  <input
                    className="field-control"
                    type="number"
                    min="0"
                    max="79"
                    value={form.weaponPity}
                    onChange={updateField('weaponPity')}
                    placeholder="0-79"
                  />
                </label>

                <label className="form-field">
                  <span className="field-label">次の★5はPU武器確定</span>
                  <select
                    className="field-control"
                    value={form.weaponGuaranteed}
                    onChange={updateField('weaponGuaranteed')}
                  >
                    <option value="false">いいえ</option>
                    <option value="true">はい</option>
                  </select>
                </label>

                <label className="form-field">
                  <span className="field-label">命定値</span>
                  <select
                    className="field-control"
                    value={form.epitomizedPathPoints}
                    onChange={updateField('epitomizedPathPoints')}
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                  </select>
                </label>
              </div>
            </div>
          </section>

          <section className="panel">
            <p className="section-label">Resources</p>
            <h2>リソースを入力</h2>

            <div className="panel-split">
              <div className="split-column">
                <h3>所持リソース</h3>

                <label className="form-field">
                  <span className="field-label field-label--with-icon">
                    <img className="resource-icon" src={primogemIcon} alt="原石" />
                    <span>原石</span>
                  </span>
                  <input
                    className="field-control"
                    type="number"
                    min="0"
                    value={form.primogems}
                    onChange={updateField('primogems')}
                    placeholder="所持数を入力"
                  />
                </label>

                <label className="form-field">
                  <span className="field-label field-label--with-icon">
                    <img
                      className="resource-icon"
                      src={intertwinedFateIcon}
                      alt="紡がれた運命"
                    />
                    <span>紡がれた運命</span>
                  </span>
                  <input
                    className="field-control"
                    type="number"
                    min="0"
                    value={form.intertwinedFates}
                    onChange={updateField('intertwinedFates')}
                    placeholder="所持数を入力"
                  />
                </label>

                <label className="form-field">
                  <span className="field-label field-label--with-icon">
                    <img className="resource-icon" src={starlightIcon} alt="スターライト" />
                    <span>スターライト</span>
                  </span>
                  <input
                    className="field-control"
                    type="number"
                    min="0"
                    value={form.starlight}
                    onChange={updateField('starlight')}
                    placeholder="所持数を入力"
                  />
                </label>
              </div>

              <div className="resource-summary">
                <h3>換算結果</h3>

                <div className="summary-card">
                  <p className="summary-label">原石換算</p>
                  <p className="summary-value">
                    {resources.totalPrimogemEquivalent.toLocaleString()} 個
                  </p>
                </div>

                <div className="summary-card">
                  <p className="summary-label">実質ガチャ回数</p>
                  <p className="summary-value">
                    {resources.totalWishCount.toLocaleString()} 連
                  </p>
                </div>

                <p className="field-help">
                  ※スターライトは {STARLIGHT_PER_INTERTWINED_FATE} 個で紡がれた運命
                  1 個に交換できる前提で計算しています。
                </p>
                <p className="field-help">
                  ※スターライト換算分: {resources.starlightConvertibleFates.toLocaleString()} 回分
                </p>
              </div>
            </div>
          </section>

          <section className="panel">
            <p className="section-label">Results</p>
            <h2>計算結果</h2>

            <div className="results-grid results-grid--primary">
              <div className="summary-card summary-card--accent">
                <p className="summary-label">必要なガチャ回数の期待値</p>
                <p className="summary-value">約 {numberLabel(totalExpectedWishes)} 連</p>
                <p className="field-help">
                  原石換算: 約 {Math.round(totalExpectedPrimogems).toLocaleString()} 個
                </p>
              </div>

              <div className={`summary-card ${probabilityToneClass(successProbability)}`}>
                <p className="summary-label">所持リソースで達成できる確率</p>
                <p className="summary-value">{probabilityLabel(successProbability)}</p>
                <p className="field-help">
                  期待値まであと {expectedPrimogemGap.toLocaleString()} 原石
                </p>
              </div>
            </div>

            <details className="result-details">
              <summary className="result-details__summary">キャラ祈願と武器祈願の詳細を見る</summary>

              <div className="detail-grid">
                <div className="detail-card">
                  <h3>キャラ祈願の内訳</h3>
                  <p className="detail-row">
                    <span>期待原石</span>
                    <strong>{Math.round(characterPlan.expectedPrimogems).toLocaleString()} 個</strong>
                  </p>
                  <p className="detail-row">
                    <span>{characterTargetProbability}%での必要原石数</span>
                    <strong>{Math.round(characterRequiredPrimogems).toLocaleString()} 個</strong>
                  </p>
                  <label className="detail-slider">
                    <span className="detail-slider__header">想定する確率ライン</span>
                    <div className="detail-slider__control">
                      <input
                        className="detail-slider__input detail-slider__input--character"
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={characterTargetProbability}
                        onChange={(event) =>
                          setCharacterTargetProbability(Number(event.target.value))
                        }
                      />
                      <strong className="detail-slider__value">{characterTargetProbability}%</strong>
                    </div>
                  </label>
                </div>

                <div className="detail-card">
                  <h3>武器祈願の内訳</h3>
                  <p className="detail-row">
                    <span>期待原石</span>
                    <strong>{Math.round(weaponPlan.expectedPrimogems).toLocaleString()} 個</strong>
                  </p>
                  <p className="detail-row">
                    <span>{weaponTargetProbability}%での必要原石数</span>
                    <strong>{Math.round(weaponRequiredPrimogems).toLocaleString()} 個</strong>
                  </p>
                  <label className="detail-slider">
                    <span className="detail-slider__header">想定する確率ライン</span>
                    <div className="detail-slider__control">
                      <input
                        className="detail-slider__input detail-slider__input--weapon"
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={weaponTargetProbability}
                        onChange={(event) =>
                          setWeaponTargetProbability(Number(event.target.value))
                        }
                      />
                      <strong className="detail-slider__value">{weaponTargetProbability}%</strong>
                    </div>
                  </label>
                </div>
              </div>
            </details>
          </section>
        </section>
      </main>
      <footer className="site-footer">
        <div className="site-footer__inner">
          <p className="site-footer__text">このサイトは『原神』のファンサイトです。</p>
          <p className="site-footer__text">
            計算結果は確率モデルに基づく目安であり、実際の結果を保証するものではありません。
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
