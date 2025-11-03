# LuckyDraw

這是一個方便的免費線上抽獎程式，無論您是行銷抽獎活動、公司年度尾牙抽獎或是節慶活動抽獎，都能符合您的需求。

在未經同意時，請勿複製改寫用於公司商業用途。

[Lucky Draw](https://hsiehshujeng.github.io/luckydraw/)  
[Demo 影片](https://www.youtube.com/watch?v=Vp7fli021d8)


> Based on Lucky Draw, use nativefier create a native desktop application

## 目錄
1. [測試環境](#測試環境)
2. [本地運行](#本地運行)
   - [安裝依賴套件](#安裝依賴套件)
   - [安裝所需套件](#安裝所需套件)
   - [建置專案](#建置專案)
   - [啟動建置後的檔案](#啟動建置後的檔案)
3. [使用 Docker 運行](#使用-docker-運行)
   - [建置 Docker 映像檔](#建置-docker-映像檔)
   - [運行 Docker 容器](#運行-docker-容器)
   - [存取應用程式](#存取應用程式)
4. [注意事項](#注意事項)
5. [套件更新](#套件更新)


# 測試環境
此抽獎服務在以下環境中測試並確認可正常運行：

```bash
sw_vers
ProductName:            macOS
ProductVersion:         15.2
BuildVersion:           24C101

node -v
v18.18.2

nvm -v
0.40.1

npm -v
9.8.1

yarn -v
1.22.22
```


# 本地運行

## 安裝依賴套件
確保已安裝 Yarn。如果尚未安裝，可以透過 npm 安裝：

```bash
npm install -g yarn
```

## 安裝所需套件
進入專案目錄並執行：

```bash
yarn install
```

## 建置專案
執行正式環境的建置指令：

```bash
yarn run build:prod
```

## 啟動建置後的檔案
使用 `serve` 指令來啟動建置後的檔案：

```bash
serve . -l 8080
```

應用程式將會在 [http://localhost:8080](http://localhost:8080) 提供服務。

## nativefier
安裝 Nativefier：

```bash
npm install -g nativefier
```

## 產生成單機版應用
執行生成Desktop application：

```bash
nativefier "D:\path\to\project\index.html" --name "OfflineLuckyDraw" --icon "D:\path\to\project\favicon.ico" --disable-context-menu --internal-urls ".*" --enable-node-integration
```

# 使用 Docker 運行

## 建置 Docker 映像檔
在專案目錄中執行以下指令來建置 Docker 映像檔：

```bash
docker build -t luckydraw:latest .
```

## 運行 Docker 容器
建置映像檔後，執行以下指令來啟動 Docker 服務：

```bash
docker stop luckydraw
docker run -d -p 8080:8080 luckydraw:latest
```

## 存取應用程式
應用程式將會在本機的 [http://localhost:8080](http://localhost:8080) 提供服務。



# 注意事項
1. `docker rmi $(docker images -f "dangling=true" -q)`



# 套件更新

以下套件已更新或新增，以確保相容性並提升功能：

- **Webpack**: 從 `^4.26.1` 升級至 `^5.97.1`。
- **Webpack CLI**: 從 `^3.2.3` 升級至 `^6.0.1`。
- **Sass-loader**: 更新至 `^7`。
- **Serve**: 新增 `^14.2.4` 用於啟動建置後的檔案。
- **HTML Webpack Plugin**: 新增 `^5.6.3` 以更好地管理 HTML 檔案。
- **Sass**: 新增 `^1.83.4` 以提升 CSS 預處理功能。
