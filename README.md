# ǥ�ر������� MCP ����

��������� ǥ�ر������� Open API�� MCP ������ �����ϴ� Node.js �����Դϴ�. MCP ȣ��Ʈ���� �ܾ� �˻��� �� ��Ǯ�� ��ȸ�� ����� �� �ֽ��ϴ�.

## ���� ����

- `search_dictionary`: ǥ�����Ǯ�� �˻�. ��ġ, ����, ����, ��, ���ϵ�ī�� �˻��� ǰ�� ���͸� �����մϴ�.
- `get_dictionary_entry`: ǥ��� �˻� ����� `targetCode`�� �� �׸��� ��ȸ�մϴ�.

�������Ǿ ������ �� ��ȸ�Ϸ��� �˻� ����� `targetCode`�� `lookupBy: "target_code"`�� �Բ� �����ϼ���.

## �غ� �� ����

- Node.js 18 �̻�
- ǥ�ر������� Open API ���� Ű

```bash
npm install
```

Windows PowerShell:

```powershell
$env:KOREAN_DICT_API_KEY = "�߱޹���_����Ű"
npm start
```

macOS/Linux:

```bash
export KOREAN_DICT_API_KEY="�߱޹���_����Ű"
npm start
```

���� Ű�� �ҽ� �ڵ峪 MCP ���� ���Ͽ� ���� ���ų� GitHub�� �ø��� ������. ������ `KOREAN_DICT_API_KEY` ȯ�溯�������� Ű�� �н��ϴ�. `.env` ������ Git���� ���ܵ˴ϴ�.

## MCP ȣ��Ʈ ���� ����

```json
{
  "mcpServers": {
    "stdict": {
      "command": "node",
      "args": ["C:/path/to/stdict-mcp-server/src/index.js"],
      "env": { "KOREAN_DICT_API_KEY": "�߱޹���_����Ű" }
    }
  }
}
```

MCP ���� ���Ͽ� Ű�� �����ϴ� ��� �ش� ������ ���� ����ҿ� �ø��� ���� ����� ������ ���� �� �ֵ��� �����ϼ���.

## API ��ó

- [ǥ�ر������� Open API �ȳ�](https://stdict.korean.go.kr/openapi/openApiInfo.do)
- [������� ���� ������ ���� ����](https://kdict.korean.go.kr/info/openapi)

API ������ MCP ȣ��Ʈ�� ����ϱ� ���� JSON �ؽ�Ʈ�� �����մϴ�. ���� Ű�� ����ҿ� �������� �ʽ��ϴ�.
