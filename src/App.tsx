import { useMemo, useState } from 'react';
import { TraitPicker } from './components/TraitPicker';
import { KanjiResults } from './components/KanjiResults';
import { HankoSeal } from './components/HankoSeal';
import { OrderHelper } from './components/OrderHelper';
import { NameKatakana } from './components/NameKatakana';
import { SiteFooter } from './components/SiteFooter';
import { InstallPrompt } from './components/InstallPrompt';
import { generateKanjiOptions } from './utils/kanjiMeaning';
import traitsData from './data/traits.json';
import kanjiConceptIndex from './data/kanjiConceptIndex.json';
import type { KanjiConceptIndex, Trait } from './types';

const traits = traitsData as Trait[];
const kanjiIndex = kanjiConceptIndex as KanjiConceptIndex;
const MAX_TRAITS = 3;

function App() {
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [selectedKanji, setSelectedKanji] = useState<string[] | null>(null);
  const [nameForOrder, setNameForOrder] = useState('');

  const kanjiOptions = useMemo(() => generateKanjiOptions(selectedTraits, kanjiIndex), [selectedTraits]);

  const toggleTrait = (id: string) => {
    setSelectedKanji(null);
    setSelectedTraits((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : prev.length < MAX_TRAITS ? [...prev, id] : prev,
    );
  };

  return (
    <div className="kz-app">
      <div className="kz-brand">
        <span className="kz-brand__glyph">絆名</span>
        <span className="kz-brand__name">Kizunama</span>
        <span className="kz-brand__tagline">Discover your Japanese Kanji name</span>
      </div>

      <div className="kz-container kz-section--kanji">
        <div className="kz-panel">
          <p className="kz-section-title">✨ Pick up to 3 traits</p>
          <TraitPicker traits={traits} selected={selectedTraits} onToggle={toggleTrait} maxSelected={MAX_TRAITS} />

          <div style={{ marginTop: '1.1rem' }}>
            <KanjiResults options={kanjiOptions} selectedChars={selectedKanji} onSelect={setSelectedKanji} />
          </div>

          {selectedKanji && (
            <>
              <HankoSeal chars={selectedKanji} />
              <input
                className="kz-input"
                style={{ marginTop: '0.9rem' }}
                type="text"
                placeholder="Your name in Roman letters (for the order helper)"
                value={nameForOrder}
                onChange={(e) => setNameForOrder(e.target.value)}
                maxLength={60}
              />
              <OrderHelper chars={selectedKanji} originalName={nameForOrder} />
            </>
          )}
        </div>
      </div>

      <div className="kz-container">
        <NameKatakana />
      </div>

      <SiteFooter />
      <InstallPrompt />
    </div>
  );
}

export default App;
