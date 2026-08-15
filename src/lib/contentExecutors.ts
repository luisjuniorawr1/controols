'use client';

import Papa from 'papaparse';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { marked } from 'marked';
import TurndownService from 'turndown';
import YAML from 'yaml';

function parseCsv(input: string, delimiter?: string) {
  const result = Papa.parse<Record<string, string>>(input, {
    header: true,
    skipEmptyLines: true,
    ...(delimiter ? { delimiter } : {}),
  });
  if (result.errors.length) throw new Error(result.errors[0].message);
  return result.data;
}

function csv(data: Record<string, unknown>[], delimiter = ',') {
  return Papa.unparse(data, { delimiter });
}

function flatten(value: unknown, prefix = '', out: Record<string, unknown> = {}) {
  if (Array.isArray(value)) {
    value.forEach((item, i) => flatten(item, prefix ? `${prefix}.${i}` : String(i), out));
  } else if (value && typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, item]) =>
      flatten(item, prefix ? `${prefix}.${key}` : key, out),
    );
  } else {
    out[prefix] = value;
  }
  return out;
}

function unflatten(value: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const [path, raw] of Object.entries(value)) {
    const parts = path.split('.');
    let cursor: Record<string, unknown> = result;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) cursor[part] = raw;
      else {
        if (!cursor[part] || typeof cursor[part] !== 'object') cursor[part] = {};
        cursor = cursor[part] as Record<string, unknown>;
      }
    });
  }
  return result;
}

function markdownTable(rows: Record<string, unknown>[]) {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  const escape = (v: unknown) => String(v ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  return [
    `| ${keys.join(' | ')} |`,
    `| ${keys.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${keys.map((key) => escape(row[key])).join(' | ')} |`),
  ].join('\n');
}

function htmlTable(rows: Record<string, unknown>[]) {
  if (!rows.length) return '<table></table>';
  const keys = Object.keys(rows[0]);
  const esc = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<table>\n  <thead><tr>${keys.map((key) => `<th>${esc(key)}</th>`).join('')}</tr></thead>\n  <tbody>\n${rows.map((row) => `    <tr>${keys.map((key) => `<td>${esc(row[key])}</td>`).join('')}</tr>`).join('\n')}\n  </tbody>\n</table>`;
}

export async function runData(slug: string, input: string): Promise<string> {
  switch (slug) {
    case 'csv-to-json': return JSON.stringify(parseCsv(input), null, 2);
    case 'json-to-csv': {
      const value = JSON.parse(input);
      return csv(Array.isArray(value) ? value : [value]);
    }
    case 'csv-viewer': return JSON.stringify(parseCsv(input), null, 2);
    case 'csv-sorter': {
      const [column, body = ''] = input.split('|||');
      const rows = parseCsv(body);
      rows.sort((a, b) => String(a[column] ?? '').localeCompare(String(b[column] ?? ''), undefined, { numeric: true }));
      return csv(rows);
    }
    case 'csv-filter': {
      const [rule, body = ''] = input.split('|||');
      const [column, term = ''] = rule.split('=');
      return csv(parseCsv(body).filter((row) => String(row[column] ?? '').toLowerCase().includes(term.toLowerCase())));
    }
    case 'csv-remove-duplicates': {
      const [column, body = ''] = input.includes('|||') ? input.split('|||') : ['', input];
      const rows = parseCsv(body);
      const seen = new Set<string>();
      return csv(rows.filter((row) => {
        const key = column ? String(row[column] ?? '') : JSON.stringify(row);
        if (seen.has(key)) return false;
        seen.add(key); return true;
      }));
    }
    case 'csv-column-picker': {
      const [columns, body = ''] = input.split('|||');
      const names = columns.split(',').map((x) => x.trim()).filter(Boolean);
      return csv(parseCsv(body).map((row) => Object.fromEntries(names.map((name) => [name, row[name] ?? '']))));
    }
    case 'csv-column-renamer': {
      const [rule, body = ''] = input.split('|||');
      const [from, to] = rule.split('=').map((x) => x.trim());
      return csv(parseCsv(body).map((row) => {
        const copy: Record<string, unknown> = { ...row };
        if (from in copy) { copy[to] = copy[from]; delete copy[from]; }
        return copy;
      }));
    }
    case 'csv-delimiter-converter': {
      const [delimiters, body = ''] = input.split('|||');
      const [from = ',', to = ';'] = delimiters.split('=>');
      return csv(parseCsv(body, from), to);
    }
    case 'tsv-to-csv': return Papa.unparse(Papa.parse(input, { header: true, delimiter: '\t', skipEmptyLines: true }).data as Record<string, unknown>[]);
    case 'csv-to-tsv': return Papa.unparse(parseCsv(input), { delimiter: '\t' });
    case 'xml-to-json': return JSON.stringify(new XMLParser({ ignoreAttributes: false }).parse(input), null, 2);
    case 'json-to-xml': return new XMLBuilder({ ignoreAttributes: false, format: true }).build(JSON.parse(input));
    case 'yaml-to-json': return JSON.stringify(YAML.parse(input), null, 2);
    case 'json-to-yaml': return YAML.stringify(JSON.parse(input));
    case 'yaml-validator': YAML.parse(input); return 'Valid YAML ✓';
    case 'xml-formatter': {
      const parsed = new XMLParser({ ignoreAttributes: false }).parse(input);
      return new XMLBuilder({ ignoreAttributes: false, format: true }).build(parsed);
    }
    case 'xml-minifier': {
      const parsed = new XMLParser({ ignoreAttributes: false }).parse(input);
      return new XMLBuilder({ ignoreAttributes: false, format: false }).build(parsed);
    }
    case 'json-to-query-string': {
      const value = JSON.parse(input) as Record<string, unknown>;
      return new URLSearchParams(Object.entries(value).map(([k, v]) => [k, String(v ?? '')])).toString();
    }
    case 'query-string-to-json': return JSON.stringify(Object.fromEntries(new URLSearchParams(input.replace(/^\?/, ''))), null, 2);
    case 'json-flatten': return JSON.stringify(flatten(JSON.parse(input)), null, 2);
    case 'json-unflatten': return JSON.stringify(unflatten(JSON.parse(input)), null, 2);
    case 'json-key-extractor': {
      const result = flatten(JSON.parse(input));
      return Object.keys(result).join('\n');
    }
    case 'json-value-extractor': {
      const result = flatten(JSON.parse(input));
      return Object.values(result).map((v) => typeof v === 'string' ? v : JSON.stringify(v)).join('\n');
    }
    case 'data-table-to-markdown': {
      try { return markdownTable(parseCsv(input)); }
      catch { const value = JSON.parse(input); return markdownTable(Array.isArray(value) ? value : [value]); }
    }
  }
  return input;
}

function stripHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

function fields(input: string) {
  return Object.fromEntries(input.split(/\r?\n/).map((line) => {
    const i = line.indexOf(':');
    return i > -1 ? [line.slice(0, i).trim().toLowerCase(), line.slice(i + 1).trim()] : ['', ''];
  }).filter(([key]) => key));
}

export async function runDocument(slug: string, input: string): Promise<string> {
  const turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' });
  switch (slug) {
    case 'markdown-editor': return await marked.parse(input);
    case 'html-editor': return input;
    case 'plain-text-editor': return input;
    case 'markdown-to-text': return stripHtml(await marked.parse(input));
    case 'html-to-text': return stripHtml(input);
    case 'text-to-html': return input.split(/\n\s*\n/).map((p) => `<p>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>`).join('\n');
    case 'text-to-markdown': return input.split(/\n\s*\n/).join('\n\n');
    case 'markdown-table-generator': return markdownTable(parseCsv(input));
    case 'html-table-generator': return htmlTable(parseCsv(input));
    case 'resume-text-builder': {
      const f = fields(input);
      return `# ${f.name || 'Your Name'}\n${f.title || ''}\n\n## Contact\n${f.email || ''}${f.phone ? ` · ${f.phone}` : ''}\n\n## Summary\n${f.summary || ''}\n\n## Experience\n${f.experience || ''}\n\n## Education\n${f.education || ''}\n\n## Skills\n${f.skills || ''}`;
    }
    case 'invoice-text-builder': {
      const f = fields(input);
      return `INVOICE\n\nFrom: ${f.from || ''}\nTo: ${f.to || ''}\nDate: ${f.date || new Date().toISOString().slice(0,10)}\nInvoice: ${f.number || ''}\n\nItems: ${f.items || ''}\n\nSubtotal: ${f.subtotal || ''}\nTax: ${f.tax || ''}\nTOTAL: ${f.total || ''}\n\n${f.notes || ''}`;
    }
    case 'letter-text-builder': {
      const f = fields(input);
      return `${f.date || new Date().toLocaleDateString()}\n\n${f.to || 'Recipient'}\n\n${f.subject ? `Subject: ${f.subject}\n\n` : ''}${f.body || ''}\n\n${f.closing || 'Sincerely,'}\n${f.from || ''}`;
    }
    case 'meeting-notes-builder': {
      const f = fields(input);
      return `# ${f.title || 'Meeting Notes'}\n\n**Date:** ${f.date || new Date().toLocaleDateString()}  \n**Participants:** ${f.participants || ''}\n\n## Agenda\n${f.agenda || ''}\n\n## Notes\n${f.notes || ''}\n\n## Decisions\n${f.decisions || ''}\n\n## Action items\n${f.actions || ''}`;
    }
    case 'checklist-builder': return input.split(/\r?\n/).filter(Boolean).map((line) => `- [ ] ${line.replace(/^[-*]\s*/, '')}`).join('\n');
    case 'document-word-statistics': {
      const text = /<[^>]+>/.test(input) ? stripHtml(input) : input;
      const wordList = text.trim() ? text.trim().split(/\s+/) : [];
      return JSON.stringify({ words: wordList.length, characters: text.length, charactersWithoutSpaces: text.replace(/\s/g, '').length, lines: text ? text.split(/\r?\n/).length : 0, paragraphs: text.trim() ? text.trim().split(/\n\s*\n/).length : 0, estimatedReadingMinutes: Math.max(1, Math.ceil(wordList.length / 200)) }, null, 2);
    }
  }
  if (slug === 'html-to-markdown') return turndown.turndown(input);
  return input;
}
