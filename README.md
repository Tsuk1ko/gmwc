# gmc

- 自动签到，支持多帐号及多角色
- 支持币的签到和每日任务
- 支持接入人人打码

## 使用方法

1. 安装 Node.js
2. Clone 本项目
3. `npm i`
4. 构造 json 配置文件，命名为 `config.json`（或者 `config.jsonc`，本项目也支持 JSONC 格式的配置）并置于项目根目录
5. `npm start`

## 配置

```json
{
  "users": [
    {
      "cookie": "",
      "stoken": "",
      "forum": "gs",
      "ua": "",
      "enableGs": true,
      "enableSr": false
    }
  ],
  "failedWebhook": "",
  "rrocrAppkey": "",
  "savingMode": false
}
```

### `cookie` & `stoken`

[获取方法](https://gist.github.com/Tsuk1ko/58518d7ac96d71a4173fbbf187a00ce1)

### `forum`

选填，`gs` 或 `sr`，用于指定完成币任务所使用的论坛，默认 `gs`

### `ua`

选填，以前为了应对验证码风控而新增的配置，但目前脚本签到出现验证码几乎是必然情况，此配置可以认为没有作用，请使用打码服务解决

UA 获取方法：使用 MYS APP 扫以下二维码获取 UA，填入配置文件中

[![](https://user-images.githubusercontent.com/24877906/188344519-8b969898-6071-4642-9da2-27c64149f76b.png)](https://tool.ip138.com/useragent/)

### `enableGs` & `enableSr`

选填，是否启用 gs 或 sr 的签到，默认 gs 为 `true`，sr 为 `false`

### `failedWebhook`

选填，当运行出错时会自动以 GET 方式请求

### `rrocrAppkey`

选填，人人打码自动过验证码，dddd

### `savingMode`

选填，节约模式，如果使用打码服务并设置 `savingMode` 为 `true`，那么当本月原石奖励拿齐后将不再继续签到，币签到如遇验证码也不会签到
