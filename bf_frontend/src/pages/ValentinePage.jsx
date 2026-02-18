import { useEffect, useMemo, useRef, useState } from "react";
// import { logAudit } from "../api";

const linkId = localStorage.getItem("bf_link_id") || "unknown";
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 🎉 Reusable emoji rain
function EmojiRain({ burstKey, emojis }) {
  const [drops, setDrops] = useState([]);

  useMemo(() => {
    if (!burstKey) return;

    const now = Date.now();
    const list = Array.from({ length: 30 }).map((_, i) => ({
      id: `${now}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.18,
      duration: 1.0 + Math.random() * 0.8,
      size: 16 + Math.random() * 20,
      rotate: Math.random() * 360,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));

    setDrops(list);
    const t = setTimeout(() => setDrops([]), 1700);
    return () => clearTimeout(t);
  }, [burstKey, emojis]);

  if (drops.length === 0) return null;

  return (
    <div className="emojiRain" aria-hidden="true">
      {drops.map((d) => (
        <span
          key={d.id}
          className="drop"
          style={{
            left: `${d.left}vw`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
            fontSize: `${d.size}px`,
            transform: `rotate(${d.rotate}deg)`,
          }}
        >
          {d.emoji}
        </span>
      ))}
    </div>
  );
}

export default function ValentinePage() {
  const herName = localStorage.getItem("bf_her_name") || "Love";

  const [noMoves, setNoMoves] = useState(0);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [answer, setAnswer] = useState(null); // "yes" | "no" | null

  // animation triggers
  const [burstKey, setBurstKey] = useState("");
  const [burstType, setBurstType] = useState(null); // "yes" | "no"

  // poem state
  const [poem, setPoem] = useState("");
  const lastPoemIdx = useRef(-1);

  const arenaRef = useRef(null);
  const noBtnRef = useRef(null);

  const allowNo = noMoves >= 20;

  // ✅ Yes button scale: grows till 3 attempts, then slowly shrinks
  const yesScale = useMemo(() => {
    if (noMoves <= 3) return 1 + noMoves * 0.10; // 1.0 → 1.3
    return Math.max(1.0, 1.3 - (noMoves - 3) * 0.07); // shrink after 3
  }, [noMoves]);

  // Keep "No" normal size (optional small change)
  const noScale = useMemo(() => {
    if (noMoves <= 3) return 1.0;
    return Math.max(0.92, 1.0 - (noMoves - 3) * 0.02);
  }, [noMoves]);

  const poems = useMemo(
    () => [
      `Hey ${herName}… you’re my calm in a noisy world 💖`,
      `${herName}, if love was a place… I’d choose you as home 🏡💞`,
      `I don’t need perfect days, ${herName}… I just need you in them 🌙✨`,
      `${herName}, your smile is my favorite reason to believe in love 😌💘`,
      `If I had one wish, ${herName}… it’s more “us” and less “distance” 🫶`,
      `${herName}, I’ll choose you… today, tomorrow, always 💍🤍`,
    ],
    [herName]
  );

  useEffect(() => {
    // initial position: NO button aligned right inside arena
    placeNoRight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function placeNoRight() {
    const arena = arenaRef.current;
    const btn = noBtnRef.current;
    if (!arena || !btn) return;

    const a = arena.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    const pad = 12;

    const x = Math.max(pad, Math.floor(a.width - b.width - pad));
    const y = 0; // align baseline with actions row

    setNoPos({ x, y });
  }

  function moveNoRandom() {
    const arena = arenaRef.current;
    const btn = noBtnRef.current;
    if (!arena || !btn) return;

    const a = arena.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    const pad = 12;

    const maxX = Math.max(pad, a.width - b.width - pad);
    const maxY = Math.max(pad, a.height - b.height - pad);

    setNoPos({
      x: rand(pad, Math.floor(maxX)),
      y: rand(pad, Math.floor(maxY)),
    });

    setNoMoves((m) => m + 1);
  }

  function pickNewPoem() {
    if (poems.length === 0) return "";
    let i = rand(0, poems.length - 1);
    if (poems.length > 1 && i === lastPoemIdx.current) {
      i = (i + 1) % poems.length;
    }
    lastPoemIdx.current = i;
    return poems[i];
  }

  function onYes() {
    const newPoem = pickNewPoem();
    setPoem(newPoem);

    setAnswer("yes");
    setBurstType("yes");
    setBurstKey(`yes-${Date.now()}`); // ✅ every time unique
    logAudit({
    link_id: linkId,
    page: "valentine",
    action: "click",
    question: "Do you love me?",
    selected: "Yes",
  }).catch(() => {});
  }

  function onNoClick() {
    if (!allowNo) {
      moveNoRandom();
      return;
    }
    setAnswer("no");
    setBurstType("no");
    setBurstKey(`no-${Date.now()}`);
    logAudit({
    link_id: linkId,
    page: "valentine",
    action: "click",
    question: "Do you love me?",
    selected: "No",
  }).catch(() => {});
  }

  return (
    <div className="page heartsBg">
      {/* Rain */}
      {burstType === "yes" && (
        <EmojiRain burstKey={burstKey} emojis={["💋", "💖", "💘", "😍", "🩷", "😘"]} />
      )}
      {burstType === "no" && (
        <EmojiRain burstKey={burstKey} emojis={["😢", "🥺", "💔", "😭", "😞"]} />
      )}

      <div className="card glass">
        <div className="badge">💘 Final question</div>
        <h1 className="title">Hey {herName}…</h1>
        <p className="muted">One last thing 🙈</p>

        <div className="arena" ref={arenaRef}>
          {answer === null && (
            <>
              <div className="finalQ">Do you love me? 😳</div>

              <div className="actionsRow">
                <button
                  className="btn primary big"
                  onClick={onYes}
                  style={{ transform: `scale(${yesScale})` }}
                >
                  Yes 💖
                </button>

                <button
                  ref={noBtnRef}
                  className={`btn ghost big ${allowNo ? "" : "escape"}`}
                  style={{
                    transform: `scale(${noScale})`,
                    position: allowNo ? "static" : "absolute",
                    right: allowNo ? undefined : undefined,
                    left: allowNo ? undefined : `${noPos.x}px`,
                    top: allowNo ? undefined : `${noPos.y}px`,
                  }}
                  // escape behavior
                  onMouseEnter={() => !allowNo && moveNoRandom()}
                  onMouseMove={() => !allowNo && moveNoRandom()}
                  onClick={onNoClick}
                >
                  No 🙈
                </button>
              </div>

              <div className="hint">
                {allowNo
                  ? "Okay okay 😄 now you can click No also."
                  : `Try clicking No… if you can 😏 (${noMoves}/20)`}
              </div>
            </>
          )}

          {answer === "yes" && (
            <div className="result poemGood">
              <div className="bigEmoji">💞</div>
              <div className="resultTitle">YAYYYYY!</div>

              <div className="poemLine">{poem}</div>

              <div className="muted" style={{ marginTop: 10 }}>
                You just made my whole day 🥺💖 <br />
                Now send me a smile selfie 😄
              </div>
            </div>
          )}

          {answer === "no" && (
            <div className="result poemSoft">
              <div className="bigEmoji">💔</div>
              <div className="resultTitle">Aiyo… okay 🥺</div>

              {/* ✅ Sad gif (put your gif path here) */}
              {/* <img
                className="sadGif"
                src="/assets/sad-emoji.gif"
                alt="sad"
              /> */}

              <div className="muted" style={{ marginTop: 10 }}>
                No pressure… but my heart got little “ouch” 😢
              </div>
            </div>
          )}
        </div>

        <p className="tiny muted">Tip: share this link to her 💌</p>
      </div>
    </div>
  );
}
