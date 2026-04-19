import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVenue } from '../context/VenueContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Clock, ShoppingBag, CheckCircle, ChefHat, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STALLS = [
  { id:'stall-1', name:'Stadium Grill',    icon:'🍔', specialty:'Handcrafted Burgers & Wings',    baseWait:8,  zoneId:'food-zone1' },
  { id:'stall-2', name:'Pizza Palace',     icon:'🍕', specialty:'Wood-Fired Artisan Pizzas',     baseWait:12, zoneId:'food-zone2' },
  { id:'stall-3', name:'Asian Fusion',     icon:'🍜', specialty:'Fresh Noodles & Dim Sum',  baseWait:6,  zoneId:'food-zone3' },
  { id:'stall-4', name:'Snack Attack',     icon:'🍟', specialty:'Loaded Fries & Nachos',     baseWait:4,  zoneId:'food-zone1' },
  { id:'stall-5', name:'Craft Beverages',  icon:'🥤', specialty:'Organic Smoothies & Juices', baseWait:3,  zoneId:'food-zone2' },
  { id:'stall-6', name:'Dessert Hub',      icon:'🍦', specialty:'Gelato & Belgian Waffles',baseWait:5,  zoneId:'food-zone3' },
];

const MENU = {
  'stall-1': [{ name:'Signature Burger',    price:12.99 },{ name:'Wings Platter',      price:15.99 },{ name:'Loaded Fries',      price: 8.50 }],
  'stall-2': [{ name:'Margherita Pizza',   price:13.50 },{ name:'BBQ Chicken Pizza',   price:15.00 },{ name:'Garlic Breadsticks',price: 6.00 }],
  'stall-3': [{ name:'Ramen Bowl',         price:11.99 },{ name:'Dumplings (6pc)',      price: 9.50 },{ name:'Fried Rice',        price: 8.00 }],
  'stall-4': [{ name:'Loaded Nachos',      price: 9.50 },{ name:'Cheese Fries',         price: 7.00 },{ name:'Popcorn Chicken',   price: 8.50 }],
  'stall-5': [{ name:'Mango Smoothie',     price: 6.50 },{ name:'Lemon Iced Tea',       price: 4.00 },{ name:'Energy Booster',    price: 7.50 }],
  'stall-6': [{ name:'Gelato Cup',         price: 5.50 },{ name:'Belgian Waffle',       price: 7.00 },{ name:'Churros',           price: 6.00 }],
};

const STAGES = ['Queueing','Preparing','Ready'];

export default function FoodOrder() {
  const { densities } = useVenue();
  const { profile }   = useAuth();
  const navigate = useNavigate();
  const [selectedStall, setSelectedStall] = useState(null);
  const [cart,          setCart]          = useState([]);
  const [orders,        setOrders]        = useState([]);
  const [waitTimes,     setWaitTimes]     = useState({});
  const [tab,           setTab]           = useState('stalls');

  // Compute live wait times from density
  useEffect(() => {
    const wt = {};
    STALLS.forEach(s => {
      const density = densities[s.zoneId] ?? 50;
      wt[s.id] = Math.max(1, Math.round(s.baseWait + density * 0.1));
    });
    setWaitTimes(wt);
  }, [densities]);

  // Simulate order stage progression
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => prev.map(o => {
        if (o.stageIdx >= 2) return o;
        const elapsed = (Date.now() - o.placedAt) / 1000;
        const advance = elapsed > (o.waitMin * 60 * 0.3) ? 1 : 0;
        return { ...o, stageIdx: Math.min(2, o.stageIdx + advance) };
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const addToCart = (item) => {
    setCart(c => {
      const ex = c.find(x => x.name === item.name);
      if (ex) return c.map(x => x.name===item.name ? {...x, qty:x.qty+1} : x);
      return [...c, { ...item, qty:1 }];
    });
  };

  const placeOrder = () => {
    if (!cart.length) return;
    const tokenNum = Math.floor(Math.random() * 40) + 1;
    const wt = waitTimes[selectedStall.id] || 10;
    setOrders(o => [...o, {
      id:       Date.now(),
      stall:    selectedStall.name,
      icon:     selectedStall.icon,
      items:    [...cart],
      token:    tokenNum,
      waitMin:  wt,
      stageIdx: 0,
      placedAt: Date.now(),
      total:    cart.reduce((s,x) => s + x.price * x.qty, 0),
    }]);
    setCart([]);
    setSelectedStall(null);
    setTab('orders');
  };

  const totalCartPrice = cart.reduce((s,x) => s + x.price * x.qty, 0).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-10 py-4 border-b border-slate-200 sticky top-0 z-30 bg-white/80 backdrop-blur-xl">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition">
          <ArrowLeft size={20}/><span className="text-base font-semibold">Dashboard</span>
        </button>
        <div className="font-orbitron text-base font-bold text-slate-900 tracking-wide hidden sm:block">FOOD & BEVERAGE</div>
        <button onClick={() => setTab('orders')} className="relative p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition shadow-sm">
          <ShoppingBag size={20} className="text-indigo-600"/>
          {orders.length > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold border-2 border-white">{orders.length}</span>}
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-10 py-10 md:py-16">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">Venue Dining</h1>
          <p className="text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Order ahead and skip the lines. We process orders dynamically based on kitchen capacity and zone foot traffic.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {['stalls','orders'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-8 py-3 rounded-xl text-base font-semibold capitalize transition-all duration-300 ${tab === t ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}>
                {t==='orders' ? `My Orders ${orders.length?`(${orders.length})`:''}` : 'Available Stalls'}
              </button>
            ))}
          </div>
        </div>

        {/* Stalls tab */}
        {tab === 'stalls' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STALLS.map((stall,i) => {
              const wt = waitTimes[stall.id] || stall.baseWait;
              const density = densities[stall.zoneId] ?? 50;
              const busy = density > 65;
              return (
                <motion.div key={stall.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                  whileHover={{y:-4, scale:1.01}} onClick={() => setSelectedStall(stall)}
                  className={`bg-white rounded-2xl p-6 cursor-pointer flex flex-col justify-between transition-all duration-300 border shadow-sm hover:shadow-md ${busy ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200 hover:border-indigo-200'}`}>
                  
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-4xl shadow-sm">
                      {stall.icon}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Queue Density</div>
                      <div className={`text-2xl font-bold ${density>65 ? 'text-amber-600' : 'text-emerald-600'}`}>{Math.round(density)}%</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-1">{stall.name}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{stall.specialty}</p>
                    
                    <div className={`p-3 rounded-xl flex items-center justify-between border ${busy ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className={busy ? 'text-amber-600' : 'text-emerald-600'}/>
                        <span className={`text-sm font-semibold ${busy ? 'text-amber-700' : 'text-emerald-700'}`}>Wait: ~{wt} mins</span>
                      </div>
                      {busy && <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg uppercase tracking-wider">Busy</span>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Orders tab */}
        {tab === 'orders' && (
          <div className="max-w-3xl mx-auto">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                <ChefHat size={64} className="mx-auto mb-6 text-slate-300"/>
                <h3 className="text-2xl font-semibold text-slate-800 mb-2">No Active Orders</h3>
                <p className="text-base text-gray-500">Select a stall from the menu to place an order.</p>
                <button onClick={() => setTab('stalls')} className="mt-8 px-6 py-3 bg-indigo-50 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-100 transition shadow-sm border border-indigo-100">
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <motion.div key={order.id} layout className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-start justify-between mb-8 pb-6 border-b border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl">
                          {order.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{order.stall}</h3>
                          <p className="text-sm text-gray-500 font-medium">Order Ticket #{order.token}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Total</p>
                        <p className="text-2xl font-bold text-slate-900">${order.total.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Stage tracker */}
                    <div className="flex items-center justify-between mb-8 px-4 relative">
                      <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-100 -translate-y-1/2 z-0" />
                      {STAGES.map((stage,idx) => (
                        <div key={stage} className="relative z-10 flex flex-col items-center gap-3 bg-white px-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 shadow-sm border-2 ${idx<=order.stageIdx ? (idx===2 ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-indigo-500 border-indigo-500 text-white') : 'bg-white border-slate-200 text-slate-400'}`}>
                            {idx < order.stageIdx || (idx===2 && order.stageIdx===2) ? <CheckCircle size={18}/> : idx+1}
                          </div>
                          <span className={`text-sm font-semibold ${idx<=order.stageIdx ? 'text-slate-900' : 'text-gray-400'}`}>{stage}</span>
                        </div>
                      ))}
                    </div>

                    {order.stageIdx === 2 ? (
                      <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                        <CheckCircle size={24} />
                        <span className="text-base font-bold">Your order is ready for pickup at the counter!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700">
                        <Flame size={20} className="shrink-0"/>
                        <span className="text-sm font-semibold leading-relaxed">
                          Estimated Wait: ~{order.waitMin} mins &nbsp;•&nbsp; Items: {order.items.map(i=>`${i.qty}x ${i.name}`).join(', ')}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Menu modal */}
      <AnimatePresence>
        {selectedStall && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            onClick={() => { setSelectedStall(null); setCart([]); }}>
            <motion.div initial={{y:40, scale:0.95}} animate={{y:0, scale:1}} exit={{y:40, scale:0.95}}
              className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]" 
              onClick={e=>e.stopPropagation()}>
              
              {/* Header block */}
              <div className="flex items-center gap-5 mb-8 border-b border-slate-100 pb-6 shrink-0">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl border border-slate-200">{selectedStall.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">{selectedStall.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                     <Clock size={14}/> Approximately {waitTimes[selectedStall.id]} minute wait
                  </div>
                </div>
              </div>

              {/* Menu list */}
              <div className="space-y-4 mb-8 overflow-y-auto pr-2 custom-scrollbar">
                {(MENU[selectedStall.id]||[]).map(item => {
                  const inCart = cart.find(c => c.name===item.name);
                  return (
                    <div key={item.name} className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${inCart?'bg-indigo-50/50 border-indigo-200 shadow-sm':'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'}`}>
                      <div>
                        <div className="text-base font-semibold text-slate-900 mb-1">{item.name}</div>
                        <div className="text-sm font-bold text-gray-500">${item.price.toFixed(2)}</div>
                      </div>
                      <button onClick={() => addToCart(item)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm border ${inCart ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                        {inCart ? `Added (${inCart.qty})` : 'Add to Order'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Action button */}
              <div className="mt-auto shrink-0 pt-2">
                <button
                  onClick={() => { setSelectedStall(null); setCart([]); }}
                  className="w-full mb-3 py-3.5 rounded-xl font-semibold text-slate-500 hover:bg-slate-50 border border-transparent transition">
                  Cancel Checkout
                </button>
                <motion.button 
                  disabled={cart.length === 0}
                  whileHover={cart.length > 0 ? {scale:1.02} : {}} 
                  whileTap={cart.length > 0 ? {scale:0.98} : {}} 
                  onClick={placeOrder}
                  className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-between px-6 shadow-sm ${cart.length > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                  <span className="flex items-center gap-2"><ShoppingBag size={18}/> Place Order ({cart.reduce((s,x)=>s+x.qty,0)})</span>
                  <span className="bg-black/20 text-white px-3 py-1 rounded-lg">${totalCartPrice}</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
