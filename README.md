# 표준국어대사전 MCP 서버

국립국어원 표준국어대사전 Open API를 MCP 도구로 연결하는 Node.js 서버입니다. 로컬 프로그램에서는 stdio 방식으로, ChatGPT 웹 등 원격 MCP를 지원하는 서비스에서는 Cloudflare Workers 방식으로 사용할 수 있습니다.

## 제공 도구

- \`search_dictionary\`: 표제어·뜻풀이 검색. 일치, 포함, 시작, 끝, 와일드카드 검색과 품사 필터를 지원합니다.
- \`get_dictionary_entry\`: 표제어나 검색 결과의 \`targetCode\`로 상세 항목을 조회합니다.

동음이의어를 구분해 상세 조회하려면 검색 결과의 \`targetCode\`를 \`lookupBy: "target_code"\`와 함께 전달하세요.

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

\`\`\`bash
npm install
npx wrangler login
npx wrangler secret put KOREAN_DICT_API_KEY
npx wrangler secret put MCP_PATH_TOKEN
npm run deploy:cloudflare
\`\`\`

6. \`secret put\` 명령에서 API 키를 입력합니다. 입력한 값은 화면에 표시되지 않습니다. API 키를 GitHub 파일이나 코드에 적지 마세요.
7. 배포가 완료되면 Wrangler가 표시하는 \`workers.dev\` 주소 뒤에 \`/mcp\`를 붙여 MCP 주소로 사용합니다. 예: \`https://내-worker.내계정.workers.dev/mcp\`

### ChatGPT 웹에 연결하기

1. ChatGPT 웹에서 **플러그인(Plugins)** 메뉴를 엽니다.
2. **+ → 맞춤 MCP 서버 추가(Add custom MCP server)**를 선택합니다.
3. 서버 주소에 본인의 Cloudflare MCP 주소(\`https://...workers.dev/mcp\`)를 입력합니다.
4. 이 서버는 사전 검색·조회만 제공하므로 인증 방식은 **인증 없음(No authentication)**으로 선택합니다.
5. 연결을 만들고 도구 목록에 \`search_dictionary\`, \`get_dictionary_entry\`가 표시되는지 확인합니다.

ChatGPT의 맞춤 MCP 기능은 계정 및 요금제, 워크스페이스 설정에 따라 달라질 수 있습니다. OpenAI 안내 기준으로 맞춤 MCP 연결은 웹에서 제공되며 모바일에서는 연결할 수 없습니다. 최신 지원 여부는 [OpenAI 안내](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt)를 확인하세요.

### 보안과 사용량

- API 키는 각자의 Cloudflare Worker Secret에 저장되며 코드나 GitHub 저장소에 포함되지 않습니다.
- MCP 주소에는 `MCP_PATH_TOKEN`이 포함되므로, 주소를 아는 사람은 Worker에 요청할 수 있습니다. 주소를 공개적으로 공유하지 마세요. 다른 사람이 호출하면 본인의 사전 API 사용량이 소진될 수 있습니다.
- 이 공개 저장소는 소스 코드만 제공합니다. 다른 사용자는 본인 API 키로 별도의 Worker를 배포해야 합니다.
- Cloudflare Workers 무료 요금제의 한도 및 조건은 바뀔 수 있습니다. 최신 내용은 [Workers 요금제 한도](https://developers.cloudflare.com/workers/platform/limits/)를 확인하세요.

## 로컬 MCP 서버로 실행하기

### 준비물

- Node.js 18 이상
- 표준국어대사전 Open API 인증 키

\`\`\`bash
npm install
\`\`\`

Windows PowerShell:

\`\`\`powershell
$env:KOREAN_DICT_API_KEY = "발급받은_인증키"
npm start
\`\`\`

macOS/Linux:

\`\`\`bash
export KOREAN_DICT_API_KEY="발급받은_인증키"
npm start
\`\`\`

인증 키를 소스 코드나 MCP 설정 파일에 직접 적거나 GitHub에 올리지 마세요. 로컬 서버는 \`KOREAN_DICT_API_KEY\` 환경변수에서만 키를 읽습니다. \`.env\` 파일은 Git에서 제외됩니다.

## MCP 호스트 설정 예시

\`\`\`json
{
  "mcpServers": {
    "stdict": {
      "command": "node",
      "args": ["C:/path/to/stdict-mcp-server/src/index.js"],
      "env": { "KOREAN_DICT_API_KEY": "발급받은_인증키" }
    }
  }
}
\`\`\`

MCP 설정 파일에 키를 저장하는 경우 해당 파일을 공개 저장소에 올리지 말고 사용자 계정만 읽을 수 있도록 관리하세요.

## API 출처

- [표준국어대사전 Open API 안내](https://stdict.korean.go.kr/openapi/openApiInfo.do)
- [국어사전 통합 누리집 개발 지원](https://kdict.korean.go.kr/info/openapi)
- [Cloudflare Workers MCP 서버 안내](https://developers.cloudflare.com/agents/model-context-protocol/apis/handler-api/)

API 응답은 MCP 호스트가 사용하기 쉬운 JSON 텍스트로 정리합니다. 인증 키는 저장소에 포함하지 않습니다.
