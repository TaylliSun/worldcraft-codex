# Worldcraft Codex 发布检查表

适用于 `2.2.0-rc.1` 及后续同架构版本。

公开签名发行还必须完成 `PUBLIC_RELEASE_CHECKLIST.md`；真实主体、法律页面、证书和更新托管输入见 `PUBLIC_RELEASE_INPUTS.md`。

## 功能冻结

- [ ] 不引入社区、插件市场、实时协作、游戏引擎专用导出或通用聊天。
- [ ] 确认 schema 版本为 17，旧集合名称和对象 ID 未被重写。
- [ ] 检查首次启动、正常启动、空搜索、缺失资源、损坏备份和导入失败状态。

## 自动门禁

完整回归可由一个命令执行：

```powershell
npm run release:gate
```

以下命令保留用于定位单项失败：

```powershell
npm run typecheck
npm run test:consistency
npm run test:local-model
npm run test:ai-credentials
npm run test:ai-writing
npm run test:ai-operations
npm run test:planning
npm run test:story
npm run test:narrative
npm run test:manuscript
npm run test:manuscript-storage
npm run test:templates
npm run test:codex-tree
npm run test:project-references
npm run test:inline-ai
npm run test:publication
npm run test:storage
npm run test:pressure
npm run test:performance
npm run test:project-files
npm run test:project-package
npm run test:project-package-pressure
npm run test:release
npm run test:resilience
npm run test:migrations
npm run test:starter-packs
npm run build
npm run test:project-package-e2e
npm run test:e2e
```

## 发行物

- [ ] 运行 `npm run dist`，生成 Windows x64 便携版和 NSIS 安装版。
- [ ] 运行 `npm run test:portable-package`，验证便携包装器窗口、版本、schema 和两次 `quick_check`。
- [ ] 运行 `npm run test:project-package-packaged`，从打包后的应用完成工程包保存、空目录打开、完整备份、重定位和重启往返。
- [ ] 运行 `npm run test:upgrade-install`，验证上一支持候选版覆盖升级、备份识别、卸载和用户数据保留；另由迁移矩阵验证旧 schema 到 17。
- [ ] 在隔离用户目录启动便携版，确认 SQLite 初始化、主窗口和正常退出。
- [ ] 安装 NSIS 包，启动一次并卸载，确认用户数据目录仍保留。
- [ ] 对两个 `.exe` 生成 SHA-256，并随发布说明提供。
- [ ] 校验 CycloneDX SBOM、第三方许可、manifest、provenance 和 `SHA256SUMS.txt`。
- [ ] 检查应用版本、文件名、RC 说明和已知限制一致。
- [ ] 正式公开分发前使用可信代码签名证书签名；当前仓库不包含证书。

## 人工抽查

- [ ] 新建/编辑条目后重启，内容仍存在。
- [ ] 空数据库首先显示四类项目起步包；选择后一次保存进入创作台，任务、剧情、变量与里程碑可重启读取。
- [ ] 1 万条目性能基准全部低于 `G4_DESKTOP_QUALITY.md` 预算；项目树默认折叠并按每批 120 条加载。
- [ ] 统一创建与全局搜索弹窗可用键盘循环焦点，`Esc` 后焦点返回触发按钮；中文输入法组合态不会误提交或触发快捷键。
- [ ] 统一创建面板可指定类型、模板、分类和可见性；项目树可折叠、拖放并支持五层分类。
- [ ] 前进/后退、最近打开、面包屑与树中定位可用；摘要和正文专注模式可正常进入及退出。
- [ ] 在自动保存完成前模拟刷新，未完成草稿能恢复；保存失败时可查看原因并重试。
- [ ] 模板工坊和资料台账可切换，默认六类模板存在。
- [ ] 任务、剧情、制作、地图、时间线和一致性视图可打开。
- [ ] 地图标记和时间点的统一关联器可跨类型搜索、多选、跳转和新建；新对象自动回写原关联。
- [ ] 反向引用显示来源对象、字段和摘录，并能定位到条目正文、模板资料、任务步骤、剧情节点、地图或时间线字段。
- [ ] 地图图层/标记组的显示与锁定生效；时间线日期精度和至少 20 个跨类型关联可保存、重启和恢复。
- [ ] 阅读预览区块开关可用；普通 JSON/Markdown 不含秘密块、秘密字段、开发备注和 AI 私有记忆，`.wcodex`、旧 `.wcodex.json` 与备份仍完整。
- [ ] 在空用户目录打开 `.wcodex`，项目数据、资源字节、地图 URL 和 SHA-256 完整恢复；删除源用户目录后仍可往返。
- [ ] 篡改工程包、非法路径、重复条目和哈希不符在提交前被拒绝，当前数据库与资源目录不受污染。
- [ ] 快速快照明确标注“仅项目数据”，完整备份明确标注资源完整度；两类备份均可恢复。
- [ ] 全局搜索可跳转到条目、模板、任务、剧情和里程碑。
- [ ] 文稿树可新建、拖动、拆分和合并书籍、卷、章与场景；字数、状态、历史恢复和全屏编辑可用。
- [ ] 正文稳定引用在目标改名后保留对象 ID，旧 `[[标题]]` 可读取；重名、失效和跨世界引用会进入项目检查。
- [ ] AI 文稿上下文按全书、卷、章和场景分层，作者确认事实与未闭合线索优先；流式生成可以取消并保留已生成文本。
- [ ] 人物知识状态、章节时间和伏笔回收问题可从一致性结果跳回具体文稿对象。
- [ ] AI 工具可选择上下文、测试连接和生成预览；API Key 文件不含明文，秘密字段未进入请求。
- [ ] 剧情写作室完成策划、写作、审校，精确定位原句并应用建议；重启后会话、记忆和检查点仍存在。
- [ ] 审校生成的记忆包含结构化事实和精确来源；事实冲突可选择保留项，停用项不会进入后续 AI 上下文。
- [ ] AI 项目操作无需逐项确认即可跨五模块写入；执行前检查点、重启持久化、对象跳转和完整撤销均正常。
- [ ] 摘要、正文、模板长文本、任务步骤和剧情文本可直接调用 AI；选区、来源、候选事实与前后差异显示正确。
- [ ] 字段级 AI 写入前后运行一致性预检；应用创建检查点，撤销恢复精确值并保留作者已确认记忆。
- [ ] 项目检查显示 `quick_check: ok`，诊断包不含正文、秘密字段、密钥和路径。
- [ ] 从有效备份恢复成功；损坏备份不可恢复且不覆盖当前项目。
