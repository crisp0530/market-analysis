export interface DailyData {
  date: string;
  generated_at: string;
  summary: Summary;
  strength: StrengthItem[];
  anomalies: Anomaly[];
  cycle_signals: CycleSignal[];
  stock_picks: Record<string, StockPick[]>;
  analysis_text: string;
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
