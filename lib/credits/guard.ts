import { getCreditBalance, getUserProfile, deductCredits } from "./balance";
import { CreditError } from "./types";

type AIFn = () => Promise<{
  tokensUsed: number;
  durationSec?: number;
  model: string;
  result: unknown;
}>;

export async function withCredits(userId: string, fn: AIFn): Promise<unknown> {
  const profile = await getUserProfile(userId);

  // System admin: unlimited, no deduction
  if (profile.is_admin) {
    const { result } = await fn();
    return result;
  }

  const balance = await getCreditBalance(userId);
  if (balance < 1) {
    throw new CreditError("INSUFFICIENT_CREDITS");
  }

  const { tokensUsed, durationSec, model, result } = await fn();

  const credits =
    model === "whisper"
      ? Math.ceil((durationSec ?? 0) / 60) * 100
      : tokensUsed; // 1 token = 1 credit for all text/vision models

  if (credits > 0) {
    await deductCredits(userId, credits, model, tokensUsed);
  }

  return result;
}
