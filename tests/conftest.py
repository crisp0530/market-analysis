import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta


@pytest.fixture
def sample_raw_df():
    """Generate realistic market data for testing."""
    dates = pd.date_range(end=datetime.now(), periods=60, freq='B')
    symbols = ['SPY', 'QQQ', 'GLD', 'TLT', '^VIX']
    rows = []
    for symbol in symbols:
        base_price = {'SPY': 500, 'QQQ': 450, 'GLD': 200, 'TLT': 90, '^VIX': 18}[symbol]
        np.random.seed(hash(symbol) % 2**31)
        prices = base_price * (1 + np.random.randn(len(dates)).cumsum() * 0.01)
        for i, date in enumerate(dates):
            p = prices[i]
            rows.append({
                'symbol': symbol,
                'name': symbol,
                'date': date.strftime('%Y-%m-%d'),
                'open': round(p * 0.999, 2),
                'high': round(p * 1.005, 2),
                'low': round(p * 0.995, 2),
                'close': round(p, 2),
                'volume': int(np.random.uniform(1e6, 1e8)),
                'market': 'us' if symbol != '^VIX' else 'global',
                'sector': 'equity' if symbol in ('SPY', 'QQQ') else (
                    'commodity' if symbol == 'GLD' else (
                        'bond' if symbol == 'TLT' else 'volatility'
                    )
                ),
            })
    return pd.DataFrame(rows)


@pytest.fixture
def sample_config():
    return {
        'strength': {
            'roc_period': 20,
            'lookback_days': 60,
            'tiers': {'T1': 80, 'T2': 60, 'T3': 40},
            'weights': {'roc_5d': 0.5, 'roc_20d': 0.3, 'roc_60d': 0.2},
        },
        'anomaly': {
            'zscore_threshold': 2.0,
            'tier_jump_days': 20,
            'cluster_threshold': 0.4,
            'momentum_reversal_threshold': 3.0,
        }
    }
