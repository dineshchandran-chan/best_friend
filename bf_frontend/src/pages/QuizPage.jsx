import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAnswer, finishQuiz } from "../api";

const QUESTIONS = [
  {
    id: "q1",
    q: "What do you want from me the most? 💞",
    options: [
      { text: "More time", poem: "Time with you feels like my favorite song on repeat 🎶💖" },
      { text: "More care", poem: "Even small care from me… I want it to feel big for you 🫶✨" },
      { text: "More love", poem: "If love had a shape, it would look like us 🤍🌙" },
      { text: "More memories", poem: "Let’s collect moments… not just photos 📸💘" },
    ],
  },
  {
    id: "q2",
    q: "If I was beside you right now, what would you want? 😌",
    options: [
      { text: "A tight hug", poem: "One hug from you can fix my whole day 🤗💗" },
      { text: "Hold hands", poem: "Your hand in mine… my heart becomes calm instantly 🤝✨" },
      { text: "Long talk", poem: "I don’t want perfect words… I just want your voice 🗣️💞" },
      { text: "Silent comfort", poem: "Even silence feels romantic when it’s with you 🌙🫶" },
    ],
  },
  {
    id: "q3",
    q: "Which version of us do you love the most? 💕",
    options: [
      { text: "Cute + soft", poem: "Soft love is the strongest kind… and I choose you 😌💖" },
      { text: "Best friends", poem: "You’re my lover and my best friend… jackpot 🎁💘" },
      { text: "Late-night talks", poem: "Nights feel shorter when you’re in my thoughts 🌌❤️" },
      { text: "Future us", poem: "One day… I hope ‘us’ becomes my forever word 🥺💍" },
    ],
  },
  {
    id: "q4",
    q: "Pick a date idea with me 😏🌹",
    options: [
      { text: "Beach sunset", poem: "Sunset + you + me… perfect scene 🌅💞" },
      { text: "Coffee & walk", poem: "Just walking with you… is already a date ☕🚶‍♂️💖" },
      { text: "Movie & cuddle", poem: "Movie is optional… cuddle is compulsory 😌🎬💘" },
      { text: "Road trip", poem: "I want miles with you… not distance from you 🚗💗" },
    ],
  },
  {
    id: "q5",
    q: "What do you want me to tell you today? 🥺",
    options: [
      { text: "I miss you", poem: "I miss you in small moments… and in big ones too 🫶💞" },
      { text: "I’m proud of you", poem: "I’m proud of you… even for the things you don’t notice 🌷✨" },
      { text: "You’re special", poem: "You are not an option… you’re my favorite choice 💖" },
      { text: "Stay with me", poem: "Stay… not for today… for all the tomorrows 🤍🌙" },
    ],
  },
];

// 🌸 Flower rain component (pure CSS + state)
function FlowerRain({ burstKey }) {
  const [petals, setPetals] = useState([]);

  // Whenever burstKey changes, create a new burst
  useMemo(() => {
    if (!burstKey) return;

    const emojis = ["🌸", "💮", "🌺", "🌷", "🩷"];
    const now = Date.now();

    const newPetals = Array.from({ length: 26 }).map((_, i) => ({
      id: `${now}-${i}`,
      left: Math.random() * 100,          // vw %
      delay: Math.random() * 0.15,        // seconds
      duration: 0.9 + Math.random() * 0.6, // seconds
      size: 14 + Math.random() * 18,      // px
      rotate: Math.random() * 360,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));

    setPetals(newPetals);

    const t = setTimeout(() => setPetals([]), 1400);
    return () => clearTimeout(t);
  }, [burstKey]);

  if (petals.length === 0) return null;

  return (
    <div className="flowerRain" aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={{
            left: `${p.left}vw`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            fontSize: `${p.size}px`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

export function initLinkIdFromUrl() {
  const url = new URL(window.location.href);
  const lid = url.searchParams.get("lid");
  if (lid) localStorage.setItem("bf_link_id", lid);
}


export default function QuizPage() {
  const nav = useNavigate();
  const herName = useMemo(() => localStorage.getItem("bf_her_name") || "Love", []);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null); // option index
  const [poem, setPoem] = useState("");
  const [saving, setSaving] = useState(false);

  // used to trigger flower rain burst
  const [burstKey, setBurstKey] = useState("");
  const saveSeq = useRef(0); // to avoid older saves overwriting newer

  const item = QUESTIONS[idx];

  
  async function chooseOption(i) {
    // ✅ allow changing answer (no early return, no disabling)
    setPicked(i);
    setPoem(item.options[i].poem);

    // 🌸 trigger animation burst every click
    setBurstKey(`${item.id}-${i}-${Date.now()}`);

    // ✅ save latest only
    const mySeq = ++saveSeq.current;

    setSaving(true);
    try {
      await saveAnswer({
        question_id: item.id,
        selected: item.options[i].text,
      });
    } finally {
      // only clear saving if this is the latest request
      if (mySeq === saveSeq.current) setSaving(false);
    }
  }

  
  async function next() {
    if (idx < QUESTIONS.length - 1) {
      setIdx((x) => x + 1);
      setPicked(null);
      setPoem("");
      setBurstKey("");
      return;
    }
    await finishQuiz();
    nav("/valentine");
  }

  return (
    <div className="page heartsBg">
      {/* 🌸 flower rain overlay */}
      <FlowerRain burstKey={burstKey} />

      <div className="card glass">
        <div className="badge">🌸 Romantic Quiz</div>
        <h2 className="title">Hey {herName} 🥰</h2>
        <p className="muted">Pick any option… and you can change it anytime 💖</p>

        <div className="quizBox">
          <div className="qTop">
            <div className="qCount">
              Question {idx + 1}/{QUESTIONS.length}
            </div>
          </div>

          <div className="qText">{item.q}</div>

          <div className="grid4">
            {item.options.map((opt, i) => {
              const isPicked = picked === i;

              let cls = "opt";
              if (isPicked) cls += " optPink optPop"; // ✅ animate selected

              return (
                <button
                  key={opt.text}
                  className={cls}
                  onClick={() => chooseOption(i)}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <div className="poem poemGood poemFade">
              {poem}
            </div>
          )}

          <div className="rowSpace">
            <div className="muted tiny">{saving ? "Saving your answer..." : " "}</div>
            <button className="btn primary" onClick={next} disabled={picked === null}>
              {idx < QUESTIONS.length - 1 ? "Next ➜" : "Finish 💖"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
