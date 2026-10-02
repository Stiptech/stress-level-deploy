"""Pertanyaan dan logika skor. Dipindah apa adanya dari QuestionPage.tsx dan ResultPage.tsx."""

PSS_QUESTIONS = [
    "Dalam 1 bulan terakhir, seberapa sering kamu merasa kewalahan karena hal tak terduga?",
    "Dalam 1 bulan terakhir, seberapa sering kamu merasa tidak mampu mengontrol hal penting dalam hidup?",
    "Dalam 1 bulan terakhir, seberapa sering kamu merasa gugup atau stres?",
    "Dalam 1 bulan terakhir, seberapa sering kamu merasa yakin atas kemampuan menghadapi masalah pribadi?",
    "Dalam 1 bulan terakhir, seberapa sering kamu merasa hal berjalan sesuai keinginanmu?",
    "Dalam 1 bulan terakhir, seberapa sering kamu merasa tidak mampu mengatasi semua hal yang harus dilakukan?",
    "Dalam 1 bulan terakhir, seberapa sering kamu mampu mengontrol gangguan dalam hidup?",
    "Dalam 1 bulan terakhir, seberapa sering kamu merasa berada di puncak situasi?",
    "Dalam 1 bulan terakhir, seberapa sering kamu marah karena hal di luar kendalimu?",
    "Dalam 1 bulan terakhir, seberapa sering kamu merasa kesulitan menavigasi semua hal?",
]

GAD_QUESTIONS = [
    "Merasa gugup, cemas, atau gelisah",
    "Tidak dapat berhenti atau mengontrol kekhawatiran",
    "Terlalu khawatir tentang banyak hal",
    "Sulit rileks",
    "Gelisah sehingga sulit diam",
    "Mudah kesal atau mudah marah",
    "Takut sesuatu buruk akan terjadi",
]

PHQ_QUESTIONS = [
    "Sedikit minat atau kesenangan dalam melakukan hal",
    "Merasa sedih, murung, atau putus asa",
    "Sulit tidur, sering terbangun, atau tidur berlebihan",
    "Merasa lelah atau kurang energi",
    "Nafsu makan buruk atau makan berlebihan",
    "Merasa buruk tentang diri sendiri, menganggap diri gagal",
    "Sulit fokus pada hal, seperti membaca atau menonton TV",
    "Bergerak atau berbicara sangat lambat atau sebaliknya jadi gelisah",
    "Pikiran menyakiti diri atau lebih baik mati",
]

# Index = nilai skor
PSS_SCALE = ["Tidak Pernah", "Hampir Tidak Pernah", "Kadang-kadang", "Cukup Sering", "Sangat Sering"]
GAD_PHQ_SCALE = ["Tidak Sama Sekali", "Beberapa Hari", "Lebih dari Setengah Hari", "Hampir Setiap Hari"]

N_PSS, N_GAD, N_PHQ = len(PSS_QUESTIONS), len(GAD_QUESTIONS), len(PHQ_QUESTIONS)
TOTAL = N_PSS + N_GAD + N_PHQ  # 26

# Item PSS-10 yang dibalik skornya (0-indexed: 4, 5, 7, 8 versi 1-indexed)
PSS_REVERSE = {3, 4, 6, 7}


def section_for(i: int) -> dict:
    """Info seksi untuk pertanyaan ke-i (0-indexed)."""
    if i < N_PSS:
        return dict(section="PSS-10", desc="Perceived Stress Scale (Periode 1 bulan terakhir)",
                    question=PSS_QUESTIONS[i], scale=PSS_SCALE, n=i + 1, total=N_PSS)
    if i < N_PSS + N_GAD:
        j = i - N_PSS
        return dict(section="GAD-7", desc="Generalized Anxiety Disorder (Periode 2 minggu terakhir)",
                    question=GAD_QUESTIONS[j], scale=GAD_PHQ_SCALE, n=j + 1, total=N_GAD)
    j = i - N_PSS - N_GAD
    return dict(section="PHQ-9", desc="Patient Health Questionnaire (Periode 2 minggu terakhir)",
                question=PHQ_QUESTIONS[j], scale=GAD_PHQ_SCALE, n=j + 1, total=N_PHQ)


def pss_score(answers: list[int]) -> int:
    return sum(4 - a if i in PSS_REVERSE else a for i, a in enumerate(answers[:N_PSS]))


def pss_label(s: int) -> str:
    if s >= 27: return "High Perceived Stress"
    if s >= 14: return "Moderate Stress"
    return "Low Perceived Stress"


def gad_label(s: int) -> str:
    if s >= 15: return "Severe Anxiety"
    if s >= 10: return "Moderate Anxiety"
    if s >= 5: return "Mild Anxiety"
    return "Minimal Anxiety"


def phq_label(s: int) -> str:
    if s >= 20: return "Severe Depression"
    if s >= 15: return "Moderately Severe Depression"
    if s >= 10: return "Moderate Depression"
    if s >= 5: return "Mild Depression"
    return "No Depression"


def severity(domain: str, s: int) -> str:
    if domain == "stress":
        return "SEVERE" if s >= 27 else "MODERATE" if s >= 14 else "LIGHT"
    if domain == "anxiety":
        return "SEVERE" if s >= 15 else "MODERATE" if s >= 10 else "LIGHT" if s >= 5 else "NONE"
    return "SEVERE" if s >= 20 else "MODERATE" if s >= 10 else "LIGHT" if s >= 5 else "NONE"


RANK = {"NONE": 0, "LIGHT": 1, "MODERATE": 2, "SEVERE": 3}


def evaluate(answers: list[int]) -> dict:
    pss = pss_score(answers)
    gad = sum(answers[N_PSS:N_PSS + N_GAD])
    phq = sum(answers[N_PSS + N_GAD:])
    sev = {"STRESS": severity("stress", pss),
           "ANXIETY": severity("anxiety", gad),
           "DEPRESSION": severity("depression", phq)}
    # max() mengembalikan elemen pertama saat seri, sama seperti reduce di versi React
    primary = max(sev.items(), key=lambda kv: RANK[kv[1]])
    return dict(
        pss=pss, gad=gad, phq=phq,
        pss_label=pss_label(pss), gad_label=gad_label(gad), phq_label=phq_label(phq),
        sev=sev, primary_name=primary[0], primary_sev=primary[1],
        self_harm_flag=answers[N_PSS + N_GAD + 8] > 0,  # PHQ-9 item 9
    )
