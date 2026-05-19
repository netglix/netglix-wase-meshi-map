import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('../src/Map'), { ssr: false })

type Place = {
  name: string
  budget: string
  open_hours: string
  photo_url?: string
  comment?: string
  mood?: string
  lat: number
  lng: number
}

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([])
  const [budgetFilter, setBudgetFilter] = useState<string>('all')
  const [moodFilter, setMoodFilter] = useState<string>('all')
  const [selected, setSelected] = useState<Place | null>(null)

  useEffect(() => {
    fetch('/api/restaurants')
      .then((r) => r.json())
      .then((data) => setPlaces(data))
  }, [])

  const budgets = Array.from(new Set(places.map(p => p.budget))).filter(Boolean)
  const moods = Array.from(new Set(places.map(p => p.mood))).filter(Boolean)

  const filtered = places.filter(p => {
    if (budgetFilter !== 'all' && p.budget !== budgetFilter) return false
    if (moodFilter !== 'all' && p.mood !== moodFilter) return false
    return true
  })

  return (
    <div style={{display:'flex',height:'100vh'}}>
      <div style={{flex:1}}>
        <Map
          places={filtered}
          center={[35.7125,139.7181]}
          onSelect={(p: Place) => setSelected(p)}
        />
      </div>
      <aside style={{width:350,borderLeft:'1px solid #eee',padding:16,overflowY:'auto'}}>
        <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h2>早稲めし</h2>
          <a href={process.env.NEXT_PUBLIC_GOOGLE_FORM_URL || 'https://forms.gle/hELpM4ZsWbsfdEdU7'} target="_blank" rel="noreferrer" style={{background:'#0070f3',color:'#fff',padding:'8px 12px',borderRadius:6,textDecoration:'none'}}>投稿する</a>
        </header>

        <div style={{marginTop:12}}>
          <label>予算</label>
          <select value={budgetFilter} onChange={e => setBudgetFilter(e.target.value)} style={{width:'100%',marginTop:6}}>
            <option value="all">すべて</option>
            {budgets.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div style={{marginTop:12}}>
          <label>ムード</label>
          <select value={moodFilter} onChange={e => setMoodFilter(e.target.value)} style={{width:'100%',marginTop:6}}>
            <option value="all">すべて</option>
            {moods.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div style={{marginTop:16}}>
          {filtered.map((p, i) => (
            <div key={i} style={{display:'flex',gap:8,padding:8,borderBottom:'1px solid #f0f0f0',cursor:'pointer'}} onClick={() => setSelected(p)}>
              <img src={p.photo_url} alt="" style={{width:80,height:60,objectFit:'cover',borderRadius:6}}/>
              <div>
                <strong>{p.name}</strong>
                <div style={{fontSize:12,color:'#666'}}>{p.budget} ・ {p.open_hours}</div>
                <div style={{fontSize:13,marginTop:6}}>{p.comment}</div>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div style={{position:'fixed',right:16,bottom:16,width:320,background:'#fff',boxShadow:'0 8px 24px rgba(0,0,0,0.12)',borderRadius:8,padding:12}}>
            <button onClick={() => setSelected(null)} style={{float:'right'}}>閉じる</button>
            <h3>{selected.name}</h3>
            <img src={selected.photo_url} style={{width:'100%',height:180,objectFit:'cover',borderRadius:6}}/>
            <p style={{marginTop:8}}>{selected.comment}</p>
            <div style={{fontSize:13,color:'#666'}}>{selected.budget} ・ {selected.open_hours}</div>
          </div>
        )}

      </aside>
    </div>
  )
}
