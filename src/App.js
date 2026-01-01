import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./App.css";

function App() {
  const [mood, setMood] = useState("good");
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);
  const leftPupilRef = useRef(null);
  const rightPupilRef = useRef(null);
  const mouthRef = useRef(null);
  const cardRef = useRef(null);
  const moodTextRef = useRef(null);
  const sliderDotsRef = useRef([]);
  const blinkIntervalRef = useRef(null);
  const faceRef = useRef(null);
  const confettiRef = useRef(null);

  const moods = ["bad", "okay", "good"];

  // Pupil follows cursor for good/bad only
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cardRef.current) return;
      if (mood === "okay") return; // No pupils for neutral
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
      gsap.to([leftPupilRef.current, rightPupilRef.current], {
        x,
        y,
        duration: 0.3,
        ease: "power1.out",
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mood]);

  // Mood animations
  useEffect(() => {
    gsap.killTweensOf([leftPupilRef.current, rightPupilRef.current, mouthRef.current, faceRef.current]);
    if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);

    // Background gradient
    let gradient;
    if (mood === "good") gradient = "linear-gradient(135deg, #056508ff, #5eb862ff)";
    else if (mood === "okay") gradient = "linear-gradient(135deg, #a28a3fff, #cebe8dff)";
    else gradient = "linear-gradient(135deg, #a24c46ff, #a86f6fff)";
    gsap.to(cardRef.current, { background: gradient, duration: 0.8, ease: "power2.inOut" });

    // Mouth morph
    const mouthProps = {
      good: { borderBottom: "6px solid #c9deb9", borderTop: "0px", borderRadius: "0 0 50% 50%" },
      okay: { borderBottom: "0px", borderTop: "6px solid #e0e0c1", borderRadius: "0" },
      bad: { borderTop: "6px solid #fed5d5", borderBottom: "0px", borderRadius: "50% 50% 0 0" },
    };
    if (mouthRef.current) gsap.to(mouthRef.current, { ...mouthProps[mood], duration: 0.5, ease: "power2.out" });

    // Eyes
    gsap.set([leftEyeRef.current, rightEyeRef.current], { scaleY: 1, rotation: 0 });
    if (mood === "okay") {
      // Hide pupils
      gsap.set([leftPupilRef.current, rightPupilRef.current], { scale: 0 });
      const blink = () => {
        gsap.to([leftEyeRef.current, rightEyeRef.current], {
          scaleY: 0.1,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut",
        });
      };
      blinkIntervalRef.current = setInterval(blink, 2000);
    } else {
      gsap.set([leftPupilRef.current, rightPupilRef.current], { scale: 1 });
    }

    // Slider dot animation
    sliderDotsRef.current.forEach((dot, i) => {
      if (dot && i === moods.indexOf(mood)) {
        gsap.fromTo(dot, { scale: 0.8 }, { scale: 1.2, duration: 0.3, yoyo: true, repeat: 1, ease: "back.out(2)" });
      }
    });

    // Mood text pop
    if (moodTextRef.current) {
      gsap.fromTo(
        moodTextRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
      );
    }

    // Mood text slide in from left and fade in
    if (moodTextRef.current) {
      gsap.fromTo(
        moodTextRef.current,
        { x: -0, opacity: -3 },        
        { x: 0, opacity: 1, duration: 1, ease: "power2.out" } 
      );
    }


    // Face tilt + subtle bounce
    gsap.to(faceRef.current, {
      rotation: mood === "good" ? 5 : mood === "bad" ? -5 : 0,
      y: 0,
      duration: 0.6,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });

    return () => {
      if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
    };
  }, [mood]);

  // Submit + confetti
  const handleSubmit = () => {
    setSubmitted(true);

    // Wait for DOM update before creating confetti
    setTimeout(() => {
      if (!confettiRef.current) return;

      // Face pop
      gsap.fromTo(faceRef.current, { scale: 0.8 }, { scale: 1, duration: 0.6, ease: "elastic.out(1,0.5)" });

      // Confetti
      const confettiCount = 30;
      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement("div");
        confetti.className = "confetti";
        confettiRef.current.appendChild(confetti);
        const x = Math.random() * 400 - 200;
        const rotation = Math.random() * 360;
        const duration = 1 + Math.random();
        gsap.fromTo(
          confetti,
          { x: 0, y: 0, rotation: 0, opacity: 1 },
          { x, y: 300, rotation, duration, ease: "power1.out", onComplete: () => confetti.remove() }
        );
      }
    }, 0);
  };

  return (
    <div className="app">
      <div className="card" ref={cardRef}>
        {!submitted && <h2>How was your shopping experience?</h2>}

        <div className="face" ref={faceRef}>
          <div className="eyes">
            <div className="eye" ref={leftEyeRef}>
              <div className="eyeball" ref={leftPupilRef} />
            </div>
            <div className="eye" ref={rightEyeRef}>
              <div className="eyeball" ref={rightPupilRef} />
            </div>
          </div>
          <div className="mouth" ref={mouthRef} />
        </div>

        {mood && !submitted && <div className="mood-text" ref={moodTextRef}>{mood.toUpperCase()}</div>}

        {!submitted && (
          <>
            <div className="slider">
              <div className="line" />
              {moods.map((val, i) => (
                <button
                  key={val}
                  className={`dot ${mood === val ? "active" : ""}`}
                  style={{ left: val === "bad" ? "24px" : val === "okay" ? "50%" : "calc(100% - 24px)" }}
                  ref={el => (sliderDotsRef.current[i] = el)}
                  onClick={() => setMood(val)}
                >
                  {mood === val && <span className={`dot-mouth ${val}`} />}
                </button>
              ))}
            </div>

            <div className="labels">
              <span>Bad</span>
              <span>Okay</span>
              <span>Good</span>
            </div>

            {showFeedback && (
              <textarea placeholder="Write your feedback..." value={feedback} onChange={e => setFeedback(e.target.value)} />
            )}

            <div className="actions">
              <button className="add-feedback" onClick={() => setShowFeedback(!showFeedback)}>
                {showFeedback ? "Cancel Feedback" : "Add Feedback"}
              </button>
              <button className="submit" onClick={handleSubmit}>Submit →</button>
            </div>
          </>
        )}

        {submitted && (
          <div className="success-message">
            <h3>Thank you for your feedback!</h3>
            {feedback && <p className="feedback">{feedback}</p>}
            <div className="confetti-container" ref={confettiRef}></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
