'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useLanguage } from './language';

type Message = { id: string; role: 'user' | 'assistant'; content: string };

export function AdmissionAssistant({ programId, nextStage }: { programId: string; nextStage: string }) {
  const { locale } = useLanguage();
  const labels = {
    ru: { title: 'Спроси о следующем шаге', eyebrow: 'ПОМОЩЬ ПО ТВОЕМУ ПЛАНУ', intro: 'Помощник видит ответы анкеты, выбранную программу и отмеченные этапы.', focus: 'Сейчас в фокусе', begin: 'Как начать ↗', example: 'Например: «Какие требования мне уточнить?» или «Как подготовиться к этому этапу?»', placeholder: 'Что мне делать дальше?', ask: 'Спросить ↗', thinking: 'Отвечаю…', you: 'Ты', assistant: 'Помощник', guide: 'Сейчас помощник отвечает по правилам плана. ', disclaimer: 'Перед подачей сверяй сроки и требования на официальном сайте вуза.', loadError: 'Не удалось загрузить переписку.', unavailable: 'Помощник временно недоступен.', limit: 'Слишком много вопросов. Попробуй через 10 минут.' },
    en: { title: 'Ask about your next step', eyebrow: 'HELP WITH YOUR PLAN', intro: 'The guide uses your profile, chosen program and completed stages.', focus: 'Current focus', begin: 'How do I start? ↗', example: 'For example: “Which requirements should I check?”', placeholder: 'What should I do next?', ask: 'Ask ↗', thinking: 'Thinking…', you: 'You', assistant: 'Guide', guide: 'The guide is currently using rule-based answers. ', disclaimer: 'Check dates and requirements on the university’s official website before applying.', loadError: 'Could not load the conversation.', unavailable: 'The guide is temporarily unavailable.', limit: 'Too many questions. Try again in 10 minutes.' },
    kk: { title: 'Келесі қадам туралы сұра', eyebrow: 'ЖОСПАРЫҢА КӨМЕК', intro: 'Көмекші бейініңді, таңдаған бағдарламаңды және аяқталған кезеңдерді ескереді.', focus: 'Қазіргі кезең', begin: 'Қалай бастаймын? ↗', example: 'Мысалы: «Қай талаптарды тексеруім керек?»', placeholder: 'Әрі қарай не істеуім керек?', ask: 'Сұрау ↗', thinking: 'Жауап іздеуде…', you: 'Сен', assistant: 'Көмекші', guide: 'Қазір көмекші ережелерге сүйеніп жауап береді. ', disclaimer: 'Өтініш берер алдында мерзімдер мен талаптарды университеттің ресми сайтынан тексер.', loadError: 'Хабарламаларды жүктеу мүмкін болмады.', unavailable: 'Көмекші уақытша қолжетімсіз.', limit: 'Сұрақтар тым көп. 10 минуттан кейін қайталап көр.' },
  }[locale];
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [guideMode, setGuideMode] = useState(false);

  useEffect(() => {
    let active = true;
    void fetch('/api/assistant', { credentials: 'include' })
      .then(async response => response.ok ? await response.json() as { messages: Message[] } : { messages: [] })
      .then(data => { if (active) setMessages(data.messages); })
      .catch(() => { if (active) setError(labels.loadError); });
    return () => { active = false; };
  }, [programId, labels.loadError]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = question.trim();
    if (!text || loading) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, locale }),
      });
      const result = await response.json() as { answer?: string; error?: string; mode?: string };
      if (!response.ok || !result.answer) throw new Error(response.status === 429 ? labels.limit : labels.unavailable);
      setGuideMode(result.mode === 'guide');
      setMessages(current => [...current,
        { id: `user-${Date.now()}`, role: 'user', content: text },
        { id: `assistant-${Date.now()}`, role: 'assistant', content: result.answer! },
      ]);
      setQuestion('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : labels.unavailable);
    } finally {
      setLoading(false);
    }
  }

  return <section className="admission-assistant" aria-label={labels.title}>
    <div className="assistant-heading"><span className="assistant-mark" aria-hidden="true">✦</span><div><span className="eyebrow">{labels.eyebrow}</span><h2>{labels.title}</h2><p>{labels.intro}</p></div></div>
    <div className="assistant-suggestion"><span>{labels.focus}</span><strong>{nextStage}</strong><button type="button" onClick={() => setQuestion(locale === 'en' ? `Help me start the stage “${nextStage}”. What should I do first?` : locale === 'kk' ? `«${nextStage}» кезеңін қалай бастаймын? Алдымен не істеймін?` : `Помоги мне начать этап «${nextStage}». Что сделать первым?`)}>{labels.begin}</button></div>
    <div className="assistant-messages" role="log" aria-live="polite">
      {messages.length === 0 && <p className="assistant-empty">{labels.example}</p>}
      {messages.map(message => <div key={message.id} className={`assistant-message ${message.role}`}><span>{message.role === 'user' ? labels.you : labels.assistant}</span><p>{message.content}</p></div>)}
    </div>
    <form className="assistant-form" onSubmit={send}><label htmlFor="assistant-question" className="sr-only">{labels.title}</label><input id="assistant-question" value={question} onChange={event => setQuestion(event.target.value)} maxLength={1000} placeholder={labels.placeholder} disabled={loading}/><button type="submit" className="button small" disabled={loading || !question.trim()}>{loading ? labels.thinking : labels.ask}</button></form>
    {error && <p className="assistant-error" role="alert">{error}</p>}
    <p className="assistant-disclaimer">{guideMode ? labels.guide : ''}{labels.disclaimer}</p>
  </section>;
}
