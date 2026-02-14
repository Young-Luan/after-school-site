# 第一步上线指南（Vercel + Supabase）

## 目标
- 网站先上线到公网（Vercel）
- 账号体系用 Supabase
- 仅管理员发号，关闭用户自助注册

## A. Supabase 配置
1. 新建 Supabase 项目。
2. 在 Supabase SQL Editor 执行：`supabase/schema.sql`。
3. 去 Auth -> Providers -> Email：
- 打开 Email 登录
- 关闭公开注册（Disable signups）
4. 在 Project Settings -> API 复制：
- `Project URL`
- `anon public key`
5. 打开项目根目录 `index.html`，替换：
- `REPLACE_WITH_SUPABASE_URL`
- `REPLACE_WITH_SUPABASE_ANON_KEY`

## B. 创建第一个管理员账号
因为系统关闭自助注册，先在 Supabase Dashboard 手动创建一个管理员：
1. Auth -> Users -> Add user（填你的邮箱和密码）。
2. 复制该用户的 `id`。
3. 在 SQL Editor 执行：
```sql
insert into public.profiles (id, role, must_reset_password)
values ('你的用户ID', 'admin', false)
on conflict (id) do update set role = 'admin', must_reset_password = false;
```

## C. 部署管理员创建账号函数（Edge Function）
函数文件已提供：`supabase/functions/admin-create-user/index.ts`

你本地安装 Supabase CLI 后执行：
```bash
supabase login
supabase link --project-ref 你的项目ref
supabase functions deploy admin-create-user
```

## D. 发布到 Vercel
1. 把项目上传到 GitHub。
2. 登录 Vercel，Import 该仓库。
3. Framework Preset 选 `Other`。
4. 直接 Deploy。

## E. 验证流程
1. 打开 Vercel 域名。
2. 用管理员账号登录。
3. 在页面“管理员：创建账号”里创建学生/家长账号。
4. 用新账号登录验证。

## 备注
- 当前学习进度数据先保存在浏览器 localStorage（按用户ID隔离）。
- 下一阶段可改为把学习记录存入 Supabase 数据库。
