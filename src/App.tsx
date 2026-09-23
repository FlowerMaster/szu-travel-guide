import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { places, placeById } from './data/places'
import { routes } from './data/routes'
import { nearbyRoutes } from './data/nearby'
import { canteens } from './data/canteens'
import sceneManifest from './data/sceneManifest.json'
import type { ModeId, Place, Route } from './types'

const modeLabels: Record<ModeId, string> = {
  classic: '经典参观',
  photo: '拍照出片',
  family: '亲子遛娃',
  walk: '安静散步',
  architecture: '人文建筑',
  free: '自由探索',
}

const coreNames = new Set(places.map((place) => place.name))
const coreSceneIds = new Set(places.flatMap((place) => place.panorama ? [place.panorama.sceneId] : []))
const visitorSceneNames = new Set(['友谊林', '星空广场', '桑田广场'])
const extraPlaces: Place[] = sceneManifest
  .filter((item) => visitorSceneNames.has(item.name) && !coreNames.has(item.name) && !coreSceneIds.has(item.sceneId))
  .map((item) => ({
    id: `scene-${item.sceneId}`,
    name: item.name,
    map: { x: 0.5, y: 0.5, priority: 'normal' },
    summary: '看看这个地点的全景，感受校园里的不同角落。',
    access: { status: 'unknown' },
    image: item.image,
    panorama: { provider: '720yun', sceneId: item.sceneId, url: `https://www.720yun.com/t/d8vktwr9sfy?scene_id=${item.sceneId}` },
    navigation: { name: `深圳大学${item.name}` },
    verifiedAt: '2026-09-22',
  }))

const allPlaces = [...places, ...extraPlaces]

function useDialogKeyboard(onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.querySelector<HTMLElement>('button, a, [tabindex="0"]')?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]'))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [])

  return dialogRef
}

function routeFor(mode: ModeId): Route {
  return routes.find((route) => route.id === mode) ?? routes[0]
}

function PlacePanel({
  place,
  route,
  onPanorama,
  onSelect,
  onClose,
  mobileOpen,
  isMobile,
}: {
  place: Place | undefined
  route: Route
  onPanorama: () => void
  onSelect: (id: string) => void
  onClose: () => void
  mobileOpen: boolean
  isMobile: boolean
}) {
  if (!place) return null
  const routeIndex = route.placeIds.indexOf(place.id)
  const isInRoute = routeIndex >= 0

  return (
    <aside className={`route-panel ${mobileOpen ? 'is-open' : ''}`} aria-label="地点详情" role={isMobile && mobileOpen ? 'dialog' : undefined} aria-modal={isMobile && mobileOpen ? true : undefined} inert={isMobile && !mobileOpen}>
      <div className="panel-handle" aria-hidden="true" />
      <div className="panel-topline">
        <span>{isInRoute ? `第 ${routeIndex + 1} 站` : '地点详情'}</span>
        <button className="icon-button mobile-only" type="button" onClick={onClose} aria-label="关闭地点详情">×</button>
      </div>
      {route.placeIds.length > 0 && (
        <div className="route-steps" aria-label={`${route.title}路线顺序`}>
          {route.placeIds.map((placeId, index) => {
            const stepPlace = placeById[placeId]
            return stepPlace ? (
              <button key={placeId} type="button" className={stepPlace.id === place.id ? 'active' : ''} onClick={() => onSelect(placeId)}>
                <b>{index + 1}</b><span>{stepPlace.name}</span>
              </button>
            ) : null
          })}
        </div>
      )}
      {route.transportNote && <p className="transport-note">{route.transportNote}</p>}
      <div className="place-image-wrap">
        <img src={place.image} alt={`${place.name}场景`} loading="lazy" />
      </div>
      <div className="place-copy">
        <h2>{place.name}</h2>
        <p className="place-summary">{place.summary}</p>
        {place.whyVisit && <p className="place-why">{place.whyVisit}</p>}
        <div className="place-facts">
          {place.practical?.food && <span>补给：{place.practical.food}</span>}
          {place.practical?.shade && <span>遮阴：{place.practical.shade}</span>}
        </div>
        {place.highlights && (
          <div className="detail-list">
            <h3>这里看什么</h3>
            <ul>{place.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        )}
        {place.photoTips && (
          <div className="detail-list">
            <h3>拍照提示</h3>
            <ul>{place.photoTips.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        )}
        <div className="panel-actions">
          {place.panorama && <button className="button primary" type="button" onClick={onPanorama}>查看全景</button>}
          <a className="button secondary" href={`https://map.baidu.com/search/${encodeURIComponent(place.navigation?.name ?? place.name)}`} target="_blank" rel="noreferrer">在地图中搜索</a>
        </div>
        {isInRoute && (route.placeIds[routeIndex + 1] ? (
          <div className="next-stop">
            <span>下一站</span>
            <button type="button" onClick={() => onSelect(route.placeIds[routeIndex + 1])}>
              {placeById[route.placeIds[routeIndex + 1]]?.name ?? route.title} <b>→</b>
            </button>
          </div>
        ) : (
          <div className="next-stop finished">
            <span>路线最后一站</span>
            <p>接下来可以从周边路线继续选择吃喝玩乐。</p>
          </div>
        ))}
      </div>
    </aside>
  )
}

function MapSurface({
  route,
  selectedId,
  onSelect,
}: {
  route: Route
  selectedId: string
  onSelect: (id: string) => void
}) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragOrigin = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 })
  const routePlaces = route.placeIds.map((id) => placeById[id]).filter(Boolean)
  const markerPlaces = places
  const points = routePlaces.map((place) => `${place.map.x * 100},${place.map.y * 100}`).join(' ')

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragOrigin.current = { x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y }
    setDragging(true)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    setOffset({
      x: dragOrigin.current.offsetX + (event.clientX - dragOrigin.current.x),
      y: dragOrigin.current.offsetY + (event.clientY - dragOrigin.current.y),
    })
  }

  const stopDrag = () => setDragging(false)

  return (
    <div className="map-shell">
      <div className="map-toolbar">
        <span className="map-status">当前路线：{route.title}</span>
        <div className="map-controls">
          <button type="button" onClick={() => setScale((value) => Math.min(1.8, value + 0.2))} aria-label="放大地图">+</button>
          <button type="button" onClick={() => setScale((value) => Math.max(1, value - 0.2))} aria-label="缩小地图">−</button>
          <button type="button" onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }) }} aria-label="重置地图">重置</button>
        </div>
      </div>
      <div
        className={`map-viewport ${dragging ? 'is-dragging' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        <div className="map-canvas" style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})` }}>
          <img src="/assets/map/szu-yuehai-canghai-map-clear.png" alt="深圳大学粤海与沧海校区校园地图" draggable="false" />
          <svg className="route-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline points={points} />
          </svg>
          {markerPlaces.map((place) => {
            const routeIndex = route.placeIds.indexOf(place.id)
            return (
              <button
                key={place.id}
                type="button"
                className={`map-marker ${routeIndex >= 0 ? 'route-marker' : ''} ${selectedId === place.id ? 'selected' : ''}`}
                style={{ left: `${place.map.x * 100}%`, top: `${place.map.y * 100}%` }}
                onClick={() => onSelect(place.id)}
                title={place.name}
                aria-label={`查看${place.name}`}
              >
                <span>{routeIndex >= 0 ? routeIndex + 1 : ''}</span>
                {(routeIndex >= 0 || place.mapLabel) && <em className={`marker-label ${routeIndex < 0 ? 'context-label' : ''}`}>{place.name}</em>}
              </button>
            )
          })}
        </div>
      </div>
      <p className="map-hint">可拖动、放大地图；连线表示游览顺序。</p>
    </div>
  )
}

function ClearMapLayer({ onClose }: { onClose: () => void }) {
  const dialogRef = useDialogKeyboard(onClose)
  const [scale, setScale] = useState(1)
  const imageSrc = '/assets/map/szu-yuehai-canghai-map-clear.png'
  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  const mouseOrigin = useRef<{ x: number; y: number; left: number; top: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const observer = new ResizeObserver(() => setViewportSize({ width: viewport.clientWidth, height: viewport.clientHeight }))
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  const fitWidth = Math.min(viewportSize.width, viewportSize.height * (2575 / 3461))
  const imageWidth = fitWidth * scale
  const imageHeight = imageWidth * (3461 / 2575)
  const zoom = (amount: number) => {
    const nextScale = Math.max(1, Math.min(4, Number((scale + amount).toFixed(2))))
    const viewport = viewportRef.current
    if (viewport && nextScale !== scale) {
      const imageLeft = Math.max(0, (viewport.clientWidth - imageWidth) / 2)
      const imageTop = Math.max(0, (viewport.clientHeight - imageHeight) / 2)
      const centerX = (viewport.scrollLeft + viewport.clientWidth / 2 - imageLeft) / scale
      const centerY = (viewport.scrollTop + viewport.clientHeight / 2 - imageTop) / scale
      const nextWidth = fitWidth * nextScale
      const nextHeight = nextWidth * (3461 / 2575)
      requestAnimationFrame(() => {
        viewport.scrollLeft = Math.max(0, (viewport.clientWidth - nextWidth) / 2) + centerX * nextScale - viewport.clientWidth / 2
        viewport.scrollTop = Math.max(0, (viewport.clientHeight - nextHeight) / 2) + centerY * nextScale - viewport.clientHeight / 2
      })
    }
    setScale(nextScale)
  }
  const reset = () => { setScale(1); viewportRef.current?.scrollTo(0, 0) }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || scale === 1) return
    const viewport = event.currentTarget
    mouseOrigin.current = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!mouseOrigin.current) return
    event.currentTarget.scrollLeft = mouseOrigin.current.left + mouseOrigin.current.x - event.clientX
    event.currentTarget.scrollTop = mouseOrigin.current.top + mouseOrigin.current.y - event.clientY
  }
  const stopDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!mouseOrigin.current) return
    mouseOrigin.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    setDragging(false)
  }

  return (
    <div ref={dialogRef} className="clear-map-layer" role="dialog" aria-modal="true" aria-label="无标记校园地图">
      <header className="clear-map-header">
        <button className="back-button" type="button" onClick={onClose}>← 返回路线地图</button>
        <div><strong>无标记校园地图</strong><span>查看道路、校门与建筑原图</span></div>
        <div className="clear-map-controls" aria-label="地图缩放控制">
          <button type="button" onClick={() => zoom(-0.5)} disabled={scale === 1} aria-label="缩小无标记地图">−</button>
          <button type="button" onClick={reset} aria-label="重置无标记地图">重置</button>
          <button type="button" onClick={() => zoom(0.5)} disabled={scale === 4} aria-label="放大无标记地图">＋</button>
        </div>
      </header>
      <div
        ref={viewportRef}
        className={`clear-map-viewport ${dragging ? 'is-dragging' : ''}`}
        role="img"
        aria-label="深圳大学粤海与沧海校区无应用标记校园地图，放大后可拖动查看"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onKeyDown={(event) => {
          if (scale === 1) return
          const step = event.shiftKey ? 80 : 40
          if (event.key === 'ArrowLeft') event.currentTarget.scrollBy({ left: -step })
          else if (event.key === 'ArrowRight') event.currentTarget.scrollBy({ left: step })
          else if (event.key === 'ArrowUp') event.currentTarget.scrollBy({ top: -step })
          else if (event.key === 'ArrowDown') event.currentTarget.scrollBy({ top: step })
          else return
          event.preventDefault()
        }}
      >
        <div className="clear-map-canvas" style={{ width: Math.max(viewportSize.width, imageWidth), height: Math.max(viewportSize.height, imageHeight) }}>
          <img src={imageSrc} alt="深圳大学粤海与沧海校区原始校园地图，无应用标记点" draggable="false" style={{ width: imageWidth, height: imageHeight }} />
        </div>
      </div>
      <p className="clear-map-hint">点击＋放大，再用手指滑动地图；也可用方向键移动。</p>
    </div>
  )
}

function PanoramaLayer({ place, onClose }: { place: Place; onClose: () => void }) {
  const dialogRef = useDialogKeyboard(onClose)
  return (
    <div ref={dialogRef} className="panorama-layer" role="dialog" aria-modal="true" aria-label={`${place.name}全景`}>
      <header className="panorama-header">
        <button className="back-button" type="button" onClick={onClose}>← 返回地图</button>
        <div>
          <strong>{place.name}</strong>
          <span>校园全景</span>
        </div>
        <a href={place.panorama?.url} target="_blank" rel="noreferrer">单独打开全景</a>
      </header>
      <div className="panorama-frame-wrap">
        {place.panorama ? (
          <iframe src={place.panorama.url} title={`${place.name}全景`} allow="fullscreen; autoplay; xr-spatial-tracking" />
        ) : (
          <div className="panorama-error">该地点暂时没有全景入口。</div>
        )}
      </div>
      <div className="panorama-note">全景未显示？可点击“单独打开全景”。</div>
    </div>
  )
}

function CanteenLayer({ canteen, onClose }: { canteen: typeof canteens[number]; onClose: () => void }) {
  const mappedPlace = canteen.id === 'tingli' ? placeById['tingli-restaurant'] : undefined
  const dialogRef = useDialogKeyboard(onClose)

  return (
    <div ref={dialogRef} className="canteen-layer" role="dialog" aria-modal="true" aria-label={`${canteen.name}详情`}>
      <header className="canteen-layer-header">
        <button className="back-button" type="button" onClick={onClose}>← 返回餐厅列表</button>
        <div>
          <strong>{canteen.name}</strong>
          <span>{canteen.area}</span>
        </div>
      </header>
      <main className="canteen-detail page-width">
        <div className="canteen-detail-visuals">
          <figure className={`canteen-detail-media ${canteen.id === 'tingshan' ? 'is-tall' : ''}`}>
            <img src={canteen.image} alt={canteen.imageAlt} />
            <figcaption>餐厅环境示意</figcaption>
          </figure>
          {mappedPlace ? (
            <figure className="canteen-map-inset">
              <div className="canteen-map-thumbnail">
                <img src="/assets/map/szu-yuehai-canghai-map-clear.png" alt="听荔餐厅在校园地图上的位置" loading="lazy" />
                <span
                  className="canteen-map-pin"
                  style={{ left: `${mappedPlace.map.x * 100}%`, top: `${mappedPlace.map.y * 100}%` }}
                  aria-hidden="true"
                ><span /></span>
              </div>
              <figcaption className="canteen-map-caption">
                <span>校内位置</span>
                <strong>{canteen.name}</strong>
                <small>{canteen.area}</small>
              </figcaption>
            </figure>
          ) : (
            <div className="canteen-area-note"><span>校内位置</span><strong>{canteen.area}</strong></div>
          )}
        </div>
        <div className="canteen-detail-copy">
          <h1>{canteen.name}</h1>
          <p className="canteen-detail-summary">{canteen.summary}</p>
          <section className="canteen-detail-block">
            <h2>可以留意这些口味</h2>
            <div className="dish-list detail-dishes">{canteen.dishes.map((dish) => <span key={dish}>{dish}</span>)}</div>
          </section>
          <p className="canteen-detail-note">{canteen.note}</p>
        </div>
      </main>
    </div>
  )
}

function VisitPage({ onBack }: { onBack: () => void }) {
  const arrivalRoutes = [
    { gate: '北门 / 立功门', role: '经典参观起点', text: '适合先看校园全貌，再接校园小巴、图书馆、文山湖和校友广场。', mapName: '深圳大学立功门（北门）' },
    { gate: '立德门 / 正门', role: '城市步行起点', text: '适合拍入口、慢慢走进校园，再接文山湖和人文建筑线。', mapName: '深圳大学立德门' },
    { gate: '沧海校区 / 深大南站方向', role: '路线终点', text: '适合从洞洞楼结束校园游，再接后海、深圳湾万象城或人才公园。', mapName: '深圳大学深大南站' },
    { gate: '东北门', role: '出校吃小吃', text: '适合校园散步结束后接东北门附近小吃街，傍晚摊位会更完整。', mapName: '深圳大学东北门附近小吃街' },
  ]

  return (
    <div className="visit-page">
      <header className="top-nav visit-nav">
        <button className="back-button light-back" type="button" onClick={onBack}>← 返回互动地图</button>
        <span className="brand-mark">SZU</span>
      </header>
      <main className="visit-main page-width">
        <div className="visit-hero">
          <p className="eyebrow">ARRIVAL / EXIT / NEXT STOP</p>
          <h1>预约与到达</h1>
          <p>先选入口，再决定怎么玩。校园路线和出校后的吃喝玩乐可以连在一起。</p>
        </div>
        <section className="visit-card visit-appointment">
          <div>
            <span className="card-kicker">预约入口</span>
            <h2>深圳大学校园参观预约</h2>
            <p>在微信搜索“深圳大学校园参观预约”小程序，按页面指引选择校区和参观时段。</p>
          </div>
          <div className="visit-actions">
            <div className="mini-program-name">微信搜索：深圳大学校园参观预约</div>
            <span>可预约时段以小程序显示为准</span>
          </div>
        </section>
        <section className="visit-section">
          <div className="section-heading">
            <h2>从哪个门开始</h2>
            <p>不同入口适合不同玩法。选好之后，回到地图接着走。</p>
          </div>
          <div className="arrival-grid">
            {arrivalRoutes.map((item) => (
              <article className="arrival-card" key={item.gate}>
                <span>{item.role}</span>
                <h3>{item.gate}</h3>
                <p>{item.text}</p>
                <a href={`https://map.baidu.com/search/${encodeURIComponent(item.mapName)}`} target="_blank" rel="noreferrer">在地图中搜索 ↗</a>
              </article>
            ))}
          </div>
        </section>
        <section className="visit-section visit-flow">
          <div className="section-heading">
            <h2>一条线接起来</h2>
          </div>
          <div className="visit-flow-line">
            <span>选入口</span><b>→</b><span>选校园玩法</span><b>→</b><span>点地点看全景</span><b>→</b><span>出校接周边</span>
          </div>
        </section>
      </main>
    </div>
  )
}

function App() {
  const [page, setPage] = useState<'home' | 'visit'>(() => window.location.hash === '#visit' ? 'visit' : 'home')
  const [mode, setMode] = useState<ModeId>('classic')
  const route = routeFor(mode)
  const [selectedId, setSelectedId] = useState(route.placeIds[0] ?? places[0].id)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [panoramaPlace, setPanoramaPlace] = useState<Place>()
  const [canteenDetail, setCanteenDetail] = useState<typeof canteens[number]>()
  const [clearMapOpen, setClearMapOpen] = useState(false)
  const clearMapTriggerRef = useRef<HTMLButtonElement>(null)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [query, setQuery] = useState('')
  const firstAdditionalPlaceRef = useRef<HTMLButtonElement>(null)
  const shouldRevealAdditionalPlaceRef = useRef(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 760px)').matches)
  const sheetTriggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const syncHash = () => setPage(window.location.hash === '#visit' ? 'visit' : 'home')
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [])

  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)')
    const update = () => setIsMobile(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!isMobile || !sheetOpen || panoramaPlace || canteenDetail || clearMapOpen) return
    const panel = document.querySelector<HTMLElement>('.route-panel')
    panel?.querySelector<HTMLElement>('.panel-topline button')?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setSheetOpen(false)
      }
      if (event.key !== 'Tab' || !panel) return
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      sheetTriggerRef.current?.focus()
    }
  }, [isMobile, sheetOpen, panoramaPlace, canteenDetail, clearMapOpen])

  const selectedPlace = allPlaces.find((place) => place.id === selectedId) ?? placeById[route.placeIds[0]] ?? places[0]
  const filteredPlaces = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return catalogOpen ? allPlaces : places
    return allPlaces.filter((place) => place.name.toLowerCase().includes(normalized) || place.summary.toLowerCase().includes(normalized))
  }, [catalogOpen, query])
  const hasSearchQuery = query.trim().length > 0
  const visiblePlaces = filteredPlaces.slice(0, catalogOpen || hasSearchQuery ? allPlaces.length : 12)

  useEffect(() => {
    if (!catalogOpen || hasSearchQuery || !shouldRevealAdditionalPlaceRef.current) return
    shouldRevealAdditionalPlaceRef.current = false
    const firstAdditionalPlace = firstAdditionalPlaceRef.current
    if (!firstAdditionalPlace) return
    firstAdditionalPlace.focus({ preventScroll: true })
    firstAdditionalPlace.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    })
  }, [catalogOpen, hasSearchQuery])

  const selectMode = (nextMode: ModeId) => {
    setMode(nextMode)
    setSelectedId(routeFor(nextMode).placeIds[0] ?? places[0].id)
    setSheetOpen(false)
  }

  const selectPlace = (id: string) => {
    if (document.activeElement instanceof HTMLElement && !document.activeElement.closest('.route-panel')) {
      sheetTriggerRef.current = document.activeElement
    }
    setSelectedId(id)
    setSheetOpen(true)
  }

  if (page === 'visit') return <VisitPage onBack={() => { window.location.hash = ''; setPage('home') }} />

  return (
    <div className="app-shell">
      <header className="top-nav" inert={Boolean(panoramaPlace || canteenDetail || clearMapOpen)}>
        <a className="brand" href="#top" aria-label="来深圳大学怎么玩首页">
          <span className="brand-mark">SZU</span>
          <span>来深圳大学怎么玩</span>
        </a>
        <div className="nav-meta"><span>粤海 × 沧海</span><a href="#nearby">周边路线</a><a href="#visit">预约与到达</a></div>
      </header>

      <main id="top" inert={Boolean(panoramaPlace || canteenDetail || clearMapOpen)}>
        <section className="hero-section page-width">
          <div className="hero-copy">
            <p className="eyebrow">SHENZHEN UNIVERSITY / YUEHAI + CANGHAI</p>
            <h1>来深圳大学<br /><em>怎么玩</em></h1>
          <p className="hero-subtitle">选一条路线，看校园风景、餐厅和出校后的下一站。</p>
            <div className="mode-selector" aria-label="选择玩法">
              {routes.map((item) => (
                <button key={item.id} type="button" className={mode === item.id ? 'active' : ''} aria-pressed={mode === item.id} onClick={() => selectMode(item.id)}>{modeLabels[item.id]}</button>
              ))}
            </div>
          </div>
        </section>

        <section className="shuttle-panel page-width" aria-labelledby="shuttle-title">
          <div className="shuttle-panel-heading">
            <div><h2 id="shuttle-title">校园小巴线路</h2><p>查看校方线路与站点，安排校内行程。</p></div>
            <a href="https://kpeak.szu.edu.cn:8443/" target="_blank" rel="noopener noreferrer">打开校方小巴页面 ↗</a>
          </div>
        </section>

        <section className="workspace page-width" aria-label="互动校园地图">
          <div className="workspace-header">
            <div>
              <h2>{route.title}</h2>
              <p>{route.description}</p>
            </div>
            <span className="duration">{route.durationLabel ?? '自由探索'}</span>
          </div>
          <div className="route-preview" aria-label="路线顺序">
            {route.placeIds.length > 0 ? route.placeIds.map((placeId, index) => (
              <button key={placeId} type="button" onClick={() => selectPlace(placeId)}>
                <b>{index + 1}</b><span>{placeById[placeId]?.name}</span>
              </button>
            )) : <span className="free-preview">自由探索：直接点击地图节点，按自己的节奏选择下一站。</span>}
          </div>
          <div className="workspace-grid">
            <MapSurface route={route} selectedId={selectedId} onSelect={selectPlace} />
            {isMobile && sheetOpen && <button className="sheet-backdrop" type="button" onClick={() => setSheetOpen(false)} aria-label="关闭地点详情" tabIndex={-1} />}
            <PlacePanel place={selectedPlace} route={route} onPanorama={() => setPanoramaPlace(selectedPlace)} onSelect={selectPlace} onClose={() => setSheetOpen(false)} mobileOpen={sheetOpen} isMobile={isMobile} />
          </div>
          <div className="clear-map-entry">
            <div><strong>想自己对照地图找路？</strong><span>另看一张无标记校园地图，放大查看原图上的道路与建筑。</span></div>
            <button ref={clearMapTriggerRef} type="button" onClick={() => { setSheetOpen(false); setClearMapOpen(true) }}>打开无标记校园地图 →</button>
          </div>
        </section>

        <section className="nearby-section page-width" id="nearby">
          <div className="section-heading">
            <h2>从哪个门出去，去哪里</h2>
            <p>看好出口，再安排出校后的下一站。</p>
          </div>
          <div className="nearby-grid">
            {nearbyRoutes.map((item) => (
              <article className="nearby-card" key={item.id}>
                <div className="nearby-topline"><span>{item.gate}</span><b>{item.type}</b></div>
                <h3>{item.destination}</h3>
                <p>{item.description}</p>
                <div className="nearby-route">{item.route}</div>
                <div className="nearby-bottom"><small>{item.tip}</small><a href={`https://map.baidu.com/search/${encodeURIComponent(item.mapName)}`} target="_blank" rel="noreferrer">在地图中搜索 ↗</a></div>
              </article>
            ))}
          </div>
        </section>

        <section className="canteen-section page-width" id="canteens">
          <div className="section-heading">
            <h2>逛到这里吃什么</h2>
            <p>看看餐厅环境与可选择的口味。</p>
          </div>
          <div className="canteen-grid">
            {canteens.map((canteen) => (
              <article className="canteen-card" key={canteen.id}>
                <div className={`canteen-image ${canteen.id === 'tingshan' ? 'is-tall' : ''}`}>
                  <img src={canteen.image} alt={canteen.imageAlt} loading="lazy" />
                </div>
                <div className="canteen-copy">
                  <div className="canteen-topline"><span>{canteen.area}</span><b>环境示意</b></div>
                  <h3>{canteen.name}</h3>
                  <p>{canteen.summary}</p>
                  <div className="dish-list">{canteen.dishes.map((dish) => <span key={dish}>{dish}</span>)}</div>
                  <button className="canteen-open" type="button" onClick={() => setCanteenDetail(canteen)} aria-label={`查看${canteen.name}详情`}>查看餐厅 →</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="catalog-section page-width">
          <div className="section-heading catalog-heading">
            <div>
              <h2>更多校园地点</h2>
              <p>挑一个感兴趣的地点，看看照片和全景。</p>
              <p className="catalog-count" role="status" aria-live="polite">
                {hasSearchQuery ? `找到 ${visiblePlaces.length} 个地点` : `已显示 ${visiblePlaces.length} / ${allPlaces.length} 个地点`}
              </p>
            </div>
            <div className={`catalog-tools ${hasSearchQuery ? 'is-searching' : ''}`}>
              <label htmlFor="place-search">搜索地点</label>
              <input id="place-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="比如：文山湖" />
              {!hasSearchQuery && allPlaces.length > 12 && (
                <button type="button" onClick={() => {
                  shouldRevealAdditionalPlaceRef.current = !catalogOpen
                  setCatalogOpen((value) => !value)
                }} aria-controls="catalog-grid" aria-expanded={catalogOpen}>
                  {catalogOpen ? '收起至 12 个' : '查看全部'}
                </button>
              )}
            </div>
          </div>
          <div className="catalog-grid" id="catalog-grid">
            {visiblePlaces.map((place, index) => (
              <button
                key={place.id}
                ref={index === 12 && !hasSearchQuery ? firstAdditionalPlaceRef : undefined}
                type="button"
                className={`catalog-card ${selectedId === place.id ? 'selected' : ''} ${index >= 12 && !hasSearchQuery ? 'catalog-card-extra' : ''}`}
                onClick={() => {
                  if (!placeById[place.id] && place.panorama) {
                    setPanoramaPlace(place)
                    return
                  }
                  selectPlace(place.id)
                  const workspace = document.querySelector('.workspace')
                  if (workspace) window.scrollTo({ top: window.scrollY + workspace.getBoundingClientRect().top - 72, behavior: 'smooth' })
                }}
              >
                <img src={place.image} alt={`${place.name}代表图`} loading="lazy" />
                <span>{place.name}</span>
                <small>{placeById[place.id] ? place.panorama ? '照片与全景' : '查看地点' : '打开全景'}</small>
              </button>
            ))}
            {filteredPlaces.length === 0 && <div className="empty-state">没有找到这个地点。试试“文山湖”“图书馆”或“餐厅”。</div>}
          </div>
        </section>

        <section className="practical-section page-width">
          <div className="section-heading">
            <h2>把路线走得舒服一点</h2>
            <p>带上水，留意天气，按体力调整路线。</p>
          </div>
          <div className="practical-grid">
            <div><strong>补给</strong><span>把听荔餐厅等餐饮节点安排在路线中段，避免逛到后半程体力下降。</span></div>
            <div><strong>天气</strong><span>晴天防晒，雨天缩短湖边路线。绿化很丰富，驱蚊水值得放进行前清单。</span></div>
            <div><strong>走法</strong><span>经典路线建议粤海进、沧海出。时间少时，优先保留文山湖、图书馆和洞洞楼。</span></div>
          </div>
        </section>
      </main>

      <footer className="page-footer page-width" inert={Boolean(panoramaPlace || canteenDetail || clearMapOpen)}>
        <div><strong>来深圳大学怎么玩</strong><span>粤海 × 沧海互动旅行地图</span></div>
        <p>按自己的节奏逛校园，享受一路风景。</p>
      </footer>

      {panoramaPlace && <PanoramaLayer place={panoramaPlace} onClose={() => setPanoramaPlace(undefined)} />}
      {canteenDetail && <CanteenLayer canteen={canteenDetail} onClose={() => setCanteenDetail(undefined)} />}
      {clearMapOpen && <ClearMapLayer onClose={() => { setClearMapOpen(false); requestAnimationFrame(() => clearMapTriggerRef.current?.focus()) }} />}
    </div>
  )
}

export default App
