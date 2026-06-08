import { NavLink, Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import PromotionsPage from './pages/PromotionsPage'
import ShoppingListPage from './pages/ShoppingListPage'
import HistoryPage from './pages/HistoryPage'
import BudgetSetupPage from './pages/BudgetSetupPage'
import AuthPage from './pages/AuthPage'
import { useSyncedState } from './lib/sync'
import type { ShoppingListItem } from './lib/types'
import { IconHome, IconTag, IconList, IconClock, IconWallet } from './lib/icons'
import { useAuth } from './lib/auth'

const TABS = [
  { to: '/', label: 'Начало', end: true, icon: IconHome },
  { to: '/promotions', label: 'Промоции', end: false, icon: IconTag },
  { to: '/list', label: 'Списък', end: false, icon: IconList },
  { to: '/history', label: 'История', end: false, icon: IconClock },
  { to: '/budget', label: 'Бюджет', end: false, icon: IconWallet },
]

function App() {
  const { session, loading, signOut } = useAuth()
  const [shoppingList] = useSyncedState<ShoppingListItem[]>('shoppingList', [])
  const listCount = shoppingList.filter((item) => !item.purchased).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <p className="text-sm text-app-text-sec">Зареждане…</p>
      </div>
    )
  }

  if (!session) {
    return <AuthPage />
  }

  return (
    <div className="min-h-screen flex flex-col bg-app-bg">
      <main className="flex-1 max-w-xl w-full mx-auto px-5 pt-4 pb-6">
        <div className="flex items-center justify-end pt-2 pb-1">
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-[12px] font-medium text-app-text-sec"
          >
            {session.user.email} · Изход
          </button>
        </div>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/list" element={<ShoppingListPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/budget" element={<BudgetSetupPage />} />
        </Routes>
      </main>

      <nav className="sticky bottom-0 bg-app-card border-t border-app-border">
        <div className="max-w-xl mx-auto flex items-stretch justify-around px-1 pt-2 pb-1.5">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className="flex flex-col items-center gap-0.5 px-2 py-1 relative transition-transform"
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      <Icon size={22} color={isActive ? 'var(--color-accent)' : 'var(--color-app-text-sec)'} />
                      {tab.to === '/list' && listCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 text-[9px] font-bold bg-accent text-white px-1.5 rounded-full min-w-[16px] text-center leading-[14px]">
                          {listCount}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] ${isActive ? 'font-bold text-accent' : 'font-medium text-app-text-sec'}`}>
                      {tab.label}
                    </span>
                    {isActive && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded bg-accent" />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default App
