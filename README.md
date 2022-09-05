# gmwc

- 每天早上 7:00 执行
- 部分失败不会使整体流程终止，并且你会收到一封来自 GitHub 的 Actions 失败提醒邮件
- 运行时会自动同步该上游仓库，并使用上游仓库文件解决冲突，如有自定义需求请自行修改 workflow

## 使用方法

**在 GitHub Actions 中使用：**

1. Fork 本项目
2. 前往 Actions 页面启用 GitHub Actions
3. 构造 json 配置文件，创建 [gist](https://gist.github.com/) 并获取源文件链接
   1. description 随便，filename 以 `.json` 结尾（或者 `.jsonc`，本项目也支持），例如 `gmwc-config.json`
   2. 填入配置文件内容
   3. 点击“Create secret gist”创建私有 gist
   4. 右击右上角“Raw”，复制链接地址，将这个链接最后的 `/raw/xxx/yyy.json` 部分中的 `xxx/` 删除，即变为 `/raw/yyy.json`，就得到我们要的源文件链接了
   5. 以后如果想要修改配置文件就直接修改这个 gist 即可
4. 将配置文件链接写入 `CONFIG_URL` secrets

> 这类 GitHub Actions 使用方式实际上违反了 TOS，建议有条件的使用阿里云或腾讯云的云函数

**在本地使用：**

1. 安装 Node.js
2. Clone 本项目
3. `npm i`
4. 构造 json 配置文件，命名为 `config.json`（或者 `config.jsonc`，本项目也支持）并置于项目根目录
5. `npm start`

### 配置文件

目前完整配置文件结构如下，并不是所有字段都是必填，请根据后续说明完善配置文件

> `w` 已经不推荐配置，详见[下文](#w)

```json
{
  "m": [
    {
      "cookie": "",
      "stoken": ""
    }
  ],
  "w": [
    {
      "alc": "",
      "aid": "",
      "gsid": "",
      "s": "",
      "from": "",
      "webhook": "",
      "proxy": ""
    }
  ]
}
```

### 自动同步上游

每日执行前会自动同步主仓库，主仓库可能会修改 workflow 配置文件，而 GitHub Actions 默认提供的 token 只有 repo 权限而没有 workflow 权限，此时会同步失败

有两种解决方案：

1. [点击此处](https://github.com/settings/tokens/new?description=genshin-mys-checkin&scopes=workflow)打开 personal token 生成页，默认会帮你填好 note 和自动勾选 workflow scope，生成然后写入 `ACCESS_TOKEN` secrets  
2. 如果你不愿意或不放心使用 token，可以自行同步主仓库，现在 GitHub 网页端添加了一个“Fetch upstream”功能，你可以直接在网页端完成同步

## M

- 自动签到，支持多帐号及多角色
- 支持币的每日任务

### 配置

```json
{
  "m": [
    {
      "cookie": "",
      "stoken": "",
      "ua": ""
    }
  ]
}
```

Cookie 获取请参考[此处](https://git.io/JM9KN)

如果要多账号的话你应该懂怎么做

#### 关于 `ua`

自2022年8月左右开始，签到增加了风控，可能会需要验证码导致脚本无法正常签到

如果出现这种情况，请先尝试使用手机 APP 手动签到，直到不再弹出验证码，然后使用 APP 扫以下二维码获取 UA，填入配置文件中

[![](https://user-images.githubusercontent.com/24877906/188344519-8b969898-6071-4642-9da2-27c64149f76b.png)](https://tool.ip138.com/useragent/)

#### 关于 `stoken`

`stoken` 为选填，填了才会完成币的每日任务

获取方法：**无痕模式**登录[帐号管理](https://tinyurl.com/2p947bth)（在上面拿完 cookie 之后继续操作也行，无需重新登陆），<kbd>F12</kbd>打开 Console，执行[这段代码](https://gist.github.com/Tsuk1ko/cdd5bbf4b89faa7f3b140ee59923b5a3)，最终输出的字符串即为 `stoken`

也可使用抓包工具在手机 APP 获得

## W

> 因为超话发卡貌似改成抽奖啥的了，只有摩拉和实物，没有原石了，所以不建议再配置超话签到。签到功能仍然可以正常运行，但领礼包已经没用了，也不会再维护了。

<details>

- 自动签到，自动领取礼包，并可以通过 webhook 发送兑换码，支持多帐号
- 有一定使用门槛（懂的都懂，不懂的我也没办法）

### 配置

```json
{
  "w": [
    {
      "alc": "",
      "aid": "",
      "gsid": "",
      "s": "",
      "from": "",
      "webhook": ""
    }
  ]
}
```

如果要多账号的话你应该懂怎么做

> 因礼包领取方式调整，从 2022-01-07 起，本项目不再支持网页版 API，统一使用国际版客户端 API

#### `alc`

1. PC 登录[某浪网](https://www.sina.com.cn/)
2. 进入[这个页面](https://login.sina.com.cn/sso/test)，会 404，不用管
3. F12 开发者工具 - Application - Cookies，将 `ALC` 的值填入即可

#### `aid` `gsid` `s` `from`

需要通过抓国际版客户端的包得到

我个人习惯使用 [whistle](https://github.com/avwo/whistle)

#### `webhook`（可选）

当有礼包领取成功时，会将兑换码发至该 webhook，目前仅使用 GET 方式调用，可用以下占位符：

- `{{id}}` - 礼包ID
- `{{name}}` - 礼包名
- `{{code}}` - 兑换码
- `{{index}}` - 账户序号，从 0 开始

注意 URL 参数中除了上述占位符外的内容都应该进行 URL 编码

※ 你可以使用 [Server酱](http://sc.ftqq.com/3.version) 或 [IFTTT](https://ifttt.com/) 之类的工具推送至微信或 Telegram 等
</details>
