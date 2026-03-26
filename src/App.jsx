import './App.css'

function App() {
  return (
    <>
      <header className="site-band">
        <div className="site-band__inner">
          <p className="eyebrow">Genshin Smart Pull Planner</p>
          <h1>原神ガチャプランナー</h1>
        </div>
      </header>

      <main className="app-shell">
        <section className="hero-panel">
          <p className="hero-copy">
            <h2>原神のガチャをいろんな条件でシミュレーション</h2>
            ✦使用方法✦<br />
            1．引きたいキャラの凸数、精錬数を入力<br />
            2．所持しているリソースを入力（原石、紡がれた運命、スターライト）<br />
            3．シミュレーション開始ボタンを押すと結果が表示されます
          </p>
        </section>

        <section className="workspace-grid">
          <section className="panel">
            <h2>ガチャ条件を入力</h2>
            <p className="panel-copy">
              キャラ<br />
              現在の所持状況<br />
              目標凸数
            </p>
          </section>

          <section className="panel">
            <p className="section-label">Step 2</p>
            <h2>邨先棡繧ｨ繝ｪ繧｢</h2>
            <p className="panel-copy">
              縺ゅ→縺ｧ譛溷ｾ・｣謨ｰ縲∝ｿ・ｦ∝次遏ｳ謨ｰ縲∝芦驕皮｢ｺ邇・ｒ縺薙％縺ｫ陦ｨ遉ｺ縺励∪縺吶・
            </p>
          </section>
        </section>
      </main>
    </>
  )
}

export default App
