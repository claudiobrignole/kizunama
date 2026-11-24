import { Fragment } from 'react';
import { readKatakana } from '../utils/katakanaReading';

export function Furigana({ katakana, className = 'kz-furigana' }: { katakana: string; className?: string }) {
  const { pieces } = readKatakana(katakana);
  return (
    <ruby className={className} lang="ja">
      {pieces.map((piece, index) => (
        <Fragment key={`${piece.kana}-${index}`}>
          {piece.kana}
          <rt>{piece.reading}</rt>
        </Fragment>
      ))}
    </ruby>
  );
}
