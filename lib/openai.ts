import OpenAI from "openai";

let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY ?? "placeholder",
    });
  }
  return _openai;
}

const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return getOpenAI()[prop as keyof OpenAI];
  },
});

export default openai;
