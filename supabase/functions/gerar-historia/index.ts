import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const anonLimits = new Map<string, number[]>();
const ANON_MAX = 2;
const ANON_WINDOW = 24 * 60 * 60 * 1000;

function checkAnonLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = (anonLimits.get(ip) || []).filter(
    (t) => now - t < ANON_WINDOW
  );
  if (timestamps.length >= ANON_MAX) return false;
  timestamps.push(now);
  anonLimits.set(ip, timestamps);
  return true;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt, tts } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.length < 20) {
      return jsonResponse({ error: "Prompt invalido ou muito curto" }, 400);
    }

    const authHeader = req.headers.get("Authorization");
    let isAuthenticated = false;

    if (authHeader) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const {
        data: { user },
      } = await supabase.auth.getUser();
      isAuthenticated = !!user;
    }

    if (!isAuthenticated) {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "unknown";
      if (!checkAnonLimit(ip)) {
        return jsonResponse(
          { error: "limite", message: "Crie uma conta gratuita para continuar criando historias" },
          429
        );
      }
    }

    const GEMINI_KEY = Deno.env.get("GEMINI_KEY");
    if (!GEMINI_KEY) {
      return jsonResponse({ error: "Chave Gemini nao configurada" }, 500);
    }

    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1000, temperature: 0.8 },
        }),
      }
    );

    const data = await geminiResp.json();
    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!texto) return jsonResponse({ error: "Sem resposta da IA" }, 502);

    const result: Record<string, unknown> = { texto };

    if (tts && isAuthenticated) {
      try {
        const ttsResp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: texto }] }],
              generationConfig: {
                response_modalities: ["AUDIO"],
                speech_config: {
                  voice_config: {
                    prebuilt_voice_config: { voice_name: "Kore" },
                  },
                },
              },
            }),
          }
        );

        const ttsData = await ttsResp.json();
        const audioData =
          ttsData.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        if (audioData) {
          result.audio = audioData.data;
          result.audioMime = audioData.mimeType;
        }
      } catch (_) {
        // TTS falhou silenciosamente — texto ainda é retornado
      }
    }

    return jsonResponse(result);
  } catch (e) {
    return jsonResponse({ error: "Erro interno do servidor" }, 500);
  }
});
