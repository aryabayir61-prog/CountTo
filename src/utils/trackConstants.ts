export interface SongTrack {
  id: string;
  name: string;
  artist: string;
  albumCover: string;
  colors: [string, string]; // Dynamic color mixing palette for ambient liquid glass
  youtubeId: string;
  durationSec: number;
  audioUrl?: string; // Direct fallback audio stream
}

export const PRESET_SONGS: SongTrack[] = [
  {
    id: 'hileli-manifest-ajda',
    name: 'Hileli',
    artist: 'manifest & Ajda Pekkan',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/79/75/10/79751090-3fc2-2d45-980a-1e9c0b6de57f/cover.jpg/600x600bb.jpg',
    colors: ['#dc2626', '#991b1b'],
    youtubeId: 'kXKhNI4DLHM',
    durationSec: 202,
  },
  {
    id: 'ajda-pekkan-arada',
    name: 'Arada Sırada',
    artist: 'Ajda Pekkan',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/4a/01/62/4a016259-22a3-f01e-7b70-1fc4200787a7/886443144880.jpg/600x600bb.jpg',
    colors: ['#4a0e4e', '#c026d3'],
    youtubeId: 'g2cT_Kz43m4',
    durationSec: 245,
  },
  {
    id: 'ajda-pekkan-yakar',
    name: 'Yakar Geçerim',
    artist: 'Ajda Pekkan',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/71/67/20/716720e7-3db1-a751-6efc-9745c117d337/886443144903.jpg/600x600bb.jpg',
    colors: ['#831843', '#f43f5e'],
    youtubeId: '9vU6B9qE1fA',
    durationSec: 218,
  },
  {
    id: 'tralala-manifest',
    name: 'Tralala',
    artist: 'Manifest',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/09/65/49/09654984-bdf6-05a1-d77c-745aef128688/cover.jpg/600x600bb.jpg',
    colors: ['#4a0e4e', '#c026d3'],
    youtubeId: '0rW7Fbm4S7g',
    durationSec: 180,
  },
  {
    id: 'toz-pembe-nalan',
    name: 'Toz Pembe',
    artist: 'Nalan',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/6b/c4/1b/6bc41bb6-2481-229b-e0f1-4dbcf4e72c5b/cover.jpg/600x600bb.jpg',
    colors: ['#831843', '#f43f5e'],
    youtubeId: '0pg0raFMNIU',
    durationSec: 236,
  },
  {
    id: 'birds-of-a-feather',
    name: 'Birds Of A Feather',
    artist: 'Billie Eilish',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/92/9f/69/929f69f1-9977-3a44-d674-11f70c852d1b/24UMGIM36186.rgb.jpg/600x600bb.jpg',
    colors: ['#0c2a5e', '#1d4ed8'],
    youtubeId: 'V9PVRfjEBTI',
    durationSec: 198,
  },
  {
    id: 'runaway-aurora',
    name: 'Runaway',
    artist: 'AURORA',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/b7/5f/76/b75f7659-c7ac-36d8-e01f-2f6d02f5ef34/5056167160632.jpg/600x600bb.jpg',
    colors: ['#0f3928', '#166534'],
    youtubeId: 'd_HlPboLRL8',
    durationSec: 252,
  },
  {
    id: 'as-it-was',
    name: 'As It Was',
    artist: 'Harry Styles',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2a/19/fb/2a19fb85-2f70-9e44-f2a9-82abe679b88e/886449990061.jpg/600x600bb.jpg',
    colors: ['#58200b', '#d97706'],
    youtubeId: 'H5v3kku4y6Q',
    durationSec: 167,
  },
  {
    id: 'askin-olayim',
    name: 'Aşkın Olayım',
    artist: 'Simge',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/5f/be/25/5fbe25a2-6307-005b-5faf-a967f0b62ba9/cover.jpg/600x600bb.jpg',
    colors: ['#4c0519', '#be123c'],
    youtubeId: 'VREnTCTeS4k',
    durationSec: 251,
  },
  {
    id: 'antidepresan-mert',
    name: 'Antidepresan',
    artist: 'Mert Demir, Mabel Matiz',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/cd/6a/fb/cd6afb23-3442-e7ab-3b39-46f458bcad40/196922249655_Cover.jpg/600x600bb.jpg',
    colors: ['#2e1065', '#7e22ce'],
    youtubeId: 'i6CSvLvSNZ4',
    durationSec: 232,
  },
  {
    id: 'fascist-cerpow',
    name: 'Fascist',
    artist: 'Cerpow',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/1e/02/d3/1e02d334-fa9c-5524-a80b-c1dc28735632/7caac8d3-814e-41ff-833b-189ead2ac233.jpg/600x600bb.jpg',
    colors: ['#7c2d12', '#ea580c'],
    youtubeId: 'KR7QDK4saas',
    durationSec: 162,
  },
];
