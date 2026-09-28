# 接入 ashare-mcp 获取结构化 A 股数据（零代码 / 本机 HTTP）

本指南说明如何通过 [`CharmYue/ashare-mcp`](https://github.com/CharmYue/ashare-mcp) 这个 MCP server，
让你在 **Claude Code** 中做 A 股分析时按需获取**结构化的真实 A 股数据**（龙虎榜、融资融券、行情、财报等）。

> 本方案**不改动 geministocks 任何代码**，是纯配置引导。

---

## ⚠️ 先理解一个关键边界

geministocks 网页的「本机 CLI」模式，连接的是 `claude-code-router (ccr)` 暴露在
`http://localhost:3456/v1` 的 OpenAI 兼容接口。**这个代理只把请求转发给模型，
不运行 Claude Code 的 agent 工具循环**，因此即使接好了 ashare-mcp，
经 ccr 这条链路时 MCP 工具**不会被触发**。

结论：

- **数据消费端在 Claude Code 自身**（终端 / Desktop / claude.ai），不在 geministocks 网页内。
- 你要在 **Claude Code 里**做 A 股分析时，才能用上 ashare 的结构化数据。
- geministocks 网页继续走它原有的「LLM 联网搜索」链路，两者**并存、互不干扰**。

这是零代码、不扩大功能范围的代价与边界。如果接受，按下面步骤操作。

---

## 一、本机部署 ashare-mcp（HTTP 模式）

```bash
# 没装 uv 才需要这一步（macOS）
brew install uv

git clone https://github.com/CharmYue/ashare-mcp.git
cd ashare-mcp
uv sync                               # 安装依赖，uv 自动管理 Python 3.11

cp .env.example .env                  # 本机自用可全部留空

# 启动 HTTP 服务
uv run ashare-mcp --transport http --port 9876

# 另开一个终端做健康检查，返回 ok 即成功
curl http://127.0.0.1:9876/health
```

> 本机自用、不暴露公网时，`.env` 里的 `MCP_AUTH_TOKEN` 可留空（免鉴权）。
> 一旦要走 cloudflared 等暴露到公网，**必须**设置一长串随机 token。

---

## 二、把它接进 Claude Code（HTTP 传输）

```bash
claude mcp add --scope user --transport http ashare http://127.0.0.1:9876/mcp
claude mcp list                       # 应看到 ashare ✓ connected
```

在 Claude Code 会话里输入 `/mcp`，确认 `ashare` 已连接、工具可见。

> **更省事的本机替代方案（stdio 模式）**：若只在本机用 Claude Code，可不常开 HTTP 端口：
>
> ```bash
> claude mcp add --scope user --transport stdio ashare -- \
>   uv --directory /你的路径/ashare-mcp run ashare-mcp
> ```
>
> HTTP 与 stdio 二选一即可，本指南按你选择的 HTTP 模式编写。

---

## 三、实际工作流

在 **Claude Code 终端**里直接用自然语言提问，例如：

> 用 ashare 查 600519 的实时行情、近一周龙虎榜和两融余额，做一个短线研判。

Claude 会自动调用 `get_realtime_quote`、`get_lhb_stock_detail`、`get_margin_stock_detail`
等工具拿到**结构化真实数据**后再分析——这就是 MCP 路线相对 geministocks
「LLM 联网搜索」的核心增益。

---

## 四、数据可靠性边界（务必知道）

| 类别 | 说明 | 可靠性 |
| --- | --- | --- |
| ✅ 硬数据 | 龙虎榜、融资融券、财报、行情/K 线（实时有数十秒延迟）、南向资金 | 交易所 / 披露原始数据，可靠 |
| ⚠️ 软指标 | 主力资金流向、筹码分布、千股千评 | 估算模型，各家口径不同，**不代表真实机构意图**，仅参考 |
| 🚫 北向资金 | 2024-08-19 起官方已取消盘中/日频明细 | 相关实时工具会直接返回「已停用」错误，属预期行为 |

---

## 五、常见问题

- **geministocks 网页里调不出 A 股数据？** 这是预期行为，见上文「关键边界」——
  网页经 ccr 代理不会触发 MCP 工具，请在 Claude Code 里使用。
- **`claude mcp list` 显示未连接？** 确认第一步的 HTTP 服务仍在运行、
  `curl http://127.0.0.1:9876/health` 正常，且端口与 `claude mcp add` 中填的一致。
- **要暴露到公网给其他设备用？** 用 cloudflared 等隧道暴露 `9876` 端口，
  并在 `.env` 设置 `MCP_AUTH_TOKEN`，`claude mcp add` 时通过 `--header "Authorization: Bearer <token>"` 携带。

---

_参考：[CharmYue/ashare-mcp](https://github.com/CharmYue/ashare-mcp)（基于 fastmcp + akshare）_
