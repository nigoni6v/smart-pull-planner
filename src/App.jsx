import { useState } from 'react'
import intertwinedFateIcon from './assets/Intertwined Fate.png'
import starlightIcon from './assets/Masterless Starglitter.png'
import primogemIcon from './assets/primogem.png'
import './App.css'

const PRIMOGEMS_PER_WISH = 160
const STARLIGHT_PER_INTERTWINED_FATE = 5

function App() {
  const [resources, setResources] = useState({
    primogems: '',
    intertwinedFates: '',
    starlight: '',
  })

  const handleResourceChange = (key) => (event) => {
    setResources((prev) => ({
      ...prev,
      [key]: event.target.value,
    }))
  }

  const primogems = Number(resources.primogems) || 0
  const intertwinedFates = Number(resources.intertwinedFates) || 0
  const starlight = Number(resources.starlight) || 0

  const starlightConvertibleFates = Math.floor(
    starlight / STARLIGHT_PER_INTERTWINED_FATE,
  )
  const totalPrimogemEquivalent =
    primogems +
    intertwinedFates * PRIMOGEMS_PER_WISH +
    starlightConvertibleFates * PRIMOGEMS_PER_WISH
  const totalWishCount = Math.floor(totalPrimogemEquivalent / PRIMOGEMS_PER_WISH)

  return (
    <>
      <header className="site-band">
        <div className="site-band__inner">
          <p className="eyebrow">Genshin Smart Pull Planner</p>
          <h1>原神ガチャシミュレーター</h1>
        </div>
      </header>

      <main className="app-shell">
        <section className="hero-panel">
          <h2>ガチャシミュレーションの使い方</h2>
          <p className="hero-copy">
            使用方法
            <br />
            1. 引きたいキャラの情報を入力
            <br />
            2. 現在の所持状況を確認して入力
            <br />
            3. 条件を決めて必要数を確認
          </p>
        </section>

        <section className="workspace-grid">
          <section className="panel">
            <h2>ガチャ条件を入力</h2>

            <div className="panel-split">
              <div className="split-column">
                <h3>キャラ</h3>

                <label className="form-field">
                  <span className="field-label">現在の凸数</span>
                  <select className="field-control" defaultValue="未所持">
                    <option>未所持</option>
                    <option>無凸</option>
                    <option>1凸</option>
                    <option>2凸</option>
                    <option>3凸</option>
                    <option>4凸</option>
                    <option>5凸</option>
                    <option>完凸</option>
                  </select>
                </label>

                <label className="form-field">
                  <span className="field-label">目標凸数</span>
                  <select className="field-control" defaultValue="未選択">
                    <option>未選択</option>
                    <option>無凸</option>
                    <option>1凸</option>
                    <option>2凸</option>
                    <option>3凸</option>
                    <option>4凸</option>
                    <option>5凸</option>
                    <option>完凸</option>
                  </select>
                </label>
              </div>

              <div className="split-column">
                <h3>武器</h3>

                <label className="form-field">
                  <span className="field-label">現在の精錬数</span>
                  <select className="field-control" defaultValue="未選択">
                    <option>未選択</option>
                    <option>精錬1</option>
                    <option>精錬2</option>
                    <option>精錬3</option>
                    <option>精錬4</option>
                    <option>精錬5</option>
                  </select>
                </label>

                <label className="form-field">
                  <span className="field-label">目標精錬数</span>
                  <select className="field-control" defaultValue="未選択">
                    <option>未選択</option>
                    <option>精錬1</option>
                    <option>精錬2</option>
                    <option>精錬3</option>
                    <option>精錬4</option>
                    <option>精錬5</option>
                  </select>
                </label>
              </div>
            </div>
          </section>

          <section className="panel">
            <h2>リソースを入力</h2>
            <div className="panel-split">
              <div className="split-column">
                <label className="form-field">
                  <span className="field-label field-label--with-icon">
                    <img className="resource-icon" src={primogemIcon} alt="原石" />
                    <span>原石</span>
                  </span>
                  <input
                    className="field-control"
                    type="number"
                    min="0"
                    value={resources.primogems}
                    onChange={handleResourceChange('primogems')}
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
                    value={resources.intertwinedFates}
                    onChange={handleResourceChange('intertwinedFates')}
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
                    value={resources.starlight}
                    onChange={handleResourceChange('starlight')}
                    placeholder="所持数を入力"
                  />
                </label>
              </div>

              <div className="resource-summary">
                <h3>換算結果</h3>

                <div className="summary-card">
                  <p className="summary-label">原石換算</p>
                  <p className="summary-value">{totalPrimogemEquivalent.toLocaleString()} 個</p>
                </div>

                <div className="summary-card">
                  <p className="summary-label">実質ガチャ回数</p>
                  <p className="summary-value">{totalWishCount.toLocaleString()} 連</p>
                </div>

                <p className="field-help">
                  ※スターライトは {STARLIGHT_PER_INTERTWINED_FATE} 個で紡がれた運命 1 個に交換できる前提で計算しています。
                </p>
                <p className="field-help">
                  ※スターライト換算分: {starlightConvertibleFates.toLocaleString()} 回分
                </p>
              </div>
            </div>
          </section>
        </section>
      </main>
    </>
  )
}

export default App
