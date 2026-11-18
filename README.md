# 표준국어대사전 MCP 서버

국립국어원 표준국어대사전 Open API를 MCP 도구로 연결하는 Node.js 서버입니다. 로컬 프로그램에서는 stdio 방식으로, ChatGPT 웹 등 원격 MCP를 지원하는 서비스에서는 Cloudflare Workers 방식으로 사용할 수 있습니다.

## 제공 도구

- `search_dictionary`: 표제어·뜻풀이 검색. 일치, 포함, 시작, 끝, 와일드카드 검색과 품사 필터를 지원합니다.
- `get_dictionary_entry`: 표제어나 검색 결과의 `targetCode`로 상세 항목을 조회합니다.

동음이의어를 구분해 상세 조회하려면 검색 결과의 `targetCode`를 `lookupBy: "target_code"`와 함께 전달하세요.

## Cloudflare Workers에 배포하기

배포하면 PC가 꺼져 있어도 HTTPS 주소로 MCP 서버에 접속할 수 있습니다. 저장소의 `main` 브랜치에 변경사항을 올릴 때마다 Cloudflare가 자동으로 다시 배포합니다. 무료 Cloudflare 계정에서 시작할 수 있습니다. Cloudflare Workers 무료 요금제는 현재 하루 100,000회 요청 한도가 있습니다. 사용량과 요금제 조건은 Cloudflare 안내를 확인하세요.

### 각자 배포하는 방법

이 저장소는 공개되어 있어 누구나 코드를 내려받을 수 있습니다. 다만 저장소 소유자의 API 키나 Cloudflare 계정을 공유하는 방식은 아닙니다. 사용하는 사람마다 본인 계정과 본인 표준국어대사전 API 키로 배포해야 합니다.

1. [Cloudflare](https://dash.cloudflare.com/) 계정을 만들거나 로그인합니다.
2. [국립국어원 표준국어대사전 Open API](https://stdict.korean.go.kr/openapi/openApiInfo.do)에서 본인 API 인증 키를 발급받습니다.
3. GitHub에서 이 저장소를 Fork하거나 ZIP 파일로 내려받고 압축을 풉니다.
4. 컴퓨터에 Node.js 18 이상을 설치한 뒤, PowerShell 또는 터미널에서 저장소 폴더로 이동합니다.
5. `wrangler.jsonc` 파일의 `name` 값을 Cloudflare에서 사용할 Worker 이름과 같게 바꿉니다. 현재 공개 저장소 값은 예시용입니다. 예를 들어 이름을 `stdict-mcp-server`로 정했다면 `wrangler.jsonc`에도 같은 값을 적습니다. 두 이름이 다르면 Cloudflare 자동 배포가 실패합니다.
6. 아래 명령을 순서대로 실행합니다.

```bash
npm install
npx wrangler login
npx wrangler secret put KOREAN_DICT_API_KEY
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
npx wrangler secret put MCP_PATH_TOKEN
npm run deploy:cloudflare
```

7. `KOREAN_DICT_API_KEY` 입력 프롬프트에는 발급받은 API 키를 입력합니다. `MCP_PATH_TOKEN` 입력 프롬프트에는 바로 앞에서 생성한 임의 문자열을 입력합니다. 두 값은 화면에 표시되지 않으며 저장소나 코드에 적지 마세요.
8. 배포가 완료되면 Wrangler가 표시하는 `workers.dev` 주소에 `/mcp/`와 저장한 `MCP_PATH_TOKEN` 값을 이어 붙여 MCP 주소로 사용합니다. 예: `https://내-worker.내계정.workers.dev/mcp/생성한토큰`

### ChatGPT 웹에 연결하기

1. ChatGPT 웹에서 **플러그인(Plugins)** 메뉴를 엽니다.
2. **+ → 맞춤 MCP 서버 추가(Add custom MCP server)**를 선택합니다.
3. 서버 주소에 본인의 Cloudflare MCP 주소(`https://...workers.dev/mcp/생성한토큰`)를 입력합니다.
4. 이 구현은 OAuth나 별도 인증 헤더 대신 URL의 비밀 토큰으로 접근을 제한하므로, ChatGPT의 인증 방식은 **인증 없음(No authentication)**으로 선택합니다. 조회 전용이라는 이유로 인증이 불필요한 것은 아닙니다.
5. 연결을 만들고 도구 목록에 `search_dictionary`, `get_dictionary_entry`가 표시되는지 확인합니다.

ChatGPT의 맞춤 MCP 기능은 계정 및 요금제, 워크스페이스 설정에 따라 달라질 수 있습니다. OpenAI 안내 기준으로 맞춤 MCP 연결은 웹에서 제공되며 모바일에서는 연결할 수 없습니다. 최신 지원 여부는 [OpenAI 안내](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt)를 확인하세요.


## 연결 오류 해결 및 검증 기록

2026-11-19 Cloudflare 배포 후 MCP 초기화와 도구 목록 응답을 직접 확인했고, ChatGPT에서 플러그인 등록 성공을 확인했습니다. 아래 수정은 현재 `main` 코드에 반영되어 있습니다. 이 기록은 연결·등록 검증이며, 사전 API의 모든 검색 조건과 상세 조회 결과를 검증했다는 뜻은 아닙니다.

### 실제 발생했던 오류

| 증상 | 확인한 원인 / 판단 | 반영한 해결 방법 |
| --- | --- | --- |
| “MCP 엔드포인트를 찾지 못했습니다” | Worker는 토큰 경로를 허용하지만 MCP 핸들러의 기본 경로는 `/mcp`여서 경로가 불일치했습니다. | `createMcpHandler`에 `route: url.pathname`을 전달합니다. 주소는 반드시 `/mcp/<본인의 MCP_PATH_TOKEN>`까지 입력합니다. |
| “앱을 만드는 데 필요한 서비스를 일시적으로 사용할 수 없습니다” | 이번 사례에서는 ChatGPT의 요청이 Worker에 도착했고, 실제 HTTP 응답은 500이었습니다. 이 문구만으로 OpenAI 장애나 계정 문제라고 판단할 수 없습니다. | MCP SDK v2에 맞게 Zod 4 입력 형식을 사용하도록 수정했습니다. |
| “서버가 MCP 설정을 완료하지 못했습니다” | HTTP 200이어도 도구 목록 응답 안에 JSON-RPC 오류가 있었습니다. 실제 메시지는 `[toJSONSchema]: Non-representable type encountered: string`이었습니다. | Zod 3 패키지에 포함된 초기 v4 대신, 독립된 `zod: ^4.2.0`과 `zod/v4` import를 사용합니다. |

Cloudflare용 코드의 주요 조합은 `@modelcontextprotocol/server: 2.4.0`, `agents: ^0.33.0`, `zod: ^4.2.0`입니다. 버전 범위가 허용하는 후속 버전까지 모두 검증한 것은 아닙니다. 의존성을 변경하면 초기화와 도구 목록 반환을 다시 확인하세요.

### Cloudflare에서 실제 요청 확인하기

1. Cloudflare 대시보드에서 **Workers & Pages → 본인의 Worker → Observability → Live**를 엽니다.
2. **Begin log stream**을 누릅니다. `Listening for events...`가 표시되면 수신 준비가 된 것입니다.
3. 해당 탭을 열어 둔 채 ChatGPT에서 연결을 시도합니다.
4. 새 요청 행을 펼쳐 `event.response.status`, `exceptions`, `logs`를 확인합니다. 클라이언트에 따라 `initialize` 또는 `server/discover`, 이어서 `tools/list` 요청이 나타날 수 있습니다.
5. 저장형 Observability가 꺼져 있어도 이번 사례에서는 **Live** 실시간 로그를 사용할 수 있었습니다. 이전 요청이 없다고 판단하기 전에 로그 수신이 시작됐는지 확인하세요.

**로그의 `outcome: ok`는 HTTP 성공이나 MCP 연결 성공을 뜻하지 않습니다.** 실행이 예외 없이 종료되더라도 HTTP 500을 반환할 수 있습니다. 또한 HTTP 200 안에 JSON-RPC `error`가 들어 있을 수 있으므로, 상태 코드만으로 검증을 마치지 마세요.

현재 Worker는 핸들러 오류를 `MCP handler error:`로 기록하고, 알고 있는 API 키와 경로 토큰은 해당 오류 메시지에서 가립니다. 다만 모든 오류가 이 콜백에 기록되는 것은 아니므로, 로그가 비어 있어도 MCP 응답 본문 확인이 필요할 수 있습니다. 로그를 공개할 때는 URL 토큰 등 민감한 값이 남아 있지 않은지 별도로 확인하세요.

### 연결 성공 판단 기준

- 루트 주소 `/`의 안내 문구는 서버가 실행된다는 확인일 뿐 MCP 검증이 아닙니다.
- MCP 주소를 브라우저로 열 때 나타나는 `Method not allowed`는 GET 요청에 대한 응답입니다. 이 결과만으로 연결 성공·실패를 판단하지 않습니다.
- MCP 초기화 또는 서버 정보 확인이 성공하고, `tools/list` 응답의 `result.tools`에 `search_dictionary`와 `get_dictionary_entry`가 오류 없이 포함되어야 합니다.
- ChatGPT에서 플러그인을 생성한 뒤 실제 단어 검색과 상세 조회도 실행해 API 키와 사전 API 응답을 확인하세요.
- 문제 진단 중 사용했던 임시 `/diagnostics` 경로는 검증 후 코드에서 제거했습니다. 현재 배포의 정식 기능이 아닙니다.

### 기존 배포를 수정본으로 업데이트하기

Fork를 사용한다면 먼저 GitHub에서 원본 저장소의 최신 `main` 변경사항을 동기화하세요. 원본 저장소가 수정돼도 다른 사용자의 Fork가 자동으로 갱신되는 것은 아닙니다.

로컬에서 배포한다면 최신 코드를 받은 뒤 `npm install`과 `npm run deploy:cloudflare`를 실행합니다. Cloudflare의 Git 연동 배포라면 연결된 저장소에 변경을 반영한 후 해당 커밋의 배포가 **Ready**이고 실제로 적용됐는지 확인하세요. API 키와 경로 토큰은 기존 Secret을 유지할 수 있습니다.

### 보안과 사용량

- API 키는 각자의 Cloudflare Worker Secret에 저장되며 코드나 GitHub 저장소에 포함되지 않습니다.
- MCP 주소에는 `MCP_PATH_TOKEN`이 포함되므로, 주소를 아는 사람은 Worker에 요청할 수 있습니다. 주소를 공개적으로 공유하지 마세요. 다른 사람이 호출하면 본인의 사전 API 사용량이 소진될 수 있습니다.
- 이 공개 저장소는 소스 코드만 제공합니다. 다른 사용자는 본인 API 키로 별도의 Worker를 배포해야 합니다.
- Cloudflare Workers 무료 요금제의 한도 및 조건은 바뀔 수 있습니다. 최신 내용은 [Workers 요금제 한도](https://developers.cloudflare.com/workers/platform/limits/)를 확인하세요.

## 로컬 MCP 서버로 실행하기

### 준비물

- Node.js 18 이상
- 표준국어대사전 Open API 인증 키

```bash
npm install
```

Windows PowerShell:

```powershell
$env:KOREAN_DICT_API_KEY = "발급받은_인증키"
npm start
```

macOS/Linux:

```bash
export KOREAN_DICT_API_KEY="발급받은_인증키"
npm start
```

인증 키를 소스 코드나 MCP 설정 파일에 직접 적거나 GitHub에 올리지 마세요. 로컬 서버는 `KOREAN_DICT_API_KEY` 환경변수에서만 키를 읽습니다. `.env` 파일은 Git에서 제외됩니다.

## MCP 호스트 설정 예시

```json
{
  "mcpServers": {
    "stdict": {
      "command": "node",
      "args": ["C:/path/to/stdict-mcp-server/src/index.js"],
      "env": { "KOREAN_DICT_API_KEY": "발급받은_인증키" }
    }
  }
}
```

MCP 설정 파일에 키를 저장하는 경우 해당 파일을 공개 저장소에 올리지 말고 사용자 계정만 읽을 수 있도록 관리하세요.

## API 출처

- [표준국어대사전 Open API 안내](https://stdict.korean.go.kr/openapi/openApiInfo.do)
- [국어사전 통합 누리집 개발 지원](https://kdict.korean.go.kr/info/openapi)
- [Cloudflare Workers MCP 서버 안내](https://developers.cloudflare.com/agents/model-context-protocol/apis/handler-api/)

API 응답은 MCP 호스트가 사용하기 쉬운 JSON 텍스트로 정리합니다. 인증 키는 저장소에 포함하지 않습니다.
