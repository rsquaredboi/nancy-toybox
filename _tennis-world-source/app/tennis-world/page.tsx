import type { Metadata } from 'next';
import MatchOff from './match-off';

export const metadata: Metadata = {
  title: 'LOVE ALL — The match is off. | Nancy',
  description: 'The net has fallen in love with the ball. Welcome to a Nancy tennis club. Pleasure is the point.',
  robots: { index: false, follow: false },
};

export default function TennisWorld() { return <MatchOff />; }
