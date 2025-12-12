import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  CalculatorState, 
  LifestyleType, 
  InvestmentProfile, 
  CalculationResult 
} from './types';
import { calculateRetirementMetrics, formatINR, formatCompactINR } from './utils/formatters';
import { GlassCard, NumberInput, SliderInput, SelectInput } from './components/InputComponents';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { TrendingUp, ShieldCheck, AlertCircle, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// -- Initial State --
const INITIAL_STATE: CalculatorState = {
  currentAge: 45,
  retirementAge: 55,
  lifeExpectancy: 85,
  currentMonthlyExpenses: 100000,
  lifestyleFactor: LifestyleType.MAINTAIN,
  existingSavings: 5000000, // 50 Lakhs default
  assumedInflation: 6,
  postRetirementROI: InvestmentProfile.BALANCED,
  specificGoals: '',
};

const App: React.FC = () => {
  const [state, setState] = useState<CalculatorState>(INITIAL_STATE);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  // Memoize calculation to avoid unnecessary re-runs
  const result: CalculationResult = useMemo(() => calculateRetirementMetrics(state), [state]);

  const handleUpdate = (field: keyof CalculatorState, value: any) => {
    setState(prev => ({ ...prev, [field]: value }));
    setAiAdvice(null); // Reset advice on input change
  };

  const fetchAiAdvice = async () => {
    if (!process.env.API_KEY) {
        alert("API Key not found in environment.");
        return;
    }

    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        Act as a wealth manager for a high-net-worth Indian individual.
        Context:
        - Current Age: ${state.currentAge}
        - Retirement Age: ${state.retirementAge}
        - Required Corpus: ${formatINR(result.requiredCorpus)}
        - Existing Projected Savings: ${formatINR(result.projectedExistingSavings)}
        - Gap: ${formatINR(result.gap)}
        - Monthly Expense (Today): ${formatINR(state.currentMonthlyExpenses)}
        - Inflation: ${state.assumedInflation}%
        - Specific Goals: ${state.specificGoals || "None specified"}
        
        Task: Provide a 3-sentence executive summary strategy. 
        1. Comment on feasibility (Is the gap bridging possible?).
        2. Suggest one high-impact financial move (e.g. increase equity exposure, delay retirement by 2 years, etc).
        3. End with a motivating sophisticated closing.
        Keep it professional, luxurious, and concise. No markdown formatting, just plain text.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setAiAdvice(response.text);
    } catch (error) {
      console.error("AI Error", error);
      setAiAdvice("Consult a financial advisor for a personalized strategy.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-premium-900 to-black text-slate-100 font-sans selection:bg-premium-gold/30">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-premium-goldLight to-premium-goldDark flex items-center justify-center">
              <TrendingUp className="text-slate-900 w-5 h-5" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-white">
              Lux<span className="text-premium-gold">Retire</span>
            </span>
          </div>
          <div className="hidden md:block text-sm text-slate-400">
            Private Wealth Planning
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT PANEL: INPUTS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="prose prose-invert mb-4">
              <h1 className="font-serif text-3xl md:text-4xl text-white mb-2 leading-tight">
                Design your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-premium-goldLight to-premium-goldDark">
                  Legacy Lifestyle
                </span>
              </h1>
              <p className="text-slate-400">
                Precision planning for your golden years. Input your financial vitals below.
              </p>
            </div>

            <GlassCard>
              <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-premium-gold rounded-full"></span>
                Personal Details
              </h3>
              <NumberInput 
                label="Current Age" 
                value={state.currentAge} 
                onChange={(v) => handleUpdate('currentAge', v)}
                min={25} max={80} 
              />
              <SliderInput 
                label="Retirement Age" 
                value={state.retirementAge} 
                onChange={(v) => handleUpdate('retirementAge', v)}
                min={40} max={75}
              />
              <SliderInput 
                label="Life Expectancy" 
                value={state.lifeExpectancy} 
                onChange={(v) => handleUpdate('lifeExpectancy', v)}
                min={70} max={100}
              />
            </GlassCard>

            <GlassCard>
              <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-premium-gold rounded-full"></span>
                Financial Baseline
              </h3>
              <NumberInput 
                label="Monthly Expenses (Current)" 
                value={state.currentMonthlyExpenses} 
                onChange={(v) => handleUpdate('currentMonthlyExpenses', v)}
                prefix="₹"
              />
              <SelectInput 
                label="Retirement Lifestyle"
                value={state.lifestyleFactor}
                options={[
                  { label: "Maintain Current (1x)", value: LifestyleType.MAINTAIN },
                  { label: "Upgrade Comfort (1.5x)", value: LifestyleType.UPGRADE },
                  { label: "Luxury & Travel (2x)", value: LifestyleType.LUXURY },
                ]}
                onChange={(v) => handleUpdate('lifestyleFactor', v)}
              />
              <NumberInput 
                label="Current Savings (Corpus)" 
                value={state.existingSavings} 
                onChange={(v) => handleUpdate('existingSavings', v)}
                prefix="₹"
              />
            </GlassCard>

            <GlassCard>
               <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-premium-gold rounded-full"></span>
                Market Assumptions
              </h3>
              <SliderInput 
                label="Inflation Rate" 
                value={state.assumedInflation} 
                onChange={(v) => handleUpdate('assumedInflation', v)}
                min={4} max={10} step={0.5} prefix=""
              />
              <SelectInput 
                label="Post-Retirement ROI"
                value={state.postRetirementROI}
                options={[
                  { label: "Conservative FD (6%)", value: InvestmentProfile.CONSERVATIVE },
                  { label: "Balanced Debt/Equity (8%)", value: InvestmentProfile.BALANCED },
                  { label: "Aggressive Growth (10%)", value: InvestmentProfile.AGGRESSIVE },
                ]}
                onChange={(v) => handleUpdate('postRetirementROI', v)}
              />
              
              <div className="mt-4">
                <label className="block text-slate-300 text-sm font-medium mb-2">Specific Goals</label>
                <textarea 
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-premium-gold/50 focus:border-premium-gold transition-all text-sm"
                  rows={2}
                  placeholder="e.g. World Tour, Grandchild's Wedding..."
                  value={state.specificGoals}
                  onChange={(e) => handleUpdate('specificGoals', e.target.value)}
                ></textarea>
              </div>
            </GlassCard>
          </div>

          {/* RIGHT PANEL: RESULTS */}
          <div className="lg:col-span-8 flex flex-col gap-6 sticky top-24">
            
            {/* Main Result Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-premium-gold/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <ShieldCheck size={80} />
                </div>
                <h4 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Required Corpus</h4>
                <div className="text-4xl lg:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
                  {formatCompactINR(result.requiredCorpus)}
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                  <span>To sustain</span>
                  <span className="text-premium-gold font-bold">{formatINR(result.monthlyExpenseAtRetirement)}/mo</span>
                  <span>@ age {state.retirementAge}</span>
                </div>
              </GlassCard>

              <GlassCard className={`border-l-4 ${result.gap > 0 ? 'border-l-red-500' : 'border-l-green-500'}`}>
                 <h4 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">
                   {result.gap > 0 ? "Shortfall Gap" : "Surplus Wealth"}
                 </h4>
                 <div className={`text-3xl lg:text-4xl font-serif font-bold ${result.gap > 0 ? 'text-red-400' : 'text-green-400'}`}>
                   {formatCompactINR(Math.abs(result.gap))}
                 </div>
                 <div className="mt-4 text-sm text-slate-400">
                   {result.gap > 0 ? (
                     <span className="flex items-center gap-2">
                       <AlertCircle size={16} className="text-red-400"/>
                       You need to accumulate this amount by {state.retirementAge}.
                     </span>
                   ) : (
                     <span className="flex items-center gap-2">
                       <ShieldCheck size={16} className="text-green-400"/>
                       You are on track for a luxury retirement.
                     </span>
                   )}
                 </div>
              </GlassCard>
            </div>

            {/* Chart */}
            <GlassCard className="h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-semibold text-white">Wealth Trajectory</h3>
                 <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-premium-gold"></span> Corpus
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-red-400"></span> Expenses
                    </div>
                 </div>
              </div>
              <div className="flex-grow w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis 
                      dataKey="age" 
                      stroke="#94a3b8" 
                      tick={{fontSize: 12}} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      tick={{fontSize: 12}} 
                      tickFormatter={(val) => `₹${val/100000}L`}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#f1f5f9' }}
                      itemStyle={{ color: '#e2e8f0' }}
                      formatter={(value: number) => formatCompactINR(value)}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#fbbf24" 
                      fillOpacity={1} 
                      fill="url(#colorBalance)" 
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#f87171" 
                      fillOpacity={1} 
                      fill="url(#colorExpense)" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <ReferenceLine x={state.retirementAge} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'insideTopRight',  value: 'Retirement', fill: '#94a3b8', fontSize: 12 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

             {/* AI Insight Section */}
             <GlassCard className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Sparkles className="text-purple-400 w-5 h-5" />
                      AI Wealth Strategist
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Get an instant, personalized executive summary of your plan.</p>
                  </div>
                  {!aiAdvice && !isAiLoading && (
                     <button 
                     onClick={fetchAiAdvice}
                     className="px-6 py-2 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-medium text-sm transition-all flex items-center gap-2"
                   >
                     Analyze with Gemini <ChevronRight size={14} />
                   </button>
                  )}
                </div>
                
                {isAiLoading && (
                  <div className="mt-4 flex items-center justify-center p-8 text-slate-400">
                    <Loader2 className="animate-spin w-6 h-6 mr-2" /> Analyzing financial projection...
                  </div>
                )}

                {aiAdvice && (
                   <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-purple-500/20 text-slate-200 text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-2">
                     {aiAdvice}
                   </div>
                )}
            </GlassCard>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;