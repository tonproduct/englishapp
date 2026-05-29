"use client";

import { useState } from "react";
import { categories } from "./data";

export default function Home() {
  const [active, setActive] = useState(categories[0].id);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [quizMode, setQuizMode] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizRevealed, setQuizRevealed] = useState(false);
  const [quizOrder, setQuizOrder] = useState<number[]>([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [quizResult, setQuizResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState({ got: 0, total: 0 });

  const cat = categories.find((c) => c.id === active)!;

  const filtered = search.trim()
    ? categories.flatMap((c) =>
        c.sentences
          .filter(
            ([en, pt]) =>
              en.toLowerCase().includes(search.toLowerCase()) ||
              pt.toLowerCase().includes(search.toLowerCase())
          )
          .map((s) => ({ label: c.label, sentence: s }))
      )
    : null;

  const toggleReveal = (i: number) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const quizSentences = quizOrder.map((i) => cat.sentences[i]);
  const current = quizSentences[quizIndex];

  const normalize = (s: string) =>
    s.trim().toLowerCase().replace(/[.,!?]+$/, "").replace(/\s+/g, " ");

  const submitAnswer = () => {
    if (!userAnswer.trim()) return;
    const correct = normalize(userAnswer) === normalize(current[0]);
    setQuizResult(correct ? "correct" : "wrong");
    setQuizRevealed(true);
    setScore((s) => ({ got: s.got + (correct ? 1 : 0), total: s.total + 1 }));
  };

  const nextQuestion = () => {
    if (quizIndex < quizSentences.length - 1) {
      setQuizIndex((i) => i + 1);
    } else {
      setQuizMode(false);
      setQuizIndex(0);
    }
    setQuizRevealed(false);
    setUserAnswer("");
    setQuizResult(null);
  };

  const handleQuizAnswer = (correct: boolean) => {
    setScore((s) => ({
      got: s.got + (correct ? 1 : 0),
      total: s.total + 1,
    }));
    if (quizIndex < quizSentences.length - 1) {
      setQuizIndex((i) => i + 1);
      setQuizRevealed(false);
    } else {
      setQuizMode(false);
      setQuizIndex(0);
      setQuizRevealed(false);
    }
  };

  const startQuiz = () => {
    const total = cat.sentences.length;
    const min = Math.max(3, Math.floor(total * 0.4));
    const count = min + Math.floor(Math.random() * (total - min + 1));
    const order = Array.from({ length: total }, (_, i) => i)
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
    setQuizOrder(order);
    setQuizMode(true);
    setQuizIndex(0);
    setQuizRevealed(false);
    setUserAnswer("");
    setQuizResult(null);
  };

  const exitQuiz = () => {
    setQuizMode(false);
  };

  const switchCategory = (id: string) => {
    setActive(id);
    setSearch("");
    setQuizMode(false);
    setRevealed(new Set());
    setQuizIndex(0);
    setQuizRevealed(false);
    setQuizOrder([]);
    setUserAnswer("");
    setQuizResult(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{
        borderBottom: "1px solid var(--border)",
        padding: "1.5rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem",
      }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "var(--accent)",
          }}>
            english patterns
          </h1>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>
            {categories.length} categorias · {categories.reduce((a, c) => a + c.sentences.length, 0)} frases
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="buscar frase..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "6px 12px",
              color: "var(--text)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              outline: "none",
              width: "200px",
            }}
          />
          {score.total > 0 && (
            <span style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 500, whiteSpace: "nowrap" }}>
              {score.got}/{score.total} quiz
            </span>
          )}
        </div>
      </header>

      <div style={{ display: "flex", height: "calc(100vh - 73px)" }}>
        <nav style={{
          width: "200px",
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          overflowY: "auto",
          padding: "1rem 0",
        }}>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => switchCategory(c.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 1.25rem",
                background: active === c.id ? "var(--surface2)" : "transparent",
                color: active === c.id ? "var(--accent)" : "var(--muted)",
                border: "none",
                borderLeft: active === c.id ? "2px solid var(--accent)" : "2px solid transparent",
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                cursor: "pointer",
                lineHeight: 1.4,
              }}
            >
              {c.label}
            </button>
          ))}
        </nav>

        <main style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
          {search.trim() ? (
            <div>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
                {filtered?.length ?? 0} resultado(s) para &quot;{search}&quot;
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filtered?.map(({ label, sentence }, i) => (
                  <div key={i} style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "14px 16px",
                  }}>
                    <span style={{
                      fontSize: "0.65rem",
                      color: "var(--accent2)",
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.08em",
                      display: "block",
                      marginBottom: "6px",
                    }}>{label}</span>
                    <p style={{ fontSize: "0.9rem", color: "var(--text)", marginBottom: "4px" }}>{sentence[0]}</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{sentence[1]}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : quizMode ? (
            <div style={{ maxWidth: "560px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--accent)" }}>
                  quiz — {quizIndex + 1}/{quizSentences.length}
                </h2>
                <button onClick={exitQuiz} style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  color: "var(--muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  cursor: "pointer",
                }}>sair</button>
              </div>

              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "2rem",
                marginBottom: "1rem",
              }}>
                <p style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: "0.75rem" }}>traduza para inglês:</p>
                <p style={{
                  fontSize: "1.15rem",
                  color: "var(--text)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}>{current[1]}</p>

                {quizRevealed && (
                  <div style={{
                    marginTop: "1.5rem",
                    paddingTop: "1.5rem",
                    borderTop: "1px solid var(--border)",
                  }}>
                    <p style={{
                      fontSize: "0.72rem",
                      color: quizResult === "correct" ? "var(--accent)" : "#e74c3c",
                      marginBottom: "6px",
                      fontWeight: 600,
                    }}>
                      {quizResult === "correct" ? "correto!" : "quase — a resposta era:"}
                    </p>
                    <p style={{ fontSize: "1rem", color: "var(--accent)", fontWeight: 500 }}>{current[0]}</p>
                  </div>
                )}
              </div>

              {!quizRevealed ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input
                    autoFocus
                    type="text"
                    placeholder="escreva a tradução em inglês..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      color: "var(--text)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.85rem",
                      outline: "none",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim()}
                    style={{
                      width: "100%",
                      background: userAnswer.trim() ? "var(--accent)" : "var(--surface2)",
                      color: userAnswer.trim() ? "#000" : "var(--muted)",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      cursor: userAnswer.trim() ? "pointer" : "not-allowed",
                    }}
                  >
                    verificar
                  </button>
                </div>
              ) : (
                <button onClick={nextQuestion} style={{
                  width: "100%",
                  background: "transparent",
                  border: "1px solid var(--accent)",
                  color: "var(--accent)",
                  borderRadius: "8px",
                  padding: "12px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}>
                  {quizIndex < quizSentences.length - 1 ? "próxima →" : "ver resultado →"}
                </button>
              )}
            </div>
          ) : (
            <div style={{ maxWidth: "680px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap" as const, gap: "1rem" }}>
                <div>
                  <h2 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "var(--text)",
                    marginBottom: "4px",
                  }}>{cat.title}</h2>
                  <code style={{
                    fontSize: "0.72rem",
                    color: "var(--accent2)",
                    background: "var(--surface2)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}>{cat.pattern}</code>
                </div>
                <button onClick={startQuiz} style={{
                  background: "transparent",
                  border: "1px solid var(--accent)",
                  color: "var(--accent)",
                  borderRadius: "6px",
                  padding: "6px 14px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  flexShrink: 0,
                }}>iniciar quiz →</button>
              </div>

              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderLeft: "3px solid var(--accent)",
                borderRadius: "6px",
                padding: "12px 16px",
                marginBottom: "1.5rem",
                fontSize: "0.78rem",
                color: "var(--muted)",
                lineHeight: 1.7,
              }}>{cat.rule}</div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {cat.sentences.map(([en, pt], i) => (
                  <div
                    key={i}
                    onClick={() => toggleReveal(i)}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "14px 16px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                      <p style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.5 }}>{en}</p>
                      <span style={{ fontSize: "0.65rem", color: "var(--muted)", flexShrink: 0, marginTop: "2px" }}>
                        {revealed.has(i) ? "▲" : "▼"}
                      </span>
                    </div>
                    {revealed.has(i) && (
                      <p style={{
                        fontSize: "0.78rem",
                        color: "var(--accent2)",
                        marginTop: "8px",
                        paddingTop: "8px",
                        borderTop: "1px solid var(--border)",
                      }}>{pt}</p>
                    )}
                  </div>
                ))}
              </div>

              <p style={{ fontSize: "0.65rem", color: "var(--muted)", textAlign: "center" as const, marginTop: "1.5rem" }}>
                clique em uma frase para ver a tradução
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
