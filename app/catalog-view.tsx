'use client';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { directions } from '../lib/admissions';
import { useLanguage } from './language';

export type CatalogProgram = {
  id: string;
  _id: string;
  title: string;
  university: string;
  country: string;
  city: string;
  degree: string;
  field: string;
  interest: string;
  subfield?: string;
  language: string;
  durationYears: number;
  tuition: {
    amount: number;
    currency: string;
    period: string;
    year: string;
    source: string;
    note?: string;
    annualRange?: { min: number; max: number; credits: number };
  } | null;
  english: {
    ielts: number | null;
    toefl: number | null;
    detail: string;
    source: string;
  };
  deadline: {
    date: string;
    label: string;
    intake: string;
    source: string;
  } | null;
  admissionNote: string;
  scholarshipNote: string;
  specialRequirement?: string;
  programUrl: string;
  admissionUrl: string;
  costUrl?: string;
  checkedOn: string;
  accent: 'plum' | 'sand' | 'sage';
  verified?: boolean;
  coverImage?: string;
  universityRankQS?: number;
  universityType?: 'public' | 'private';
};

type CatalogUniversity = { id: string; name: string; country: string; city: string; website: string; photo?: string; programCount: number };

export function CatalogView({
  compared,
  onPick,
  onCompare,
}: {
  compared: string[];
  onPick: (id: string) => void;
  onCompare: (id: string) => void;
}) {
  const { localize, locale, t } = useLanguage();
  const [programs, setPrograms] = useState<CatalogProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedField, setSelectedField] = useState('Все');
  const [selectedCountry, setSelectedCountry] = useState('Все');
  const [selectedProgram, setSelectedProgram] = useState<CatalogProgram | null>(null);
  const [universities, setUniversities] = useState<CatalogUniversity[]>([]);
  const [mode, setMode] = useState<'programs' | 'universities'>('programs');

  useEffect(() => {
    async function loadPrograms() {
      setLoading(true);
      try {
        const res = await fetch('/api/programs?limit=500');
        if (res.ok) {
          const data = (await res.json()) as { programs?: CatalogProgram[] };
          setPrograms(data.programs || []);
        }
      } catch (e) {
        console.error('Failed to load catalog programs', e);
      } finally {
        setLoading(false);
      }
    }
    void loadPrograms();
    void fetch('/api/universities').then(async response => response.ok ? await response.json() as { universities: CatalogUniversity[] } : { universities: [] }).then(data => setUniversities(data.universities)).catch(() => {});
  }, []);

  const countries = useMemo(() => {
    const set = new Set<string>();
    programs.forEach(p => {
      if (p.country) set.add(p.country);
    });
    return Array.from(set).sort();
  }, [programs]);

  const filtered = useMemo(() => {
    return programs.filter(p => {
      if (selectedField !== 'Все' && p.field !== selectedField) return false;
      if (selectedCountry !== 'Все' && p.country !== selectedCountry) return false;
      if (search) {
        const s = search.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(s);
        const matchUni = p.university.toLowerCase().includes(s);
        const matchCity = p.city?.toLowerCase().includes(s);
        const matchSub = p.subfield?.toLowerCase().includes(s);
        if (!matchTitle && !matchUni && !matchCity && !matchSub) return false;
      }
      return true;
    });
  }, [programs, selectedField, selectedCountry, search]);

  function formatMoney(amount: number, currency: string) {
    const symbolMap: Record<string, string> = { EUR: '€', USD: '$', PLN: 'zł', KRW: '₩', KZT: '₸', GBP: '£' };
    const sym = symbolMap[currency] || currency;
    return `${new Intl.NumberFormat(locale === 'kk' ? 'kk-KZ' : locale === 'en' ? 'en-GB' : 'ru-RU').format(amount)} ${sym}`;
  }

  function renderTuition(p: CatalogProgram) {
    if (!p.tuition) return t('Стоимость уточняется');
    if (p.tuition.annualRange) {
      return `${formatMoney(p.tuition.annualRange.min, p.tuition.currency)} – ${formatMoney(p.tuition.annualRange.max, p.tuition.currency)} / ${t('год')}`;
    }
    return `${formatMoney(p.tuition.amount, p.tuition.currency)} / ${t(p.tuition.period === 'semester' ? 'семестр' : 'год')}`;
  }

  function renderDuration(years: number) {
    if (locale === 'en') return `${years} ${years === 1 ? 'year' : 'years'}`;
    if (locale === 'kk') return `${years} жыл`;
    return `${years} ${years === 1 ? 'год' : years > 1 && years < 5 ? 'года' : 'лет'}`;
  }

  if (mode === 'universities') {
    const visibleUniversities = universities.filter(university => {
      const query = search.toLocaleLowerCase();
      return (selectedCountry === 'Все' || university.country === selectedCountry)
        && (!query || `${university.name} ${university.city} ${university.country}`.toLocaleLowerCase().includes(query));
    });
    return localize(<div className="container catalog-page university-directory">
      <div className="eyebrow">УНИВЕРСИТЕТЫ</div><h1>Найди свой университет.</h1>
      <p>Здесь перечислены вузы из нашей базы. Для некоторых программы и условия поступления ещё не добавлены.</p>
      <div className="catalog-mode-switch" role="group" aria-label="Раздел каталога"><button onClick={() => setMode('programs')}>Программы ({programs.length})</button><button className="active" aria-current="page">Университеты ({universities.length})</button></div>
      <div className="university-filters"><label>Поиск<input value={search} onChange={event => setSearch(event.target.value)} placeholder="Название, город или страна"/></label><label>Страна<select value={selectedCountry} onChange={event => setSelectedCountry(event.target.value)}><option value="Все">Все страны</option>{[...new Set(universities.map(university => university.country))].sort().map(country => <option key={country}>{country}</option>)}</select></label></div>
      <p className="university-count">Найдено: {visibleUniversities.length}</p>
      <div className="university-grid">{visibleUniversities.map(university => <article key={university.id} className="university-card"><div className={`catalog-card-visual ${university.photo ? 'with-photo' : ''}`}>{university.photo ? <Image src={university.photo} alt={`Кампус ${university.name}`} fill sizes="(max-width: 650px) 100vw, 33vw"/> : <span aria-hidden="true">{university.name.split(/\s+/).slice(0,2).map(word => word[0]).join('')}</span>}<small>{university.city} · {university.country}</small></div><div className="university-card-body"><h2>{university.name}</h2><p>{university.programCount ? `${university.programCount} программ в каталоге` : 'Программы пока не добавлены'}</p><a href={university.website} target="_blank" rel="noopener noreferrer">Официальный сайт ↗</a></div></article>)}</div>
    </div>);
  }

  return localize(
    <div className="container catalog-page" style={{ paddingTop: '32px', paddingBottom: '80px' }}>
      {/* Header section */}
      <div className="section-top" style={{ marginBottom: '32px' }}>
        <div>
          <div className="eyebrow"><span className="tiny-line" /> БАЗА УНИВЕРСИТЕТОВ И ПРОГРАММ</div>
          <h2>Каталог направлений.<br /><em>Найди свой вариант.</em></h2>
        </div>
        <p>
          Программы разных вузов с ориентировочными требованиями, стоимостью и сроками подачи. Уточняйте условия на официальных сайтах.
        </p>
      </div>

      <div className="catalog-mode-switch" role="group" aria-label="Раздел каталога"><button className="active" aria-current="page">Программы ({programs.length})</button><button onClick={() => setMode('universities')}>Университеты ({universities.length})</button></div>

      {/* Search & Filter Bar */}
      <div className="catalog-controls" style={{
        background: 'white',
        border: '1px solid var(--line)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 8px 30px #4e384e08'
      }}>
        <div className="catalog-control-grid">
          <div className="field" style={{ margin: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>Поиск по названию или вузу</span>
            <input
              type="text"
              placeholder="Например: Computer Science, Bocconi, Design..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ minHeight: '44px', padding: '10px 14px' }}
            />
          </div>

          <div className="field" style={{ margin: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>Страна</span>
            <select
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              style={{ minHeight: '44px' }}
            >
              <option value="Все">Все страны ({programs.length})</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="field" style={{ margin: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>Направление</span>
            <select
              value={selectedField}
              onChange={e => setSelectedField(e.target.value)}
              style={{ minHeight: '44px' }}
            >
              <option value="Все">Все направления</option>
              {directions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Direction quick chips */}
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '10px', fontWeight: 600 }}>
            Быстрый выбор направления:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              className={`wizard-chip ${selectedField === 'Все' ? 'is-active' : ''}`}
              onClick={() => setSelectedField('Все')}
              style={{ fontSize: '11px', padding: '6px 12px', minHeight: '32px' }}
            >
              Все ({programs.length})
            </button>
            {directions.map(d => {
              const count = programs.filter(p => p.field === d).length;
              return (
                <button
                  key={d}
                  type="button"
                  className={`wizard-chip ${selectedField === d ? 'is-active' : ''}`}
                  onClick={() => setSelectedField(d)}
                  style={{ fontSize: '11px', padding: '6px 12px', minHeight: '32px' }}
                >
                  {d} {count > 0 ? `(${count})` : ''}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Program count & status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
          Найдено: <strong>{filtered.length}</strong> {filtered.length === 1 ? 'программа' : filtered.length < 5 ? 'программы' : 'программ'}
        </span>
        {(selectedField !== 'Все' || selectedCountry !== 'Все' || search) && (
          <button
            className="text-button"
            onClick={() => { setSelectedField('Все'); setSelectedCountry('Все'); setSearch(''); }}
            style={{ fontSize: '12px', color: 'var(--plum)' }}
          >
            Сбросить фильтры ✕
          </button>
        )}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          <p>Загрузка каталога программ из базы данных...</p>
        </div>
      )}

      {/* Programs Grid */}
      {!loading && filtered.length === 0 && (
        <div className="empty-state" style={{ padding: '60px 20px', background: 'white', borderRadius: '16px', border: '1px solid var(--line)' }}>
          <h3>По вашему запросу ничего не найдено</h3>
          <p style={{ marginTop: '10px', color: 'var(--muted)' }}>
            Попробуйте изменить параметры поиска или выбрать другое направление.
          </p>
          <button
            className="button small"
            onClick={() => { setSelectedField('Все'); setSelectedCountry('Все'); setSearch(''); }}
            style={{ marginTop: '16px' }}
          >
            Показать все программы
          </button>
        </div>
      )}

      <div className="program-grid catalog-program-grid">
        {filtered.map(p => {
          const isCompared = compared.includes(p.id);
          return (
            <div
              key={p.id}
              className="program-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                border: '1px solid var(--line)',
                background: 'white',
                overflow: 'hidden',
                transition: 'box-shadow .2s, transform .2s',
              }}
            >
              {/* Card top badge & header */}
              <div className={`catalog-card-visual ${p.accent}${p.coverImage ? ' with-photo' : ''}`}>
                {p.coverImage && <Image src={p.coverImage} alt={`Кампус ${p.university}`} fill sizes="(max-width: 650px) 100vw, 33vw" />}
                {!p.coverImage && <span aria-hidden="true">{p.university.split(/\s+/).slice(0, 2).map(word => word[0]).join('')}</span>}
                <small>{p.city} · {p.country}</small>
              </div>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--line)', background: '#faf8f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <span className="pill" style={{ fontSize: '9px' }}>{p.field}</span>
                  {!p.verified && <span className="pill">Данные уточняются</span>}
                  {p.universityRankQS && (
                    <span style={{ fontSize: '10px', color: 'var(--plum)', fontWeight: 700, background: 'var(--wash)', padding: '3px 8px', borderRadius: '6px' }}>
                      QS #{p.universityRankQS}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '18px', marginTop: '12px', marginBottom: '4px', lineHeight: 1.25 }}>
                  {p.title}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>
                  🏛️ {p.university} · {p.city}, {p.country}
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', fontSize: '11px' }}>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block' }}>Обучение:</span>
                    <strong style={{ color: 'var(--ink)' }}>{renderTuition(p)}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block' }}>Дедлайн:</span>
                    <strong style={{ color: 'var(--plum)' }}>
                      {p.deadline ? `${p.deadline.date} (${p.deadline.label || p.deadline.intake})` : 'Уточняется'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block' }}>Язык / Длительность:</span>
                    <strong>{p.language} · {renderDuration(p.durationYears)}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block' }}>Английский:</span>
                    <strong>{p.english.ielts ? `IELTS ${p.english.ielts}` : p.english.toefl ? `TOEFL ${p.english.toefl}` : 'Требуется'}</strong>
                  </div>
                </div>

                <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                  {p.admissionNote}
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                  <button
                    className="button small"
                    onClick={() => onPick(p.id)}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Построить маршрут <span aria-hidden="true">↗</span>
                  </button>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="text-button"
                      onClick={() => setSelectedProgram(p)}
                      style={{ flex: 1, fontSize: '11px', justifyContent: 'center', background: '#f5f3f4', borderRadius: '8px' }}
                    >
                      Подробнее
                    </button>
                    <button
                      className="text-button"
                      onClick={() => onCompare(p.id)}
                      style={{
                        flex: 1,
                        fontSize: '11px',
                        justifyContent: 'center',
                        background: isCompared ? 'var(--wash)' : '#f5f3f4',
                        color: isCompared ? 'var(--plum)' : 'inherit',
                        fontWeight: isCompared ? 700 : 500,
                        borderRadius: '8px'
                      }}
                    >
                      {isCompared ? '✓ В сравнении' : '+ Сравнить'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Program Details Modal */}
      {selectedProgram && (
        <div className="modal-overlay" onClick={() => setSelectedProgram(null)}>
          <div
            className="modal-box"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', textAlign: 'left' }}
          >
            <button className="modal-close" onClick={() => setSelectedProgram(null)}>✕</button>

            <div className="pill" style={{ marginBottom: '8px' }}>{selectedProgram.field}</div>
            <h2 style={{ fontSize: '24px', lineHeight: 1.2, marginBottom: '6px' }}>{selectedProgram.title}</h2>
            <div style={{ fontSize: '13px', color: 'var(--plum)', fontWeight: 600, marginBottom: '20px' }}>
              {selectedProgram.university} — {selectedProgram.city}, {selectedProgram.country}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: 'var(--wash)', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '12px' }}>
              <div><strong>Степень:</strong> {selectedProgram.degree === 'bachelor' ? 'Бакалавриат' : selectedProgram.degree}</div>
              <div><strong>Срок:</strong> {renderDuration(selectedProgram.durationYears)}</div>
              <div><strong>Стоимость:</strong> {renderTuition(selectedProgram)}</div>
              <div><strong>Дедлайн:</strong> {selectedProgram.deadline?.date || 'По набору'}</div>
              <div><strong>IELTS:</strong> {selectedProgram.english.ielts ?? 'Не указан'}</div>
              <div><strong>TOEFL:</strong> {selectedProgram.english.toefl ?? 'Не указан'}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', marginBottom: '6px' }}>Требования к поступлению</h4>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
                {selectedProgram.admissionNote}
              </p>
              {selectedProgram.specialRequirement && (
                <p style={{ fontSize: '12px', color: '#915338', marginTop: '6px' }}>
                  ⚠️ {selectedProgram.specialRequirement}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', marginBottom: '6px' }}>Стипендии и финансирование</h4>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
                {selectedProgram.scholarshipNote}
              </p>
            </div>

            <div style={{ marginBottom: '24px', fontSize: '11px', color: 'var(--muted)' }}>
              {selectedProgram.verified ? `Проверено: ${selectedProgram.checkedOn}. Перед подачей перепроверь условия.` : 'Условия этой программы ещё не проверены. Сверь их с официальным сайтом университета.'}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                className="button"
                onClick={() => {
                  onPick(selectedProgram.id);
                  setSelectedProgram(null);
                }}
                style={{ flex: 1, minWidth: '180px' }}
              >
                Построить маршрут ↗
              </button>
              {selectedProgram.programUrl && (
                <a
                  href={selectedProgram.programUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="button light"
                  style={{ textDecoration: 'none' }}
                >
                  Сайт программы ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
