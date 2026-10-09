import { marked } from 'marked'

// Obsah píše len admin (RLS), preto ho renderujeme ako dôveryhodný.
// Ak by sa v budúcnosti zobrazoval obsah od zákazníkov (recenzie), treba ho sanitizovať.
export const renderMarkdown = (md?: string | null) => (md ? (marked.parse(md, { async: false }) as string) : '')
