import { marked } from 'marked';

export function renderMarkdown(markdown: string) {
  return { __html: marked.parse(markdown) };
}
