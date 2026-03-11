export interface MomentumItem {
  symbol: string;
  name: string;
  market: string;
  price: number;
  change_pct: number;
  perf_5d: number;
  perf_20d: number;
  trigger: string;
  rel_volume: number;
  rsi: number;
  cmf: number;
  market_cap_b: number;
  market_cap_unit?: string;
  sector: string;
  industry: string;
}

export interface MomentumData {
  us_momentum: MomentumItem[];
  cn_momentum: MomentumItem[];
}

export interface PortfolioItem {
  symbol: string;
  name: string;
  type: string;
  current_price: number;
  daily_change_pct: number;
  avg_cost?: number;
  target_buy?: number;
  target_sell?: number;
  distance_to_target_pct?: number;
  distance_to_ema200_pct?: number;
  rsi?: number;
  cmf?: number;
  status: string;
  signal_strength: string;
  notes?: string;
  logic?: string;
  position_plan?: string;
  ema_20?: number;
  ema_50?: number;
  ema_100?: number;
  ema_200?: number;
}

export interface PortfolioAdvice {
  items: PortfolioItem[];
  advice_text: string;
}

export interface DailyData {
  date: string;
  generated_at: string;
  summary: Summary;
  strength: StrengthItem[];
  anomalies: Anomaly[];
  cycle_signals: CycleSignal[];
  stock_picks: Record<string, StockPick[]>;
  analysis_text: string;
  momentum_surge?: MomentumData;
  portfolio_advice?: PortfolioAdvice;
}

export interface Summary {
  total_symbols: number;
  anomaly_count: number;
  tier_distribution: Record<string, number>;
  us_temperature?: string;
  cn_temperature?: string;
  vix_close?: number;
  vix_roc_5d?: number;
  [key: string]: any;
}

export interface StrengthItem {
  symbol: string;
  name: string;
  market: string;
  close: number;
  roc_5d: number;
  roc_20d: number;
  composite_score: number;
  rank: number;
  tier: string;
  sharpe?: number;
  max_drawdown?: number;
  volatility?: number;
  fear_score?: number;
  fear_label?: string;
  bottom_score?: number;
  bottom_label?: string;
  cycle_phase?: string;
  premarket_change?: number;
  tv_rsi?: number;
  tv_macd_signal?: string;
  delta_roc_5d?: number;
  [key: string]: any;
}

export interface Anomaly {
  type: string;
  severity: "high" | "medium" | "low";
  symbols: string[];
  description: string;
  data: Record<string, any>;
}

export interface CycleSignal {
  type: string;
  symbol: string;
  description: string;
  data: Record<string, any>;
}

export interface StockPick {
  symbol: string;
  name: string;
  change?: number;
  [key: string]: any;
}
