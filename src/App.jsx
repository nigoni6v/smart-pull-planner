import './App.css'

function App() {
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">Genshin Impact Character Banner Planner</p>
        <h1>原神ガチャプランナー</h1>
        <p className="hero-copy">
          ✦限定キャラ祈願で目標の凸数に届くまで、どれくらいの原石と連数が必要かを
          見積もるシミュレーターをこれから少しずつ作っていきます。
        </p>
      </section>

      <section className="workspace-grid">
        <section className="panel">
          <p className="section-label">Step 1</p>
          <h2>入力エリア</h2>
          <p className="panel-copy">
            まずはここに入力フォームを置いていきます。今は見た目の土台だけを作っています。
          </p>
        </section>

        <section className="panel">
          <p className="section-label">Step 2</p>
          <h2>結果エリア</h2>
          <p className="panel-copy">
            あとで期待連数、必要原石数、到達確率をここに表示します。
          </p>
        </section>
      </section>
    </main>
  )
}

export default App
