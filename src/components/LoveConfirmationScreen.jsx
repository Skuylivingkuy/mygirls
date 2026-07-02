import React, { useState, useRef, useCallback, useEffect } from "react";
import { Heart, PartyPopper, Calendar, Clock, IceCream, MessageCircle, X } from "lucide-react";

/* ============================================================================
   CUSTOMIZE ME
   Ganti nomor WA, tanggal, jam, dan kegiatan di sini. Nomor ditulis format
   lokal (08xxx) — nanti otomatis dikonversi ke format internasional (62xxx)
   pas bikin link WhatsApp-nya, lihat komentar di fungsi buildWhatsAppLink().
============================================================================ */
const CONFIG = {
  question: "Kamu sayang aku gak?",
  subtitle: "Jawab jujur ya, tombolnya udah nungguin dari tadi 👀",
  phoneNumber: "082331844648", // format lokal, boleh diganti
  dateInvite: {
    time: "16.00 WIB", // REPLACE_ME
    activity: "Makan es krim + keliling kota 🍦🏙️", // REPLACE_ME
  },
  taunts: [
    "Eits, gabisa~ 😝",
    "Yakin nih? 🤨",
    "Pikir lagi dong~",
    "Tombolnya lagi kabur 🏃‍♂️",
    "Ke-geser lagi deh 😅",
    "Coba tangkep kalo bisa!",
    "Tombol ini rusak kayaknya 😜",
    "Nope, gak semudah itu 🙅‍♀️",
    "Sabar... jodoh gakebalik kok 😌",
  ],
};

/* ============================================================================
   Hook kecil: play "boing" pendek pakai Web Audio API, tanpa file audio.
============================================================================ */
function usePlayBoing() {
  return useCallback(() => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {
      /* audio nggak kedukung, santai aja */
    }
  }, []);
}

/* ============================================================================
   Confetti / heart burst — dipanggil sekali pas tombol IYA ditekan.
   Full-screen fixed overlay, pointer-events-none biar gak ganggu modal.
============================================================================ */
function ConfettiBurst({ pieces }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 select-none"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animation: `lcs-confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            // --drift dipakai di keyframe buat gerakan zig-zag horizontal
            "--drift": `${p.drift}px`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

/* ============================================================================
   Kartu undangan jalan-jalan — muncul setelah IYA ditekan.
============================================================================ */
function DateInviteModal({ onClose }) {
  const { time, activity } = CONFIG.dateInvite;

  // Tanggal dipilih sendiri oleh dia lewat <input type="date">.
  // Formatnya dari input selalu "YYYY-MM-DD", kita simpan apa adanya
  // dulu di state, baru diformat cantik pas mau ditampilkan/dikirim.
  const [selectedDate, setSelectedDate] = useState("");
  const [touched, setTouched] = useState(false);

  const hasDate = selectedDate.trim().length > 0;

  // -----------------------------------------------------------------
  // Ubah "2026-07-12" jadi "Minggu, 12 Juli 2026" pakai Intl API
  // bawaan browser, gak perlu library tambahan.
  // Parsing manual (bukan `new Date("2026-07-12")` langsung) supaya
  // gak kegeser timezone dan tanggalnya tetap sesuai yang dipilih.
  // -----------------------------------------------------------------
  const formatDateID = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(dateObj);
  };

  const prettyDate = formatDateID(selectedDate);

  // ---------------------------------------------------------------------
  // Bangun link WhatsApp:
  // 1. Nomor lokal (08xxxxxxxxxx) dikonversi ke format internasional wa.me
  //    dengan buang angka 0 di depan lalu ganti prefix "62".
  // 2. Pesan disusun sebagai template string biasa (pakai tanggal yang
  //    sudah diformat di atas) lalu di-encode penuh pakai
  //    encodeURIComponent supaya spasi, emoji, dan tanda baca aman
  //    dikirim lewat URL.
  // ---------------------------------------------------------------------
  const buildWhatsAppLink = () => {
    const localNumber = CONFIG.phoneNumber.trim();
    const internationalNumber = "62" + localNumber.replace(/^0/, "");

    const message = `Halo Sayang! Aku udah klik IYA 🥰. Berarti kita fix jalan ya tanggal ${prettyDate}, jam ${time}, buat ${activity}! Aku sayang banget sama kamu 🥰✨`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${internationalNumber}?text=${encodedMessage}`;
  };

  // Tombol kirim dinonaktifkan kalau tanggal belum diisi — daripada
  // ngirim pesan WA dengan tanggal kosong.
  const handleSendClick = (e) => {
    if (!hasDate) {
      e.preventDefault();
      setTouched(true);
      return;
    }
    window.open(buildWhatsAppLink(), "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-6 sm:pb-4 animate-[lcs-fade-in_0.25s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-gradient-to-b from-white to-pink-50 rounded-3xl shadow-2xl border-2 border-pink-200 p-6 animate-[lcs-pop-in_0.35s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-pink-100 text-pink-500 active:scale-90 transition-transform"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center gap-1 mb-4">
          <span className="text-4xl">💌</span>
          <h2 className="text-2xl font-bold text-pink-600">Yeay, Fix Ya!</h2>
          <p className="text-sm text-pink-500/80">Pilih tanggal kencan kita berdua~</p>
        </div>

        <div className="rounded-2xl bg-white border border-pink-100 shadow-sm p-4 flex flex-col gap-3">
          {/* Input tanggal — ini yang dia isi sendiri */}
          <div>
            <label
              htmlFor="lcs-date-input"
              className="flex items-center gap-3 mb-2 text-left"
            >
              <span className="w-9 h-9 rounded-xl bg-pink-100 text-pink-500 flex items-center justify-center shrink-0">
                <Calendar size={16} />
              </span>
              <span className="text-[11px] uppercase tracking-wide text-pink-400 font-semibold">
                Pilih Tanggal Kencan
              </span>
            </label>
            <input
              id="lcs-date-input"
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]} // gak bisa pilih tanggal yang udah lewat
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setTouched(false);
              }}
              className={`w-full rounded-xl border-2 px-3 py-2 text-sm font-medium text-pink-800 focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                touched && !hasDate ? "border-red-300" : "border-pink-200"
              }`}
            />
            {touched && !hasDate && (
              <p className="mt-1 text-xs text-red-400">
                Tanggalnya diisi dulu dong, biar bisa dikirim ke WA 🥲
              </p>
            )}
            {hasDate && (
              <p className="mt-1 text-xs text-pink-500">📅 {prettyDate}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-purple-100 text-purple-500 flex items-center justify-center shrink-0">
              <Clock size={16} />
            </span>
            <div className="text-left">
              <p className="text-[11px] uppercase tracking-wide text-purple-400 font-semibold">
                Jam
              </p>
              <p className="text-sm font-medium text-purple-800">{time}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center shrink-0">
              <IceCream size={16} />
            </span>
            <div className="text-left">
              <p className="text-[11px] uppercase tracking-wide text-rose-400 font-semibold">
                Kegiatan
              </p>
              <p className="text-sm font-medium text-rose-800">{activity}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSendClick}
          className={`mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-full text-white font-semibold text-sm shadow-lg transition-transform ${
            hasDate ? "active:scale-95" : "opacity-60"
          }`}
          style={{ background: "linear-gradient(135deg,#25D366,#128C7E)" }}
        >
          <MessageCircle size={18} />
          Kirim Jawaban ke WhatsApp 💖
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   MAIN COMPONENT
============================================================================ */
export default function LoveConfirmationScreen() {
  const containerRef = useRef(null); // area tempat tombol TIDAK boleh bergerak
  const noButtonRef = useRef(null); // buat baca ukuran tombol TIDAK sendiri

  const [noPos, setNoPos] = useState(null); // null = posisi default (statis, belum digeser)
  const [taunt, setTaunt] = useState(null); // { text, top, left, key }
  const [dodgeCount, setDodgeCount] = useState(0);

  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const playBoing = usePlayBoing();

  // -------------------------------------------------------------------
  // Hitung posisi random buat tombol TIDAK, dibatasi supaya gak keluar
  // dari containerRef (biar gak "kabur" sampe luar layar / ke-cut).
  //
  // Caranya:
  // 1. Ambil ukuran container (getBoundingClientRect) -> containerRect
  // 2. Ambil ukuran tombol TIDAK sendiri -> buttonRect
  // 3. maxLeft = lebar container - lebar tombol
  //    maxTop  = tinggi container - tinggi tombol
  //    (ini batas kanan/bawah supaya tombol gak nge-overflow container)
  // 4. Random posisi dari 0 sampai batas maksimum tadi
  // -------------------------------------------------------------------
  const getRandomPosition = useCallback(() => {
    const container = containerRef.current;
    const button = noButtonRef.current;
    if (!container || !button) return { top: 0, left: 0 };

    const containerRect = container.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();

    // sedikit padding biar tombol gak nempel banget ke tepi container
    const padding = 8;

    const maxLeft = Math.max(containerRect.width - buttonRect.width - padding, padding);
    const maxTop = Math.max(containerRect.height - buttonRect.height - padding, padding);

    const randomLeft = padding + Math.random() * (maxLeft - padding);
    const randomTop = padding + Math.random() * (maxTop - padding);

    return { top: randomTop, left: randomLeft };
  }, []);

  const showTauntNear = useCallback((pos) => {
    const text = CONFIG.taunts[Math.floor(Math.random() * CONFIG.taunts.length)];
    setTaunt({
      text,
      top: pos.top,
      left: pos.left,
      key: Date.now(), // key unik biar animasi pop re-trigger tiap kali
    });
    window.setTimeout(() => setTaunt(null), 1100);
  }, []);

  // Dipanggil setiap kali dia coba "deketin" tombol TIDAK
  // (hover di desktop, atau coba tap/touch di HP).
  const evadeNoButton = useCallback(() => {
    const newPos = getRandomPosition();
    setNoPos(newPos);
    setDodgeCount((c) => c + 1);
    showTauntNear(newPos);
    playBoing();
  }, [getRandomPosition, showTauntNear, playBoing]);

  // Kalau ternyata jarinya lebih cepat dari animasi dan berhasil "klik",
  // tetap jangan diproses sebagai jawaban TIDAK — cuma gerakin lagi.
  const handleNoAttempt = useCallback(
    (e) => {
      e.preventDefault();
      evadeNoButton();
    },
    [evadeNoButton]
  );

  const handleYes = () => {
    playBoing();
    const emojis = ["💖", "💕", "🎉", "✨", "😍", "💗", "🥰"];
    const pieces = Array.from({ length: 46 }).map((_, i) => ({
      id: `${Date.now()}-${i}`,
      left: Math.random() * 100,
      size: 16 + Math.random() * 22,
      duration: 2 + Math.random() * 1.8,
      delay: Math.random() * 0.5,
      drift: Math.random() * 120 - 60,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setConfettiPieces(pieces);
    setShowConfetti(true);
    // kasih jeda dikit biar confetti sempat "mulai" duluan sebelum modal nutupin layar
    window.setTimeout(() => setShowModal(true), 350);
    window.setTimeout(() => setShowConfetti(false), 3200);
  };

  // Reset posisi tombol TIDAK kalau ukuran layar berubah (rotate HP dll),
  // biar gak nyangkut di posisi yang sekarang udah di luar container baru.
  useEffect(() => {
    const handleResize = () => {
      if (noPos) setNoPos(getRandomPosition());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden flex items-center justify-center px-5 py-10"
      style={{ background: "linear-gradient(180deg,#FFF0F6 0%,#F3E8FF 100%)" }}
    >
      {/* keyframes + kelas custom, self-contained biar file ini bisa langsung ditempel di project manapun */}
      <style>{`
        @keyframes lcs-confetti-fall {
          0%   { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          100% { transform: translateY(110vh) translateX(var(--drift)) rotate(50deg); opacity: 0; }
        }
        @keyframes lcs-pop-text {
          0%   { opacity: 0; transform: translateY(6px) scale(0.8); }
          20%  { opacity: 1; transform: translateY(-4px) scale(1.05); }
          80%  { opacity: 1; transform: translateY(-10px) scale(1); }
          100% { opacity: 0; transform: translateY(-18px) scale(0.9); }
        }
        @keyframes lcs-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lcs-pop-in {
          0%   { opacity: 0; transform: scale(0.85) translateY(12px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes lcs-pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(244,63,94,0.45); }
          50%      { box-shadow: 0 0 0 14px rgba(244,63,94,0); }
        }
        .lcs-yes-pulse { animation: lcs-pulse-glow 1.8s ease-out infinite; }
      `}</style>

      {showConfetti && <ConfettiBurst pieces={confettiPieces} />}
      {showModal && <DateInviteModal onClose={() => setShowModal(false)} />}

      <div className="w-full max-w-sm">
        {/* Kartu pertanyaan */}
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-pink-100 p-6 sm:p-8 text-center">
          <span className="text-4xl">🥺</span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-pink-600 leading-snug">
            {CONFIG.question}
          </h1>
          <p className="mt-2 text-sm text-pink-500/70">{CONFIG.subtitle}</p>

          {/*
            containerRef = "arena" tempat tombol TIDAK boleh berkeliaran.
            Tingginya dikunci (h-56) supaya ada cukup ruang buat kabur di
            layar HP yang sempit, tapi tetap gak bikin halaman jadi panjang.
          */}
          <div ref={containerRef} className="relative mt-6 h-56 sm:h-64">
            {/* Tombol IYA — statis, di tengah, pulsing & mengundang */}
            <button
              onClick={handleYes}
              className="lcs-yes-pulse absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg shadow-lg active:scale-90 transition-transform duration-150 z-10"
              style={{ background: "linear-gradient(135deg,#FB7185,#F472B6)" }}
            >
              <Heart size={20} fill="currentColor" />
              IYA
            </button>

            {/* Tombol TIDAK — kabur tiap didekatin/ditap */}
            <button
              ref={noButtonRef}
              onMouseEnter={evadeNoButton} // desktop: kabur begitu kursor mendekat
              onTouchStart={handleNoAttempt} // mobile: kabur begitu disentuh
              onClick={handleNoAttempt} // jaga-jaga kalau tap-nya kejar posisi lama
              className="absolute px-6 py-3 rounded-full bg-white border-2 border-pink-200 text-pink-400 font-semibold text-sm shadow-md transition-all duration-300 ease-out"
              style={
                noPos
                  ? { top: `${noPos.top}px`, left: `${noPos.left}px` }
                  : // posisi awal: statis di bawah tombol IYA, belum pernah digeser
                    { top: "78%", left: "50%", transform: "translate(-50%, -50%)" }
              }
            >
              TIDAK
            </button>

            {/* Teks jahil yang muncul deket tombol TIDAK tiap kali gagal diklik */}
            {taunt && (
              <span
                key={taunt.key}
                className="absolute text-xs font-semibold text-purple-500 bg-white/90 px-2 py-1 rounded-full shadow whitespace-nowrap pointer-events-none"
                style={{
                  top: `${taunt.top - 26}px`,
                  left: `${taunt.left}px`,
                  animation: "lcs-pop-text 1.1s ease-out forwards",
                }}
              >
                {taunt.text}
              </span>
            )}
          </div>

          {dodgeCount >= 5 && !showModal && (
            <p className="mt-2 text-xs text-purple-400 italic">
              *udah nyoba {dodgeCount}x, nyerah aja gih 😆*
            </p>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-pink-400/70 flex items-center justify-center gap-1">
          <PartyPopper size={12} /> psst, tombol IYA-nya beneran gabisa gagal kok
        </p>
      </div>
    </div>
  );
}
