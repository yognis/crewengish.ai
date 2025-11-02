'use client';

import { motion } from 'framer-motion';
import { Clock, Target, Trophy } from 'lucide-react';

export default function ExamHeroCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="rounded-3xl bg-gradient-to-r from-thy-red to-thy-darkRed p-8 text-white shadow-xl"
    >
      <p className="text-sm uppercase tracking-[0.3em] text-white/70">CrewEnglish.ai</p>
      <h1 className="mt-3 text-3xl font-bold">5 Oturumlu Konusma Sınavı</h1>
      <p className="mt-4 max-w-xl text-white/85">
        5 farkli oturumda, THY standartlarina uygun gerçek mülakat deneyimi yasayin. Her
        oturum 5 soru ve kisisellestirilmis yapay zeka değerlendirmesi icerir.
      </p>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2">
          <Clock className="h-4 w-4" /> Her oturum ~5-10 dakika
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2">
          <Target className="h-4 w-4" /> Kisisellestirilmis geri bildirim
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2">
          <Trophy className="h-4 w-4" /> 5 kredi = 1 tam dongu
        </div>
      </div>
    </motion.div>
  );
}

