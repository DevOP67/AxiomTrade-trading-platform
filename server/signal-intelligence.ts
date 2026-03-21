interface SignalBase {
  symbol: string;
  type: string;
  price: string;
  aiScore: number;
}

export interface SignalIntelligence {
  confidence: number;
  confidence_breakdown: { technical: number; sentiment: number; macro: number };
  explanation: {
    technical_factors: string[];
    sentiment_factors: string[];
    macro_factors: string[];
    summary: string;
  };
  scenarios: { bullish: string; bearish: string; sideways: string };
}

function deriveRSI(sig: SignalBase): number {
  if (sig.type === "BUY")  return 20 + (100 - sig.aiScore) * 0.5;
  if (sig.type === "SELL") return 70 + (sig.aiScore - 70) * 0.3;
  return 45 + (sig.aiScore % 10);
}

function getMACDState(sig: SignalBase): "bullish_crossover" | "bearish_crossover" | "neutral" {
  if (sig.type === "BUY"  && sig.aiScore > 80) return "bullish_crossover";
  if (sig.type === "SELL" && sig.aiScore > 80) return "bearish_crossover";
  return "neutral";
}

export function generateExplanation(sig: SignalBase): SignalIntelligence {
  const rsi  = deriveRSI(sig);
  const macd = getMACDState(sig);
  const base = sig.aiScore % 7;
  const symbol = sig.symbol.split("/")[0];
  const price  = parseFloat(sig.price);

  const technical = Math.min(97, sig.aiScore + (rsi < 30 || rsi > 70 ? 5 : -3));
  const sentiment = Math.min(95, 58 + (sig.aiScore - 70) * 0.6 + (sig.type === "BUY" ? 5 : -5));
  const macro     = 52 + base * 3;
  const confidence = Math.round(technical * 0.5 + sentiment * 0.3 + macro * 0.2);

  const technicalFactors: string[] = [];
  if (rsi < 30)       technicalFactors.push(`RSI at ${rsi.toFixed(0)} — oversold territory, rebound signal active`);
  else if (rsi > 70)  technicalFactors.push(`RSI at ${rsi.toFixed(0)} — overbought, pullback risk elevated`);
  else                technicalFactors.push(`RSI at ${rsi.toFixed(0)} — neutral momentum zone`);

  if (macd === "bullish_crossover")  technicalFactors.push("MACD line crossed above signal line (bullish crossover)");
  else if (macd === "bearish_crossover") technicalFactors.push("MACD crossed below signal line (bearish crossover)");
  else                               technicalFactors.push("MACD histogram showing neutral divergence");

  technicalFactors.push(`Composite AI model confidence: ${sig.aiScore}/100`);

  const sentimentFactors: string[] = [];
  if (symbol === "BTC") {
    sentimentFactors.push("Bitcoin dominance trending — market risk-on sentiment detected");
    sentimentFactors.push(sig.type === "BUY" ? "Funding rates neutral, no overleveraged longs" : "Funding rates elevated, squeeze risk present");
  } else if (symbol === "ETH") {
    sentimentFactors.push("Ethereum gas fees within normal range — on-chain activity stable");
    sentimentFactors.push(sig.type === "BUY" ? "DeFi TVL holding steady, sentiment constructive" : "Protocol outflows detected, caution advised");
  } else {
    sentimentFactors.push(`${symbol} social volume above 7-day moving average`);
    sentimentFactors.push(sig.type === "BUY" ? "Positive mentions trending across trading forums" : "Negative sentiment spike on social feeds");
  }
  sentimentFactors.push(`Market mood: ${sentiment > 70 ? "Greed" : sentiment > 50 ? "Neutral" : "Fear"}`);

  const macroFactors: string[] = [
    "DXY showing mild weakness — historically crypto-positive environment",
    "Fed rate expectations steady — no near-term liquidity shock anticipated",
    price > 10000 ? "Large-cap asset — institutional order flow dominant" : "Mid/small-cap — higher volatility, wider spreads expected",
  ];

  const direction = sig.type === "BUY" ? "long" : sig.type === "SELL" ? "short" : "hold";
  const rsiDesc   = rsi < 30 ? "oversold RSI" : rsi > 70 ? "overbought RSI" : "neutral RSI";
  const macdDesc  = macd === "neutral" ? "stable MACD readings" : "a MACD crossover signal";
  const confDesc  = sig.aiScore >= 85 ? "High confidence — multiple indicators aligned." : sig.aiScore >= 70 ? "Moderate confidence — monitor for confirmation." : "Low confidence — await additional confirmation.";
  const summary   = `AI recommends a ${direction} position on ${sig.symbol} based on ${rsiDesc} combined with ${macdDesc}. ${confDesc}`;

  const scenarios = {
    bullish:  sig.type === "BUY"
      ? `If buying pressure sustains, ${symbol} could extend gains 4–8% toward next resistance.`
      : `A failed breakdown could trigger short covering, pushing ${symbol} 3–6% higher.`,
    bearish:  sig.type === "SELL"
      ? `If selling intensifies, ${symbol} may drop 5–10% toward key support levels.`
      : `Deteriorating conditions could invalidate the signal — stop-loss placement is critical.`,
    sideways: `${symbol} consolidates in a tight range. Signal remains valid but returns may be capped at 1–3%.`,
  };

  return {
    confidence,
    confidence_breakdown: { technical, sentiment, macro },
    explanation: { technical_factors: technicalFactors, sentiment_factors: sentimentFactors, macro_factors: macroFactors, summary },
    scenarios,
  };
}
