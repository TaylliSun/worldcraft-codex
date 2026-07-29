# 公开发行输入与操作

`npm run dist` 只生成可验证的未签名候选包。`npm run dist:public` 会在构建前强制检查真实发行主体、公开链接、更新源和 Windows 代码签名输入；任何一项缺失都会停止，不会生成伪装成正式版的产物。

## 必需输入

| 变量 | 用途 |
| --- | --- |
| `WORLDCRAFT_PUBLISHER_NAME` | 界面显示名称，可与品牌名一致。 |
| `WORLDCRAFT_LEGAL_NAME` | 经发行者确认的法律主体，不得使用示例或项目占位名。 |
| `WORLDCRAFT_CERTIFICATE_PUBLISHER` | 必须与 Windows 签名证书的 Subject/发布者匹配。 |
| `WORLDCRAFT_HOMEPAGE` | HTTPS 官方主页。 |
| `WORLDCRAFT_SUPPORT_URL` | HTTPS 支持与安全问题受理页。 |
| `WORLDCRAFT_PRIVACY_URL` | 经审核并已发布的 HTTPS 隐私政策。 |
| `WORLDCRAFT_TERMS_URL` | 经审核并已发布的 HTTPS 使用条款/EULA。 |
| `WORLDCRAFT_UPDATE_STABLE_URL` | 稳定通道的独立 HTTPS 静态目录。 |
| `WORLDCRAFT_UPDATE_CANDIDATE_URL` | 候选通道的独立 HTTPS 静态目录。 |
| `WORLDCRAFT_RELEASE_CHANNEL` | `stable` 或 `candidate`；带 `-rc`/`-beta` 的版本不能进入稳定通道。 |
| `WIN_CSC_LINK` | electron-builder 可读取的证书文件、受保护 URL 或 Base64 输入；不要提交到仓库。 |
| `WIN_CSC_KEY_PASSWORD` | 证书密码，只放在本机安全环境或 CI secret。 |

可选项包括 `WORLDCRAFT_LEGAL_VERSION`、`WORLDCRAFT_AUTO_UPDATE_CHECK=0`、`WORLDCRAFT_AUTO_UPDATE_DOWNLOAD=1` 和用于确定生成时间的 `SOURCE_DATE_EPOCH`。完整空白模板见 `.env.example`；npm 不会自动加载该文件。

## 更新源布局

稳定与候选通道必须使用两个目录，且每个目录只发布同一通道生成的一组文件：

```text
stable/
  latest.yml
  Worldcraft Codex-Setup-<version>.exe
  Worldcraft Codex-Setup-<version>.exe.blockmap

candidate/
  latest.yml
  Worldcraft Codex-Setup-<version>.exe
  Worldcraft Codex-Setup-<version>.exe.blockmap
```

先上传安装包和 blockmap，校验远端 SHA-256 后最后替换 `latest.yml`，避免客户端看到尚未完整上传的版本。不要把便携版放入自动更新清单；便携版保持手动替换。

## 本地候选构建

```powershell
npm ci
npm run release:gate
npm run dist
npm run test:project-package-packaged
npm run test:installer-package
npm run test:portable-package
npm run test:upgrade-install
```

首个正式稳定版尚无可下载的上一签名版本，因此升级门禁会以当前源码和安装配置生成一个低一候选版本号的临时机械基线，只验证 NSIS 覆盖、数据保留与卸载行为；它不会进入发行目录。schema 1 到 17 的真实旧数据兼容性由独立迁移矩阵验证。首个正式版发布后，应通过受保护流程把升级基线切换为上一签名正式安装包。

候选构建会生成 `SHA256SUMS.txt`、发行 manifest、构建来源、CycloneDX SBOM 和第三方许可说明。`release-config.json` 会列出仍缺少的外部输入，且不会写入证书或密码。

Windows 安装包采用每用户单击安装，不请求管理员权限，安装完成后不会自动启动。法律条款在公开构建首次启动时由应用展示并要求接受；需要自定义安装目录的用户应选择便携版。卸载程序默认保留 SQLite 项目、备份和用户设置。

安装或应用内更新前，系统盘应至少保留 2 GiB 可用空间，用于下载、新版解压和旧版原子暂存。应用会在下载和重启安装前各检查一次，不足时保留现有版本并给出提示。

便携版是自解压可执行文件，每次启动都需要在 Windows 临时目录展开程序，同样建议保留至少 2 GiB 可用空间。它在应用代码启动前完成解压，因此无法使用应用内空间提示；低空间设备应先释放系统盘空间，或由高级用户将 `TEMP`/`TMP` 指向有足够空间的可信本地卷。

## 正式签名构建

在隔离的 Windows 构建环境中设置上述变量后运行：

```powershell
npm ci
npm run release:gate
npm run dist:public
Get-AuthenticodeSignature "release\Worldcraft Codex-Setup-*.exe" | Format-List Status,SignerCertificate
npm run release:verify
```

`dist:public` 强制签名；签名无效、许可证正文缺失、发现高危依赖漏洞、秘密扫描命中、SBOM/哈希不一致或外部配置不完整都会失败。构建后仍需由发行者核对证书主体、时间戳、法律文本、支持入口和下载域名。

## CI 发布

`.github/workflows/windows-quality.yml` 在 Windows 上运行完整门禁。`.github/workflows/windows-release.yml` 只接受与 `package.json` 版本完全匹配的现有 `v<version>` 标签，读取 GitHub Variables/Secrets，构建签名包并创建草稿 Release，不会自动公开。

正式公开按钮必须由有权限的人在以下检查完成后操作：

- 法律主体和证书 Subject 完全一致。
- 隐私政策、条款、支持页面可访问且内容已由发行者审核。
- 两个更新目录均启用 HTTPS，且稳定/候选清单不混用。
- `SHA256SUMS.txt`、SBOM、第三方许可、manifest 和 provenance 随版本留档。
- 在干净 Windows 用户上完成安装、升级、卸载保留数据和回退演练。

本文是工程发布流程，不构成法律意见；条款、隐私政策和发行主体必须由实际发行者确认。
