import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const API_KEY = process.env.KOREAN_DICT_API_KEY?.trim();
const API_BASE = 'https://stdict.korean.go.kr/api';

function requireApiKey() {
  if (!API_KEY) throw new Error('KOREAN_DICT_API_KEY 환경변수가 없습니다. 표준국어대사전 Open API 키를 설정해 주세요.');
  return API_KEY;
}

function asList(value) { return value == null ? [] : Array.isArray(value) ? value : [value]; }
function valueText(value) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
  if (typeof value === 'object' && '#text' in value) return String(value['#text'] ?? '').trim();
  return '';
}

async function callDictionary(endpoint, params) {
  const url = new URL(`${API_BASE}/${endpoint}`);
  url.searchParams.set('key', requireApiKey());
  url.searchParams.set('req_type', 'json');
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`표준국어대사전 API HTTP 오류: ${response.status}`);
  const payload = await response.json();
  if (payload?.error) {
    const code = valueText(payload.error.error_code ?? payload.error.errorCode);
    const message = valueText(payload.error.message) || '알 수 없는 API 오류';
    throw new Error(`표준국어대사전 API 오류${code ? ` ${code}` : ''}: ${message}`);
  }
  return payload?.channel ?? payload;
}

function normalizeSearchItem(item) {
  const senses = asList(item?.sense).map((sense) => ({
    number: valueText(sense?.sense_no),
    definition: valueText(sense?.definition),
    partOfSpeech: valueText(sense?.pos) || valueText(item?.pos),
    category: valueText(sense?.cat),
    origin: valueText(sense?.origin) || valueText(item?.origin),
    link: valueText(sense?.link) || valueText(item?.link),
  })).filter((sense) => sense.definition || sense.number);
  return {
    targetCode: valueText(item?.target_code),
    word: valueText(item?.word),
    homonymNumber: valueText(item?.sup_no),
    partOfSpeech: valueText(item?.pos),
    senses,
  };
}

function normalizeDetailedEntry(channel) {
  return asList(channel?.item).map((item) => {
    const wordInfo = item?.word_info ?? {};
    const posInfos = asList(item?.pos_info);
    const senses = [];
    for (const posInfo of posInfos) for (const patternInfo of asList(posInfo?.comm_pattern_info)) {
      for (const sense of asList(patternInfo?.sense_info)) senses.push({
        number: valueText(sense?.sense_no),
        partOfSpeech: valueText(posInfo?.pos),
        definition: valueText(sense?.definition),
        category: valueText(sense?.type),
        fields: asList(sense?.cat_info).map((x) => valueText(x?.cat)).filter(Boolean),
        examples: asList(sense?.example_info).map((x) => valueText(x?.example)).filter(Boolean),
        translations: asList(sense?.translation_info).map((x) => ({
          translation: valueText(x?.translation), language: valueText(x?.language_type),
        })).filter((x) => x.translation),
      });
    }
    const targetCode = valueText(item?.target_code);
    return {
      targetCode,
      word: valueText(wordInfo?.word),
      wordUnit: valueText(wordInfo?.word_unit),
      wordType: valueText(wordInfo?.word_type),
      origin: valueText(wordInfo?.origin),
      pronunciations: asList(wordInfo?.pronunciation_info).map((x) => valueText(x?.pronunciation)).filter(Boolean),
      partsOfSpeech: posInfos.map((x) => valueText(x?.pos)).filter(Boolean),
      senses,
      sourceUrl: `https://stdict.korean.go.kr/search/searchView.do?word_no=${encodeURIComponent(targetCode)}`,
    };
  });
}

const server = new McpServer({ name: 'stdict-mcp-server', version: '0.1.0' });

server.tool('search_dictionary', '국립국어원 표준국어대사전에서 표제어와 뜻풀이를 검색합니다.', {
  query: z.string().min(1).max(100).describe('검색어'),
  method: z.enum(['exact', 'include', 'start', 'end', 'wildcard']).default('exact').describe('검색 방식'),
  count: z.number().int().min(10).max(100).default(10).describe('결과 개수'),
  start: z.number().int().min(1).max(1000).default(1).describe('검색 시작 번호'),
  partOfSpeech: z.array(z.number().int().min(0).max(15)).optional().describe('품사 코드 목록. 0은 전체, 1 명사, 5 동사, 6 형용사'),
}, async ({ query, method, count, start, partOfSpeech }) => {
  const channel = await callDictionary('search.do', {
    q: query, method, num: count, start,
    ...(partOfSpeech?.length ? { advanced: 'y', pos: partOfSpeech.join(',') } : {}),
  });
  const entries = asList(channel?.item).map(normalizeSearchItem);
  return { content: [{ type: 'text', text: JSON.stringify({
    query, total: Number(channel?.total ?? 0), start: Number(channel?.start ?? start),
    count: entries.length, entries, source: '국립국어원 표준국어대사전 Open API',
  }, null, 2) }] };
});

server.tool('get_dictionary_entry', '표제어나 검색 결과의 targetCode로 상세 뜻풀이, 품사, 용례를 조회합니다.', {
  query: z.string().min(1).max(100).describe('표제어나 검색 결과의 targetCode'),
  lookupBy: z.enum(['word', 'target_code']).default('word').describe('표제어 또는 targetCode로 조회'),
}, async ({ query, lookupBy }) => {
  const channel = await callDictionary('view.do', {
    method: lookupBy === 'target_code' ? 'target_code' : 'word_info', q: query,
  });
  const entries = normalizeDetailedEntry(channel);
  return { content: [{ type: 'text', text: JSON.stringify({
    query, count: entries.length, entries, source: '국립국어원 표준국어대사전 Open API',
  }, null, 2) }] };
});

await server.connect(new StdioServerTransport());

