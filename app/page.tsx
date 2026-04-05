"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

const PEOPLE = [
  { name: "Jeon Jung-cook", avatar: "/images/jungkook.png" },
  { name: "Trấn Thành", avatar: "/images/tranthanh.png" },
  { name: "Billie English", avatar: "/images/billieeilish.png" },
  { name: "Elon Musk", avatar: "/images/elon.png" },
  { name: "Trịnh Trần Phương Tuấn", avatar: "/images/trinhtranphuongtuan.png" },
  { name: "Hari won", avatar: "/images/hariwon.png" },
  { name: "Donald Trump", avatar: "/images/donaldtrump.png" },
  { name: "Jake Sully", avatar: "/images/jack.jpeg" },
  { name: "Anh của Trang =)", avatar: "/images/people.png" },
  { name: "Hoàng Văn Thái Sơn", avatar: "/images/hvts.jpg" },
  { name: "Ngô Bá Khá", avatar: "/images/khabanh.png" },
  { name: "Yelena", avatar: "/images/yelena.png" },
  { name: "Việt Nam", avatar: "/images/vn.png" },
  { name: "J-97", avatar: "/images/j97.jpg" },
  { name: "??", avatar: "/images/a.png" },
  { name: "Oggy", avatar: "/images/oggy.jpg" },
  { name: "Lò Ngọc Minh <3", avatar: "/images/longocminh.jpg" },
  { name: "Homelander", avatar: "/images/homelander.png" },
];

export default function Home() {
  const celebrantName = "Lò Ngọc Minh <3";
  const eventDate = "27 May";
  const pageSize = 6;

  const message =
    "Happy birthday to you. Cam on ban da xuat hien trong cuoc doi nay va mang den rat nhieu nang luong dep. Chuc ban tuoi moi luon vui, luon duoc thuong va luon co du can dam de theo duoi dieu minh yeu.";

  const [typedDate, setTypedDate] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [wrongPick, setWrongPick] = useState<string | null>(null);
  const [gateMessage, setGateMessage] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMailOpen, setIsMailOpen] = useState(false);
  const [typedMailMessage, setTypedMailMessage] = useState("");
  const [hasPlayedMailTyping, setHasPlayedMailTyping] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pinRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!isUnlocked) return;
    audioRef.current = new Audio("/happy-birthday.mp3");
    audioRef.current.volume = 0.6;
    audioRef.current.loop = true;
    audioRef.current.play().catch(() => {});
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [isUnlocked]);

  const happyChars = useMemo(() => "Happy".split(""), []);
  const birthdayChars = useMemo(() => "Birthday".split(""), []);
  const circleChars = useMemo(
    () => "happy-birthday-happy-birthday-".split(""),
    []
  );
  const totalPages = Math.ceil(PEOPLE.length / pageSize);
  const visiblePeople = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return PEOPLE.slice(start, start + pageSize);
  }, [currentPage]);
  const gateSparkles = useMemo(() => Array.from({ length: 11 }), []);
  const gateHearts = useMemo(() => Array.from({ length: 8 }), []);
  const dreamyDots = useMemo(() => Array.from({ length: 14 }), []);
  const heartTrail = useMemo(() => Array.from({ length: 7 }), []);

  useEffect(() => {
    if (!isUnlocked) {
      return;
    }

    let index = 0;
    const startDelay = window.setTimeout(() => {
      const timer = window.setInterval(() => {
        if (index >= eventDate.length) {
          window.clearInterval(timer);
          return;
        }
        setTypedDate((prev) => prev + eventDate[index]);
        index += 1;
      }, 110);
    }, 900);

    return () => window.clearTimeout(startDelay);
  }, [eventDate, isUnlocked]);

  useEffect(() => {
    if (!isMailOpen) {
      return;
    }

    if (hasPlayedMailTyping) {
      setTypedMailMessage(message);
      return;
    }

    let index = 0;
    setTypedMailMessage("");
    setHasPlayedMailTyping(true);
    let timer: number | undefined;

    const startDelay = window.setTimeout(() => {
      timer = window.setInterval(() => {
        if (index >= message.length) {
          if (timer) {
            window.clearInterval(timer);
          }
          return;
        }
        setTypedMailMessage((prev) => prev + message[index]);
        index += 1;
      }, 22);
    }, 220);

    return () => {
      window.clearTimeout(startDelay);
      if (timer) {
        window.clearInterval(timer);
      }
    };
  }, [hasPlayedMailTyping, isMailOpen, message]);

  const handlePersonPick = (name: string) => {
    setSelectedPerson(name);
    setPasswordInput("");
    setGateMessage("");
    setWrongPick(null);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedPerson) {
      setGateMessage("Hay chon mot nguoi truoc khi nhap mat khau.");
      return;
    }

    const isCorrect =
      selectedPerson === celebrantName && passwordInput.trim() === "040404";

    if (isCorrect) {
      setTypedDate("");
      setIsUnlocked(true);
      setGateMessage("");
      setWrongPick(null);
      setIsPasswordModalOpen(false);
      return;
    }

    setWrongPick(selectedPerson);
    setGateMessage("Unu sai rùi thử lại nha :<");
    window.setTimeout(() => setWrongPick(null), 520);
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) {
      return;
    }
    setCurrentPage(page);
    setGateMessage("");
    setWrongPick(null);
    setSelectedPerson(null);
    setPasswordInput("");
    setIsPasswordModalOpen(false);
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordInput("");
  };

  const handlePinChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const chars = Array.from({ length: 6 }, (_, i) => passwordInput[i] ?? "");
    chars[index] = digit;
    setPasswordInput(chars.join(""));
    if (digit && index < 5) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      const chars = Array.from({ length: 6 }, (_, i) => passwordInput[i] ?? "");
      if (chars[index]) {
        chars[index] = "";
        setPasswordInput(chars.join(""));
      } else if (index > 0) {
        pinRefs.current[index - 1]?.focus();
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      pinRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) {
      return;
    }

    setPasswordInput(pasted);
    const nextFocusIndex = Math.min(pasted.length, 5);
    pinRefs.current[nextFocusIndex]?.focus();
  };

  return (
    <main className="birthday-page hb-shell relative min-h-screen overflow-hidden px-4 py-8 sm:px-8">
      {!isUnlocked && (
        <section className="gate-screen">
          <div className="gate-decor" aria-hidden="true">
            {gateSparkles.map((_, i) => (
              <span
                key={`gs-${i}`}
                className="gate-spark"
                style={{
                  left: `${8 + i * 8}%`,
                  top: `${6 + (i % 4) * 18}%`,
                  animationDelay: `${i * 0.3}s`,
                }}
              >
                ✦
              </span>
            ))}
            {gateHearts.map((_, i) => (
              <span
                key={`gh-${i}`}
                className="gate-heart"
                style={{
                  left: `${6 + i * 11}%`,
                  animationDelay: `${0.35 + i * 0.5}s`,
                }}
              >
                ❤
              </span>
            ))}
          </div>

          <div className="gate-card">
            <p className="gate-eyebrow">Choose The Birthday Person</p>
            <h1 className="title-serif gate-title">Sơn đang không biết 04/04 là sinh nhật của ai, hãy giúp anh ấyyy</h1>
            <p className="gate-subtitle">Hãy chọn đúng người có sinh nhật là ngày 04/04.</p>
            <br />
            <br />
            <div className="people-grid" role="list">
              {visiblePeople.map((person, i) => (
                <button
                  key={person.name}
                  type="button"
                  onClick={() => handlePersonPick(person.name)}
                  className={`person-card ${selectedPerson === person.name ? "selected" : ""} ${wrongPick === person.name ? "wrong" : ""}`}
                  style={{ animationDelay: `${i * 0.07}s, 0.85s` }}
                >
                  <span className="avatar-rect" aria-hidden="true">
                    <Image
                      src={person.avatar}
                      alt={`${person.name} avatar`}
                      fill
                      sizes="78px"
                      className="avatar-img"
                    />
                  </span>
                  <span className="person-name">{person.name}</span>
                </button>
              ))}
            </div>

            <br />
            <br />
            <div className="gate-pagination" aria-label="Pagination">
              {currentPage > 1 && (
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  className="pager-btn prevbtn"
                >
                  Nuu trang này cũng chả có ai, về trang trước ii
                </button>
              )}

              {currentPage < 3 && (
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pager-btn nextbtn"
                >
                  Chã thấy ai cả, qua trang sau xem nèoo
                </button>
              )}
            </div>
            {isPasswordModalOpen && selectedPerson && (
              <section className="gate-pass-overlay" role="dialog" aria-modal="true">
                <article className="gate-pass-modal">
                  <button
                    type="button"
                    onClick={closePasswordModal}
                    className="gate-pass-close"
                  >
                    x
                  </button>

                  <form className="gate-auth" onSubmit={handlePasswordSubmit}>
                    <h3 className="gate-auth-title">Có chắc không bbi =)))</h3>
                    <p className="gate-auth-label">Bbi cần nhập mật khẩu cho {selectedPerson}</p>
                    <br />
                    <div className="pin-boxes" role="group" aria-label="Nhập mật khẩu 6 số">
                      {Array.from({ length: 6 }, (_, i) => (
                        <input
                          key={i}
                          ref={(el) => { pinRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={passwordInput[i] ?? ""}
                          onChange={(e) => handlePinChange(i, e.target.value)}
                          onKeyDown={(e) => handlePinKeyDown(i, e)}
                          onPaste={handlePinPaste}
                          className={`pin-box ${passwordInput[i] ? "filled" : ""}`}
                          aria-label={`Số thứ ${i + 1}`}
                          autoFocus={i === 0}
                        />
                      ))}
                    </div>
                    <br />
                    <button type="submit" className="gate-submit gate-submit-full">
                      Xác nhận
                    </button>
                    <p className="gate-feedback" aria-live="polite">
                      {gateMessage}
                    </p>
                  </form>
                </article>
              </section>
            )}
          </div>
        </section>
      )}

      {isUnlocked && (
        <>
          <div className="dreamy-dots" aria-hidden="true">
            {dreamyDots.map((_, i) => (
              <span
                key={`dot-${i}`}
                className="dream-dot"
                style={{
                  left: `${5 + i * 7}%`,
                  animationDelay: `${i * 0.45}s`,
                  animationDuration: `${8 + (i % 4)}s`,
                }}
              />
            ))}
          </div>

          <div className="heart-trail" aria-hidden="true">
            {heartTrail.map((_, i) => (
              <span
                key={`heart-${i}`}
                className="heart-pop"
                style={{
                  left: `${11 + i * 12}%`,
                  animationDelay: `${0.5 + i * 0.8}s`,
                }}
              >
                ❤
              </span>
            ))}
          </div>

          <div className="flag-wrap" aria-hidden="true">
            <div className="flag-piece left" />
            <div className="flag-piece right" />
          </div>

          <div className="storybook-card mx-auto grid w-full max-w-6xl gap-8 rounded-[2.2rem] border border-line bg-card/85 p-6 shadow-[0_30px_90px_-35px_rgba(156,45,117,0.45)] backdrop-blur-sm lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            <section>
              <h2 className="reveal mb-1 text-sm font-bold tracking-[0.2em] text-accent uppercase" style={{ animationDelay: "0.1s" }}>
                Birthday Surprise
              </h2>

              <div className="title-serif title-shimmer text-[clamp(3rem,8vw,5.8rem)] leading-[0.92] text-[#5b2746]">
                <div className="inline-flex gap-1 sm:gap-2">
                  {happyChars.map((char, i) => (
                    <span
                      key={`h-${char}-${i}`}
                      className="float-letter"
                      style={{ animationDelay: `${0.35 + i * 0.14}s` }}
                    >
                      {char}
                    </span>
                  ))}
                </div>
                <br />
                <div className="inline-flex gap-1 sm:gap-2">
                  {birthdayChars.map((char, i) => (
                    <span
                      key={`b-${char}-${i}`}
                      className="float-letter"
                      style={{ animationDelay: `${1.05 + i * 0.14}s` }}
                    >
                      {char}
                    </span>
                  ))}
                </div>
                <span className="party-hat" aria-hidden="true">
                  ▲
                </span>
              </div>

              <div className="reveal mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-[#fff0fa]/90 px-4 py-2 text-lg font-bold text-[#72345a]" style={{ animationDelay: "0.7s" }}>
                <span>04/04/2004</span>
              </div>
              <br />

              <button
                type="button"
                onClick={() => setIsMailOpen(true)}
                className="cta-btn mt-7 inline-flex items-center gap-3 rounded-full bg-accent px-7 py-3 text-sm font-bold tracking-[0.06em] text-white transition hover:brightness-95"
              >
                Click Here {celebrantName}
                <span aria-hidden="true">✉</span>
              </button>

              <div className="reveal mt-7 flex flex-wrap gap-3 text-sm text-[#7b4264]" style={{ animationDelay: "1.4s" }}>
                {["shine", "laugh", "grow", "love"].map((item, i) => (
                  <span
                    key={item}
                    className="rounded-full border border-line bg-[#fff1fb]/95 px-3 py-1.5"
                    style={{ animationDelay: `${0.2 + i * 0.15}s` }}
                  >
                    #{item}
                  </span>
                ))}
              </div>
            </section>

            <section className="relative rounded-3xl border border-line bg-[#fff2fb]/80 p-5 sm:p-6">
              <div className="reveal mx-auto w-full max-w-70 rounded-3xl border border-line bg-[linear-gradient(165deg,#fff5fb_0%,#ffe4f4_100%)] p-4 text-center" style={{ animationDelay: "0.4s" }}>
                <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-line shadow-lg">
                  <Image
                    src="/images/longocminh.jpg"
                    alt={`${celebrantName} photo`}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
                <p className="mt-3 text-sm font-semibold tracking-wide text-[#8a4570]">
                  Dear {celebrantName}
                </p>
              </div>

              <div className="balloon balloon-one" aria-hidden="true" />
              <div className="balloon balloon-two" aria-hidden="true" />

              <div className="reveal circle-badge mx-auto mt-8 h-44 w-44 rounded-full border border-[#efc8e2] bg-[#fff3fc]/90" style={{ animationDelay: "0.9s" }}>
                <div className="circle-text">
                  {circleChars.map((char, i) => (
                    <span
                      key={`${char}-${i}`}
                      style={{ transform: `rotate(${i * 12.8}deg)` }}
                    >
                      {char}
                    </span>
                  ))}
                </div>
                <div className="circle-core">❤</div>
              </div>
            </section>
          </div>

          <div className="star-field" aria-hidden="true">
            {Array.from({ length: 7 }).map((_, i) => (
              <span
                key={`star-${i}`}
                className="sparkle"
                style={{
                  left: `${10 + i * 13}%`,
                  animationDelay: `${i * 0.4}s`,
                }}
              >
                ✦
              </span>
            ))}
          </div>

          {isMailOpen && (
            <section className="mail-overlay" role="dialog" aria-modal="true">
              <article className="mail-box w-full max-w-3xl overflow-hidden rounded-4xl border border-line bg-[#fff4fc] shadow-2xl">
                <button
                  type="button"
                  onClick={() => setIsMailOpen(false)}
                  className="ml-auto mr-4 mt-4 block rounded-full border border-line px-3 py-1 text-sm font-bold text-[#7f3d65]"
                >
                  ×
                </button>

                <div className="grid gap-4 p-5 md:grid-cols-[0.95fr_1.05fr] md:p-7">
                  <div className="rounded-3xl border border-line bg-[#fff2fb] p-4">
                    <p className="text-sm font-semibold text-[#8b4970]">
                      To: {celebrantName}
                    </p>
                    <h3 className="title-serif mt-2 text-3xl text-[#5c2b47]">
                      Happy Birthday
                    </h3>
                    <div className="mt-4 grid h-44 place-items-center rounded-2xl bg-[radial-gradient(circle_at_35%_25%,#ffc7e8_0,#ee83c3_72%,#cf5da2_100%)] text-4xl text-white">
                      🥳🎂
                    </div>
                  </div>

                  <div className="paper-note rounded-3xl border border-line p-4">
                    <h4 className="paper-title">To You!</h4>
                    <p className="paper-message mt-3 text-sm leading-7 text-[#6f3f59]">
                      {typedMailMessage}
                      {typedMailMessage.length < message.length && (
                        <span className="typing-caret" aria-hidden="true">|</span>
                      )}
                    </p>
                  </div>
                </div>
              </article>
            </section>
          )}
        </>
      )}
    </main>
  );
}
