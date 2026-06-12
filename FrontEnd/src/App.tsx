import { useState, useEffect } from 'react'
import './index.css'
import { useCities, useCity } from '@/hooks/useApiCities'
import { calcStats } from '@/hooks/useStats'
import { TopBar } from '@/components/layout/TopBar'
import { NavSidebar, type AppView } from '@/components/layout/NavSidebar'
import { SettingsModal } from '@/components/layout/SettingsModal'
import { ChinaMap } from '@/components/map/ChinaMap'
import { MarkCityModal } from '@/components/map/MarkCityModal'
import { BatchMarkModal } from '@/components/city/BatchMarkModal'
import { StatsPanel } from '@/components/panel/StatsPanel'
import { CityPanel } from '@/components/panel/CityPanel'
import { PosterModal } from '@/components/poster/PosterModal'
import { TimelineView } from '@/components/timeline/TimelineView'
import { GalleryView } from '@/components/gallery/GalleryView'
import { StatsView } from '@/components/stats/StatsView'
import { TripView } from '@/components/trip/TripView'
import { VideoExportModal } from '@/components/video/VideoExportModal'
import AdminPanel from '@/components/admin/AdminPanel'
import LoginPage from '@/components/auth/LoginPage'
import RegisterPage from '@/components/auth/RegisterPage'
import { useAuth } from '@/context/AuthContext'
import { CitiesProvider } from '@/context/CitiesContext'
import { Loader2, ListChecks, Video } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ToastContainer } from '@/components/ui/Toast'
import { ConfirmContainer } from '@/components/ui/Confirm'

interface PendingCity {
  cityCode: string
  cityName: string
  provinceCode: string
  provinceName: string
}

function MainApp() {
  const { cities, refresh } = useCities()
  const dbLoading = cities === undefined
  const loadedCities = cities ?? []

  const [view, setView] = useState<AppView>('map')
  const [mapLevel, setMapLevel] = useState<'nation' | 'province'>('nation')
  const [selectedCityCode, setSelectedCityCode] = useState<string | null>(null)
  const [pendingCity, setPendingCity] = useState<PendingCity | null>(null)
  const [showBatchMark, setShowBatchMark] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showPoster, setShowPoster] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [apiKey, setApiKey] = useState('')

  const selectedCity = useCity(selectedCityCode)
  const stats = calcStats(loadedCities)

  useEffect(() => {
    setApiKey(localStorage.getItem('aiApiKey') ?? '')
  }, [showSettings])

  const handleCityClick = (cityCode: string, cityName: string, provinceCode: string, provinceName: string) => {
    const already = loadedCities.find(c => c.cityCode === cityCode)
    if (already) setSelectedCityCode(cityCode)
    else setPendingCity({ cityCode, cityName, provinceCode, provinceName })
  }

  const existingCodes = new Set(loadedCities.map(c => c.cityCode))
  const isMapView = view === 'map'

  if (showAdmin) {
    return (
      <div className="h-screen bg-[#faf9f6]">
        <AdminPanel onBack={() => setShowAdmin(false)} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#faf9f6]">
      <TopBar
        stats={stats}
        onExport={() => setShowPoster(true)}
        onSettings={() => setShowSettings(true)}
        onAdmin={() => setShowAdmin(true)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {dbLoading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#faf9f6]">
            <Loader2 size={28} className="animate-spin text-[#f0a500]" />
          </div>
        )}

        <NavSidebar current={view} onChange={v => { setView(v); if (v !== 'map') setSelectedCityCode(null) }} />

        {isMapView ? (
          <>
            <div className="flex-1 relative overflow-hidden">
              <button
                onClick={() => setShowBatchMark(true)}
                className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 border border-[#e5e2d8] rounded-lg text-xs text-[#666660] hover:bg-[#f2f0eb] transition-colors shadow-sm"
              >
                <ListChecks size={13} />
                批量标记
              </button>

              {loadedCities.length === 0 && !dbLoading && mapLevel === 'nation' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none text-center">
                  <div className="bg-white/90 backdrop-blur-sm border border-[#e5e2d8] rounded-2xl px-6 py-4 shadow-lg">
                    <p className="text-sm font-medium text-[#1a1a1a] mb-1">点击任意省份开始</p>
                    <p className="text-xs text-[#aaa898]">下钻到城市，填上你走过的留白</p>
                  </div>
                  <div className="w-0.5 h-8 bg-[#f0a500]/40 mx-auto mt-2 rounded-full" />
                  <div className="w-2 h-2 bg-[#f0a500] rounded-full mx-auto animate-bounce" />
                </div>
              )}
              <ChinaMap
                cities={loadedCities}
                onCityClick={handleCityClick}
                selectedCityCode={selectedCityCode}
                onViewChange={setMapLevel}
              />
            </div>

            <div className="w-80 bg-white border-l border-[#e5e2d8] overflow-hidden flex flex-col">
              {selectedCity ? (
                <CityPanel city={selectedCity} onClose={() => setSelectedCityCode(null)} apiKey={apiKey} />
              ) : (
                <div className="overflow-y-auto flex-1">
                  <div className="p-4 border-b border-[#e5e2d8] flex items-center justify-between">
                    <h3 className="text-xs font-medium text-[#aaa898] uppercase tracking-wider">我的留白</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowVideo(true)}>
                      <Video size={13} />
                      <span className="text-xs">生成视频</span>
                    </Button>
                  </div>
                  <StatsPanel stats={stats} />
                </div>
              )}
            </div>
          </>
        ) : (
          <div key={view} className="flex-1 flex overflow-hidden animate-in fade-in duration-200">
            {view === 'timeline' && (
              <TimelineView cities={loadedCities} onCityClick={code => { setView('map'); setSelectedCityCode(code) }} />
            )}
            {view === 'gallery' && <GalleryView cities={loadedCities} />}
            {view === 'stats'   && <StatsView cities={loadedCities} />}
            {view === 'trips'   && <TripView cities={loadedCities} />}
          </div>
        )}
      </div>

      {pendingCity && (
        <MarkCityModal
          open
          onClose={() => setPendingCity(null)}
          cityCode={pendingCity.cityCode}
          cityName={pendingCity.cityName}
          provinceCode={pendingCity.provinceCode}
          provinceName={pendingCity.provinceName}
          onMarked={code => { setPendingCity(null); setSelectedCityCode(code); refresh() }}
        />
      )}

      <BatchMarkModal open={showBatchMark} onClose={() => setShowBatchMark(false)} existingCodes={existingCodes} />
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} cities={loadedCities} />
      <PosterModal open={showPoster} onClose={() => setShowPoster(false)} cities={loadedCities} stats={stats} />
      <VideoExportModal open={showVideo} onClose={() => setShowVideo(false)} cities={loadedCities} stats={stats} />

      <ToastContainer />
      <ConfirmContainer />
    </div>
  )
}

type AuthView = 'login' | 'register'

export default function App() {
  const { isAuthenticated } = useAuth()
  const [authView, setAuthView] = useState<AuthView>('login')

  if (!isAuthenticated) {
    if (authView === 'login') {
      return <LoginPage onRegister={() => setAuthView('register')} />
    }
    return <RegisterPage onBack={() => setAuthView('login')} />
  }

  return (
    <CitiesProvider>
      <MainApp />
    </CitiesProvider>
  )
}
