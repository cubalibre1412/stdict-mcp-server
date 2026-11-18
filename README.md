# 표준국어대사전 MCP 서버

국립국어원 표준국어대사전 Open API를 MCP 도구로 연결하는 Node.js 서버입니다. MCP 호스트에서 단어 검색과 상세 뜻풀이 조회를 사용할 수 있습니다.

## 제공 도구

- `search_dictionary`: 표제어·뜻풀이 검색. 일치, 포함, 시작, 끝, 와일드카드 검색과 품사 필터를 지원합니다.
- `get_dictionary_entry`: 표제어나 검색 결과의 `targetCode`로 상세 항목을 조회합니다.

동음이의어를 구분해 상세 조회하려면 검색 결과의 `targetCode`를 `lookupBy: "target_code"`와 함께 전달하세요.

## 준비 및 실행

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

인증 키를 소스 코드나 MCP 설정 파일에 직접 적거나 GitHub에 올리지 마세요. 서버는 `KOREAN_DICT_API_KEY` 환경변수에서만 키를 읽습니다. `.env` 파일은 Git에서 제외됩니다.

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

API 응답은 MCP 호스트가 사용하기 쉬운 JSON 텍스트로 정리합니다. 인증 키는 저장소에 포함하지 않습니다.
