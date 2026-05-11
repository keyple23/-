
import { GoogleGenAI } from "@google/genai";

// Always use the process.env.API_KEY directly as a named parameter
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const checkNaverRank = async (keyword: string, targetUrl: string): Promise<number | '미노출'> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `네이버 검색 순위 체크 요청입니다.
      키워드: "${keyword}"
      대상 URL: "${targetUrl}"
      
      업무: 해당 키워드로 네이버 검색 결과(SERP)를 확인하여 대상 URL의 유기적 순위를 1위부터 20위까지만 확인하세요.
      1. 대상 URL이 1위~20위 사이에 있다면 해당 순위 숫자만 반환하세요 (예: 5).
      2. 20위 안에 없다면 반드시 '미노출' 이라고 반환하세요.
      3. 광고(AD/PowerLink) 결과는 제외하고 유기적 순위만 계산하세요.`,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    // response.text is a property, not a method
    const result = response.text?.trim() || '';
    if (result.includes('미노출')) return '미노출';
    
    const rank = parseInt(result.replace(/[^0-9]/g, ''), 10);
    if (isNaN(rank) || rank > 20) return '미노출';
    return rank;
  } catch (error) {
    console.error("Error checking rank:", error);
    throw error;
  }
};