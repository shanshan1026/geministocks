# Roadmap 路线图

> The living plan for Super Digger. Priorities may shift based on community feedback — open an issue to discuss.
> 挖掘机的动态路线图。优先级会根据社区反馈调整，欢迎开 Issue 讨论。

## Shipped 已完成

- [x] Topic mining analysis with dual scoring (investment attractiveness + information gap) 挖掘分析与双评分（投资吸引力 + 信息差）
- [x] Bring Your Own Model: cloud APIs (OpenRouter, DeepSeek, MiniMax, Ollama) and local CLIs (9Router, Claude Code, Codex) 自带模型：云端 API 与本机 CLI
- [x] Real-time web search with dual providers (Exa / AnySearch) and cited sources 双服务商实时搜索与来源引用
- [x] News aggregation from 5 sources with AI concept tags (manual + auto extraction) 五源新闻聚合与 AI 概念标签（手动 + 自动提取）
- [x] Analysis history with score badges, sorting, and re-analysis 历史记录评分徽章、排序与重新分析
- [x] i18n (zh / en), Markdown export, tiered investment suggestions 中英双语、Markdown 导出、分层投资建议
- [x] Open source foundation: MIT license, docs, unit tests, CI workflow 开源基建：MIT 协议、文档、单测、CI

## Next 近期计划

- [ ] **Trending view 热点聚合视图** — cross-source aggregated feed with concept-tag clustering (same concept appearing across sources = heat signal) 多源混排 + 概念标签聚类
- [ ] **Enable CI 启用 CI** — rename `.github/ci.yml.pending` to `.github/workflows/ci.yml` (requires repo admin) 需仓库管理员手动改名
- [ ] **Progressive analysis rendering 渐进式分析展示** — render each analysis section as soon as it completes 哪段先完成就先渲染哪段

## Later 中期方向

- [ ] **Cloud persistence & accounts 云端持久化与账号** — sync history and settings across devices; enables shareable report links 跨设备同步历史与配置，解锁报告分享链接
- [ ] **Report sharing 报告分享** — share cards (score + key conclusions as image) and/or share links 分享图或分享链接
- [ ] **Bundle size 首屏体积** — lazy-load charts to cut the ~700 kB main chunk 图表懒加载
- [ ] **Test coverage 测试扩展** — cover `apiConfigService` and `historyService` 补充配置与历史服务的单测

## Ideas 待讨论

- Watchlist / follow-up reminders for analyzed topics 已分析主题的跟踪提醒
- Score-change timeline when re-analyzing the same topic 同一主题多次分析的评分变化时间线
- More news sources and community-contributed source adapters 更多新闻源与社区贡献的源适配器

---

Contributions welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md).
欢迎贡献，参见 [CONTRIBUTING.md](./CONTRIBUTING.md)。
