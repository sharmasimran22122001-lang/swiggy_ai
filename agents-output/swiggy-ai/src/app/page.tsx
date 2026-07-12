'use client'
import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LoginScreen from '@/components/LoginScreen'
import SwiggyTopNav from '@/components/SwiggyTopNav'
import SwiggyBottomNav from '@/components/SwiggyBottomNav'
import HomeFeed from '@/components/HomeFeed'
import SwiggyShimmer from '@/components/SwiggyShimmer'
import RestaurantPage from '@/components/RestaurantPage'
import CartPage from '@/components/CartPage'
import OrderSuccess from '@/components/OrderSuccess'
import CategoryPage from '@/components/CategoryPage'
import DishPage from '@/components/DishPage'
import TrendingAllPage from '@/components/TrendingAllPage'
import SearchPage from '@/components/SearchPage'
import SlotAllPage from '@/components/SlotAllPage'
import { CartProvider, useCart } from '@/contexts/CartContext'
import { useLocation } from '@/hooks/useLocation'
import type { HomepageJSON, UserProfile, TimeSlot, TrendMatch } from '@/types'
import type { RestaurantInfo } from '@/components/RestaurantPage'

interface Session { userId: string; userName: string }

interface PipelineResult {
  homepage: HomepageJSON
  profile: UserProfile
  slot: TimeSlot
  fromCache: boolean
}

type View = 'home' | 'restaurant' | 'cart' | 'success' | 'category' | 'dish' | 'trendingAll' | 'search' | 'slotAll'

interface CategoryState {
  name: string
  context?: string
  restaurants: RestaurantInfo[]
}

interface DishState {
  dish: string
  cuisine: string
  whyTrending: string
  searchSignal: string
  restaurants: TrendMatch[]
}

// ─── Inner app ────────────────────────────────────────────────────────────────

function AppInner() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PipelineResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('home')
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantInfo | null>(null)
  // Where the user opened the current restaurant from — back returns exactly there
  const [restaurantOrigin, setRestaurantOrigin] = useState<View>('home')
  // When was the last order placed? (drives the footer scooter's 30-min journey)
  const [orderedAt, setOrderedAt] = useState<number | null>(null)
  // 2C "View all" slot page + where a category list was opened from
  const [slotAllState, setSlotAllState] = useState<{ title: string; categories: string[] } | null>(null)
  const [categoryOrigin, setCategoryOrigin] = useState<View>('home')
  const [categoryState, setCategoryState] = useState<CategoryState | null>(null)
  const [dishState, setDishState] = useState<DishState | null>(null)
  const [trendingAllItems, setTrendingAllItems] = useState<TrendMatch[]>([])

  const { clear, restaurantName } = useCart()
  const location = useLocation()

  // Pool of all restaurants from the homepage result (deduplicated)
  const restaurantPool = useMemo<RestaurantInfo[]>(() => {
    if (!result) return []
    const allItems = [
      ...result.homepage.hero.items,
      ...result.homepage.slot_top_rated.items,
      ...result.homepage.discovery.items,
      ...result.homepage.mood_banner.items,
    ]
    const seen = new Set<string>()
    const pool: RestaurantInfo[] = []
    for (const item of allItems) {
      if (!seen.has(item.restaurant)) {
        seen.add(item.restaurant)
        pool.push({
          name: item.restaurant,
          area: result.profile.area ?? '',
          cuisines: result.profile.top_cuisines?.slice(0, 2) ?? [],
          rating: item.rating ?? 4.0,
          delivery_min: item.delivery_min ?? 30,
        })
      }
    }
    return pool
  }, [result])

  async function fetchHomepage(userId: string) {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`/api/personalize?user_id=${userId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleLogin(userId: string, userName: string) {
    setSession({ userId, userName })
    fetchHomepage(userId)
  }

  function handleLogout() {
    setSession(null)
    setResult(null)
    setError(null)
    setView('home')
    setSelectedRestaurant(null)
    setCategoryState(null)
    setDishState(null)
    setOrderedAt(null)
    clear()
  }

  function handleSeeAllTrending(items: TrendMatch[]) {
    setTrendingAllItems(items)
    setView('trendingAll')
  }

  function handleDishSelect(dish: string, cuisine: string, whyTrending: string, searchSignal: string, restaurants: TrendMatch[]) {
    setDishState({ dish, cuisine, whyTrending, searchSignal, restaurants })
    setView('dish')
  }

  function handleRestaurantSelect(info: RestaurantInfo) {
    setSelectedRestaurant(info)
    setRestaurantOrigin(view) // remember the entry point, so back returns there
    setView('restaurant')
  }

  // "View all" opens the section's own list — never a keyword-filtered dump
  function handleViewAllList(title: string, restaurants: RestaurantInfo[]) {
    setCategoryState({ name: title, restaurants })
    setCategoryOrigin(view)
    setView('category')
  }

  // 2C hero "View all" → the slot's full craving list (~20 food items)
  function handleSlotViewAll(title: string, categories: string[]) {
    setSlotAllState({ title, categories })
    setView('slotAll')
  }

  function handleCategorySelect(category: string) {
    // Filter pool by loose keyword match, fall back to full pool
    const filtered = restaurantPool.filter(r =>
      r.name.toLowerCase().includes(category.toLowerCase()) ||
      r.cuisines.some(c => c.toLowerCase().includes(category.toLowerCase()))
    )
    setCategoryState({
      name: category,
      restaurants: filtered.length >= 2 ? filtered : restaurantPool,
    })
    setCategoryOrigin(view)
    setView('category')
  }

  function handleBannerExplore(theme: string, context: string) {
    // Theme-based filter: use theme/context as the category label
    const keywords = theme.replace(/[🌧❄️☀️🎉🌙🌶🍦🫕💸]/g, '').trim().toLowerCase()
    const filtered = restaurantPool.filter(r =>
      r.name.toLowerCase().split(' ').some(w => keywords.includes(w)) ||
      r.cuisines.some(c => keywords.includes(c.toLowerCase()))
    )
    setCategoryState({
      name: theme,
      context,
      restaurants: filtered.length >= 2 ? filtered : restaurantPool,
    })
    setView('category')
  }

  function handlePlaceOrder() {
    setView('success')
    setOrderedAt(Date.now())
    clear()
  }

  function handleBackToHome() {
    setView('home')
    setSelectedRestaurant(null)
    setCategoryState(null)
    setDishState(null)
    setSlotAllState(null)
    setTrendingAllItems([])
  }

  const detectedCity = location.status === 'detected' ? location.city : null

  return (
    <div className="phone-shell">
      <AnimatePresence mode="wait">
        {!session ? (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25 }}>
            <LoginScreen onLogin={handleLogin} />
          </motion.div>
        ) : (
          <motion.div key="app" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="min-h-dvh bg-[#f8f8f8]">
            <AnimatePresence mode="wait">

              {/* ── Success ── */}
              {view === 'success' && (
                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <OrderSuccess
                    restaurantName={restaurantName ?? selectedRestaurant?.name ?? 'the restaurant'}
                    onBackToHome={handleBackToHome}
                  />
                </motion.div>
              )}

              {/* ── Cart ── */}
              {view === 'cart' && (
                <motion.div key="cart" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <CartPage
                    onBack={() => setView(selectedRestaurant ? 'restaurant' : 'home')}
                    onPlaceOrder={handlePlaceOrder}
                  />
                </motion.div>
              )}

              {/* ── Restaurant ── */}
              {view === 'restaurant' && selectedRestaurant && (
                <motion.div key="restaurant" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <RestaurantPage
                    restaurant={selectedRestaurant}
                    onBack={() => {
                      // Return to wherever the user came from — never a page they didn't visit
                      if (restaurantOrigin === 'category' && categoryState) setView('category')
                      else if (restaurantOrigin === 'search') setView('search')
                      else if (restaurantOrigin === 'dish' && dishState) setView('dish')
                      else setView('home')
                    }}
                    onGoToCart={() => setView('cart')}
                  />
                </motion.div>
              )}

              {/* ── Search ── */}
              {view === 'search' && (
                <motion.div key="search" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <SearchPage
                    city={result?.profile.city}
                    onBack={() => setView('home')}
                    onRestaurantSelect={handleRestaurantSelect}
                  />
                </motion.div>
              )}

              {/* ── Trending all ── */}
              {view === 'trendingAll' && (
                <motion.div key="trendingAll" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <TrendingAllPage
                    city={result?.profile.city ?? 'your city'}
                    items={trendingAllItems}
                    onBack={() => setView('home')}
                    onDishSelect={(dish, cuisine, whyTrending, searchSignal, restaurants) => {
                      handleDishSelect(dish, cuisine, whyTrending, searchSignal, restaurants)
                    }}
                  />
                </motion.div>
              )}

              {/* ── Dish listing ── */}
              {view === 'dish' && dishState && (
                <motion.div key="dish" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <DishPage
                    dish={dishState.dish}
                    cuisine={dishState.cuisine}
                    whyTrending={dishState.whyTrending}
                    searchSignal={dishState.searchSignal}
                    restaurants={dishState.restaurants}
                    onBack={() => setView('home')}
                    onRestaurantSelect={handleRestaurantSelect}
                  />
                </motion.div>
              )}

              {/* ── Slot craving list (2C View all) ── */}
              {view === 'slotAll' && slotAllState && (
                <motion.div key="slotAll" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <SlotAllPage
                    title={slotAllState.title}
                    categories={slotAllState.categories}
                    onBack={() => setView('home')}
                    onCategorySelect={handleCategorySelect}
                  />
                </motion.div>
              )}

              {/* ── Category results ── */}
              {view === 'category' && categoryState && (
                <motion.div key="category" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <CategoryPage
                    category={categoryState.name}
                    context={categoryState.context}
                    restaurants={categoryState.restaurants}
                    onBack={() => setView(categoryOrigin === 'slotAll' && slotAllState ? 'slotAll' : 'home')}
                    onRestaurantSelect={handleRestaurantSelect}
                  />
                </motion.div>
              )}

              {/* ── Home ── */}
              {view === 'home' && (
                <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SwiggyTopNav
                    userName={session.userName}
                    userArea={result?.profile.area}
                    userCity={result?.profile.city}
                    onLogout={handleLogout}
                    onCartClick={() => setView('cart')}
                    onSearchClick={() => setView('search')}
                  />

                  <div className="overflow-y-auto" style={{ paddingBottom: 64 }}>
                    {loading && <SwiggyShimmer />}

                    {error && !loading && (
                      <div className="px-4 py-8 text-center">
                        <div className="text-4xl mb-3">😕</div>
                        <p className="font-bold mb-1" style={{ color: '#3d4152' }}>Something went wrong</p>
                        <p className="text-sm mb-4" style={{ color: '#686b78' }}>{error}</p>
                        <button onClick={() => fetchHomepage(session.userId)} className="font-bold px-6 py-2.5 rounded-full text-sm text-white" style={{ background: '#FC8019' }}>
                          Try Again
                        </button>
                      </div>
                    )}

                    {result && !loading && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                        <HomeFeed
                          homepage={result.homepage}
                          profile={result.profile}
                          detectedCity={detectedCity}
                          onRestaurantSelect={handleRestaurantSelect}
                          onCategorySelect={handleCategorySelect}
                          onViewAllList={handleViewAllList}
                          onBannerExplore={handleBannerExplore}
                          onCartClick={() => setView('cart')}
                          onDishSelect={handleDishSelect}
                          onSeeAllTrending={handleSeeAllTrending}
                          onSlotViewAll={handleSlotViewAll}
                          orderedAt={orderedAt}
                        />
                      </motion.div>
                    )}
                  </div>

                  <SwiggyBottomNav />
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Root export ──────────────────────────────────────────────────────────────

export default function App() {
  return (
    <CartProvider>
      <AppInner />
    </CartProvider>
  )
}
