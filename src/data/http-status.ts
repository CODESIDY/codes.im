import type { Lang } from '../i18n/ui';

// HTTP status code reference (RFC 9110 and common non-standard codes).

interface Text {
  /** One-sentence meaning. */
  summary: string;
  /** When it is used / what it tells the client. */
  details: string;
  /** Common causes and fixes (errors) or usage notes (others). */
  items: string[];
}

export interface HttpStatus {
  code: number;
  name: string;
  /** Not defined by an RFC (e.g. nginx or Cloudflare specific). */
  unofficial?: string;
  related: number[];
  text: Record<Lang, Text>;
}

export const statusClass: Record<number, Record<Lang, { name: string; desc: string }>> = {
  1: { en: { name: '1xx Informational', desc: 'The request was received and processing continues.' }, zh: { name: '1xx 信息响应', desc: '请求已收到，继续处理。' } },
  2: { en: { name: '2xx Success', desc: 'The request was received, understood and accepted.' }, zh: { name: '2xx 成功', desc: '请求已被成功接收、理解并处理。' } },
  3: { en: { name: '3xx Redirection', desc: 'Further action is needed, usually following another URL.' }, zh: { name: '3xx 重定向', desc: '需要进一步操作，通常是跳转到另一个 URL。' } },
  4: { en: { name: '4xx Client error', desc: 'The request is wrong or not allowed — fix the request.' }, zh: { name: '4xx 客户端错误', desc: '请求有误或不被允许，需要修改请求。' } },
  5: { en: { name: '5xx Server error', desc: 'The server failed to fulfil a valid request.' }, zh: { name: '5xx 服务端错误', desc: '请求本身没问题，但服务端处理失败。' } },
};

const s = (code: number, name: string, related: number[], en: Text, zh: Text, unofficial?: string): HttpStatus => ({ code, name, related, text: { en, zh }, unofficial });

export const httpStatuses: HttpStatus[] = [
  s(
    100,
    'Continue',
    [101],
    {
      summary: 'The server received the request headers and the client should send the body.',
      details: 'Sent in reply to a request with `Expect: 100-continue`, so a client can check whether the server will accept a large upload before sending it.',
      items: ['curl sends `Expect: 100-continue` automatically for large POST bodies; disable it with `-H "Expect:"` if a proxy mishandles it.', 'Most browsers and HTTP libraries handle 100 transparently — you rarely see it in application code.'],
    },
    {
      summary: '服务端已收到请求头，客户端可以继续发送请求体。',
      details: '用于回应带有 `Expect: 100-continue` 的请求，让客户端在上传大文件前先确认服务端是否愿意接收。',
      items: ['curl 在 POST 较大的请求体时会自动带上 `Expect: 100-continue`，如果某些代理处理有问题，可以用 `-H "Expect:"` 关闭。', '浏览器和大多数 HTTP 库会自动处理 100，业务代码里很少看到。'],
    },
  ),
  s(
    101,
    'Switching Protocols',
    [100],
    {
      summary: 'The server is switching to the protocol the client asked for in the `Upgrade` header.',
      details: 'Most often seen when a WebSocket connection is established: the HTTP request is upgraded and the connection then speaks the WebSocket protocol.',
      items: ['If a WebSocket handshake fails behind nginx, make sure `proxy_set_header Upgrade $http_upgrade;` and `Connection "upgrade"` are configured and `proxy_http_version 1.1` is set.'],
    },
    {
      summary: '服务端同意按客户端 `Upgrade` 请求头的要求切换协议。',
      details: '最常见于建立 WebSocket 连接：HTTP 请求被“升级”，之后这条连接改用 WebSocket 协议通信。',
      items: ['如果 nginx 后面的 WebSocket 握手失败，检查是否配置了 `proxy_set_header Upgrade $http_upgrade;`、`Connection "upgrade"` 以及 `proxy_http_version 1.1`。'],
    },
  ),
  s(
    103,
    'Early Hints',
    [200],
    {
      summary: 'Preliminary headers sent before the final response so the browser can start preloading resources.',
      details: 'Typically carries `Link: <…>; rel=preload` headers while the server is still generating the page, improving load time.',
      items: ['Supported by Chromium browsers and CDNs such as Cloudflare. Clients that do not understand it simply ignore it.'],
    },
    {
      summary: '在最终响应之前先发送部分响应头，让浏览器提前预加载资源。',
      details: '通常携带 `Link: <…>; rel=preload` 头，在服务端还在生成页面时就让浏览器开始下载 CSS、字体等资源，加快页面加载。',
      items: ['Chromium 系浏览器和 Cloudflare 等 CDN 已支持，不认识它的客户端会直接忽略。'],
    },
  ),
  s(
    200,
    'OK',
    [201, 204, 304],
    {
      summary: 'The request succeeded.',
      details: 'The meaning depends on the method: for GET the body contains the resource, for POST it contains the result of the action.',
      items: ['Don’t return 200 with an error message in the body — clients, monitoring and caches treat 200 as success. Use a 4xx or 5xx code instead.'],
    },
    {
      summary: '请求成功。',
      details: '含义取决于请求方法：GET 返回资源内容，POST 返回操作结果。',
      items: ['不要用 200 返回错误信息（比如 `{"code": 500}`）。客户端、监控和缓存都会把 200 当作成功，应该使用对应的 4xx / 5xx 状态码。'],
    },
  ),
  s(
    201,
    'Created',
    [200, 202],
    {
      summary: 'The request succeeded and a new resource was created.',
      details: 'Typical response to a POST (or PUT) that creates something. Include a `Location` header pointing to the new resource.',
      items: ['Return the created resource (or at least its ID) in the body so the client doesn’t need another request.'],
    },
    {
      summary: '请求成功，并创建了新资源。',
      details: '通常用于创建资源的 POST（或 PUT）请求，响应中应带上指向新资源的 `Location` 头。',
      items: ['建议在响应体中返回新建的资源（至少包含 ID），客户端就不需要再请求一次。'],
    },
  ),
  s(
    202,
    'Accepted',
    [201, 200],
    {
      summary: 'The request was accepted for processing, but processing has not finished.',
      details: 'Used for asynchronous work such as background jobs or batch requests. The result may later succeed or fail.',
      items: ['Return a job ID or a status URL the client can poll, or notify completion with a webhook.'],
    },
    {
      summary: '请求已被接受，但还没有处理完成。',
      details: '用于异步任务，比如后台作业、批量请求，最终结果可能成功也可能失败。',
      items: ['在响应里返回任务 ID 或可轮询的状态 URL，或者在完成后通过 Webhook 通知。'],
    },
  ),
  s(
    204,
    'No Content',
    [200],
    {
      summary: 'The request succeeded and there is no body to return.',
      details: 'Common for DELETE, for PUT/PATCH that don’t return the updated resource, and for CORS preflight responses.',
      items: ['A 204 response must not have a body. Calling `response.json()` on it throws — check the status first.'],
    },
    {
      summary: '请求成功，但没有需要返回的内容。',
      details: '常用于 DELETE、不返回更新结果的 PUT / PATCH，以及 CORS 预检请求的响应。',
      items: ['204 响应不能有响应体。前端对它调用 `response.json()` 会报错，先判断状态码。'],
    },
  ),
  s(
    206,
    'Partial Content',
    [200],
    {
      summary: 'The server is returning only part of the resource, as requested with a `Range` header.',
      details: 'Used for resumable downloads and for video/audio seeking. The `Content-Range` header says which bytes are included.',
      items: ['Servers advertise range support with `Accept-Ranges: bytes`. If seeking in a video doesn’t work, check that your server or CDN supports range requests.'],
    },
    {
      summary: '服务端按客户端 `Range` 请求头的要求，只返回了资源的一部分。',
      details: '用于断点续传和音视频拖动播放，`Content-Range` 头说明返回的是哪一段字节。',
      items: ['服务端通过 `Accept-Ranges: bytes` 声明支持范围请求。如果视频无法拖动进度，检查服务器或 CDN 是否支持 Range 请求。'],
    },
  ),
  s(
    301,
    'Moved Permanently',
    [308, 302, 307],
    {
      summary: 'The resource has permanently moved to the URL in the `Location` header.',
      details: 'Browsers and search engines update to the new URL and pass ranking signals to it. Browsers may cache it aggressively.',
      items: ['Use it for domain changes, HTTP→HTTPS and changed URL structures.', 'Clients may change POST to GET when following a 301; use 308 if the method must be kept.', 'Because browsers cache 301s, test with 302 first and switch to 301 once you’re sure.'],
    },
    {
      summary: '资源已永久移动到 `Location` 头指定的新地址。',
      details: '浏览器和搜索引擎会改用新地址，并把排名权重转移过去。浏览器可能会长期缓存这个跳转。',
      items: ['适用于更换域名、HTTP 跳转 HTTPS、调整 URL 结构等场景。', '客户端跟随 301 时可能把 POST 改成 GET，需要保留请求方法时用 308。', '浏览器会缓存 301，建议先用 302 测试，确认无误后再改成 301。'],
    },
  ),
  s(
    302,
    'Found',
    [303, 307, 301],
    {
      summary: 'The resource is temporarily at another URL; keep using the original URL in future.',
      details: 'The classic temporary redirect, used for example after login or for A/B tests. Search engines keep the original URL indexed.',
      items: ['Like 301, clients may switch POST to GET. Use 303 to explicitly send the client to a GET page, or 307 to keep the method.'],
    },
    {
      summary: '资源临时位于另一个地址，以后仍应使用原地址。',
      details: '最常用的临时跳转，例如登录后跳转、A/B 测试。搜索引擎会继续收录原地址。',
      items: ['和 301 一样，客户端可能把 POST 改为 GET。想明确跳转到 GET 页面用 303，需要保留请求方法用 307。'],
    },
  ),
  s(
    303,
    'See Other',
    [302, 307],
    {
      summary: 'Fetch the result from another URL using GET.',
      details: 'The standard response after a form POST (the Post/Redirect/Get pattern), so refreshing the page doesn’t resubmit the form.',
      items: ['After handling a POST, redirect with 303 to the result page.'],
    },
    {
      summary: '请使用 GET 到另一个地址获取结果。',
      details: '表单 POST 之后的标准响应（PRG 模式：Post/Redirect/Get），避免用户刷新页面时重复提交表单。',
      items: ['处理完 POST 请求后，用 303 跳转到结果页面。'],
    },
  ),
  s(
    304,
    'Not Modified',
    [200, 412],
    {
      summary: 'The cached copy is still valid; no body is sent.',
      details: 'Returned to conditional requests (`If-None-Match` with an ETag, or `If-Modified-Since`) when the resource hasn’t changed, saving bandwidth.',
      items: ['Seeing many 304s is normal and good. If changes don’t appear, check whether your ETag or Last-Modified headers update when content changes.'],
    },
    {
      summary: '缓存副本仍然有效，不返回响应体。',
      details: '用于条件请求（带 ETag 的 `If-None-Match` 或 `If-Modified-Since`）：资源没有变化时返回 304，节省带宽。',
      items: ['大量 304 是正常且健康的。如果内容更新后用户看不到变化，检查 ETag 或 Last-Modified 是否随内容更新。'],
    },
  ),
  s(
    307,
    'Temporary Redirect',
    [302, 308],
    {
      summary: 'Temporarily redirect to another URL and repeat the request with the same method and body.',
      details: 'Like 302 but guarantees a POST stays a POST. Browsers also show an internal 307 when HSTS forces HTTP→HTTPS.',
      items: ['Use it when an API endpoint moves temporarily and clients must re-send the same request.'],
    },
    {
      summary: '临时跳转到另一个地址，并使用相同的方法和请求体重新发送。',
      details: '与 302 类似，但保证 POST 仍然是 POST。浏览器因 HSTS 强制 HTTP 跳 HTTPS 时，也会显示一个内部的 307。',
      items: ['适用于接口临时迁移、需要客户端原样重发请求的场景。'],
    },
  ),
  s(
    308,
    'Permanent Redirect',
    [301, 307],
    {
      summary: 'Permanently redirect to another URL, keeping the method and body.',
      details: 'The method-preserving version of 301. Useful for APIs whose endpoints have moved for good.',
      items: ['Search engines treat 308 like 301. Very old clients may not understand it.'],
    },
    {
      summary: '永久跳转到另一个地址，并保留请求方法和请求体。',
      details: '保留请求方法的 301，适合接口地址永久迁移。',
      items: ['搜索引擎对 308 的处理与 301 相同；极老的客户端可能不支持。'],
    },
  ),
  s(
    400,
    'Bad Request',
    [422, 415, 413],
    {
      summary: 'The server can’t process the request because it is malformed.',
      details: 'A generic client error: invalid JSON, missing required parameters, wrong types or an invalid header.',
      items: ['Check that the body is valid JSON and that `Content-Type` matches it.', 'Look for missing or misspelled required fields and wrong value types.', 'URL-encode query parameters that contain special characters.', 'Oversized or malformed cookies can also cause a 400 — try clearing them.'],
    },
    {
      summary: '请求格式有误，服务端无法处理。',
      details: '通用的客户端错误：JSON 不合法、缺少必填参数、类型不对或请求头无效。',
      items: ['确认请求体是合法 JSON，并且 `Content-Type` 与之匹配。', '检查必填字段是否缺失或拼错，值的类型是否正确。', '查询参数里有特殊字符时要做 URL 编码。', 'Cookie 过大或格式错误也会导致 400，可以尝试清除。'],
    },
  ),
  s(
    401,
    'Unauthorized',
    [403],
    {
      summary: 'Authentication is required or the credentials are invalid.',
      details: 'Despite the name, it means “unauthenticated”: the server doesn’t know who you are. It should include a `WWW-Authenticate` header.',
      items: ['Check the header format, e.g. `Authorization: Bearer <token>` (note the space).', 'The token may have expired — decode a JWT to check its `exp` claim, then refresh it.', 'Make sure you’re using the key for the right environment (test vs production).', 'If you are logged in but lack permission, the correct code is 403, not 401.'],
    },
    {
      summary: '需要身份认证，或者提供的凭证无效。',
      details: '虽然名字叫 Unauthorized，实际含义是“未认证”：服务端不知道你是谁。响应应带上 `WWW-Authenticate` 头。',
      items: ['检查请求头格式，例如 `Authorization: Bearer <token>`（注意中间的空格）。', 'Token 可能已过期：解码 JWT 查看 `exp` 字段，然后刷新 Token。', '确认用的是对应环境（测试 / 生产）的 Key。', '如果已登录但没有权限，正确的状态码是 403 而不是 401。'],
    },
  ),
  s(
    403,
    'Forbidden',
    [401, 404],
    {
      summary: 'The server understood who you are but refuses to allow the request.',
      details: 'Authentication succeeded (or isn’t required) but the client lacks permission. Re-authenticating won’t help.',
      items: ['Check the user’s role or the API key’s scopes.', 'For static files, check file-system permissions and that directory listing isn’t being requested.', 'A WAF, IP allow-list, hot-link protection or region block may be rejecting the request.', 'For object storage (S3, OSS, COS), check the bucket policy and whether the URL signature has expired.'],
    },
    {
      summary: '服务端知道你是谁，但拒绝执行这个请求。',
      details: '已经通过认证（或不需要认证），但没有权限。重新登录也没用。',
      items: ['检查用户角色或 API Key 的权限范围（scope）。', '静态文件要检查文件系统权限，以及是否访问了被禁止列目录的路径。', '可能被 WAF、IP 白名单、防盗链或地区限制拦截。', '对象存储（S3、OSS、COS）要检查 Bucket 策略，以及签名 URL 是否过期。'],
    },
  ),
  s(
    404,
    'Not Found',
    [410, 405],
    {
      summary: 'The server can’t find the requested resource.',
      details: 'The URL doesn’t map to anything. Servers also return 404 to hide resources the client isn’t allowed to know about.',
      items: ['Check the path for typos, trailing slashes and letter case (Linux servers are case-sensitive).', 'For APIs, check the base URL and version prefix (`/v1/` vs `/api/v1/`).', 'Single-page apps need the server to fall back to `index.html` for client-side routes.', 'If a page was removed for good, 410 tells search engines to drop it faster; if it moved, redirect with 301.'],
    },
    {
      summary: '服务端找不到请求的资源。',
      details: 'URL 没有对应任何内容。有些服务端也会用 404 隐藏客户端无权知道存在的资源。',
      items: ['检查路径拼写、末尾斜杠和大小写（Linux 服务器区分大小写）。', '接口请求要检查 Base URL 和版本前缀（`/v1/` 还是 `/api/v1/`）。', '单页应用需要服务端把前端路由回退到 `index.html`，否则刷新页面会 404。', '页面永久删除可以返回 410，让搜索引擎更快移除；页面换了地址应该用 301 跳转。'],
    },
  ),
  s(
    405,
    'Method Not Allowed',
    [404, 501],
    {
      summary: 'The resource exists but doesn’t support this HTTP method.',
      details: 'For example a POST to an endpoint that only accepts GET. The response should list allowed methods in an `Allow` header.',
      items: ['Check the method in your client code and the route definition on the server.', 'Static hosting usually only allows GET/HEAD — form POSTs to a static site return 405.', 'A failing CORS preflight (OPTIONS) can also show up as 405 if the server doesn’t handle OPTIONS.'],
    },
    {
      summary: '资源存在，但不支持这种请求方法。',
      details: '例如向只接受 GET 的接口发送 POST。响应应通过 `Allow` 头列出支持的方法。',
      items: ['核对客户端代码里的请求方法和服务端的路由定义。', '静态托管通常只允许 GET / HEAD，向静态站点提交 POST 表单会得到 405。', '如果服务端没有处理 OPTIONS，CORS 预检请求也可能返回 405。'],
    },
  ),
  s(
    406,
    'Not Acceptable',
    [415],
    {
      summary: 'The server can’t produce a response in a format the client accepts.',
      details: 'Content negotiation failed: nothing matches the request’s `Accept` (or `Accept-Language`, `Accept-Encoding`) header.',
      items: ['Send `Accept: application/json` (or `*/*`) to an API instead of a narrow or unusual type.'],
    },
    {
      summary: '服务端无法生成客户端可接受格式的响应。',
      details: '内容协商失败：没有任何格式符合请求的 `Accept`（或 `Accept-Language`、`Accept-Encoding`）头。',
      items: ['请求接口时发送 `Accept: application/json`（或 `*/*`），不要限制成不常见的类型。'],
    },
  ),
  s(
    408,
    'Request Timeout',
    [504, 499],
    {
      summary: 'The server timed out waiting for the client to finish sending the request.',
      details: 'The connection was idle too long, often because of a slow network or a client that opened a connection without using it.',
      items: ['Retry on a better connection; large uploads may need chunked or resumable upload.', 'Not the same as 504: a 408 means the client was slow, a 504 means an upstream server was slow.'],
    },
    {
      summary: '服务端等待客户端发送完整请求时超时。',
      details: '连接空闲太久，通常是网络慢，或者客户端建立连接后迟迟没有发送数据。',
      items: ['换个网络重试；大文件上传可以改用分片或断点续传。', '与 504 不同：408 是客户端发得太慢，504 是上游服务器响应太慢。'],
    },
  ),
  s(
    409,
    'Conflict',
    [412, 422],
    {
      summary: 'The request conflicts with the current state of the resource.',
      details: 'Typical cases: creating something that already exists (duplicate username) or an edit conflict when two clients update the same resource.',
      items: ['Return a clear message saying what conflicts, so the client can fix it or ask the user.', 'For concurrent edits, use version numbers or ETags with `If-Match` (which returns 412 on mismatch).'],
    },
    {
      summary: '请求与资源当前的状态冲突。',
      details: '典型场景：创建已存在的资源（如用户名重复），或两个客户端同时修改同一资源导致的编辑冲突。',
      items: ['在响应里说明具体冲突的内容，方便客户端修正或提示用户。', '处理并发修改可以使用版本号，或配合 ETag 使用 `If-Match`（不匹配时返回 412）。'],
    },
  ),
  s(
    410,
    'Gone',
    [404, 301],
    {
      summary: 'The resource has been permanently removed and won’t come back.',
      details: 'A stronger 404: it tells clients and search engines the removal is intentional and permanent.',
      items: ['Use it for deleted content or retired API versions. Search engines tend to drop 410 pages faster than 404s.'],
    },
    {
      summary: '资源已被永久删除，不会再恢复。',
      details: '比 404 更明确：告诉客户端和搜索引擎这是有意且永久的删除。',
      items: ['适用于已删除的内容或下线的旧版接口，搜索引擎通常会比 404 更快移除 410 页面。'],
    },
  ),
  s(
    412,
    'Precondition Failed',
    [409, 304],
    {
      summary: 'A condition in the request headers (such as `If-Match`) was not met.',
      details: 'Used for optimistic concurrency: the client says “update only if the version is still X”, and the server refuses because it changed.',
      items: ['Fetch the latest version (and its ETag), merge the changes and retry.'],
    },
    {
      summary: '请求头中的前置条件（如 `If-Match`）不满足。',
      details: '用于乐观并发控制：客户端要求“只有版本仍是 X 时才更新”，而资源已被修改，服务端因此拒绝。',
      items: ['重新获取最新版本（及其 ETag），合并修改后再重试。'],
    },
  ),
  s(
    413,
    'Content Too Large',
    [414, 431, 400],
    {
      summary: 'The request body is larger than the server allows.',
      details: 'Formerly “Payload Too Large”. Usually a file upload or JSON body exceeding a configured limit.',
      items: ['nginx defaults to 1 MB: raise `client_max_body_size`.', 'Check framework limits too, e.g. Express `express.json({ limit })` or Spring `max-file-size`.', 'For big files, upload directly to object storage with a signed URL or use chunked uploads.', 'For LLM APIs, the prompt or images may be too large — compress images or trim the context.'],
    },
    {
      summary: '请求体超过了服务端允许的大小。',
      details: '旧称 “Payload Too Large”。通常是上传文件或 JSON 请求体超过了配置的上限。',
      items: ['nginx 默认只允许 1 MB，调大 `client_max_body_size`。', '同时检查框架限制，例如 Express 的 `express.json({ limit })`、Spring 的 `max-file-size`。', '大文件建议用签名 URL 直传对象存储，或者分片上传。', '调用大模型接口时，可能是提示词或图片太大，压缩图片或精简上下文。'],
    },
  ),
  s(
    414,
    'URI Too Long',
    [413, 431],
    {
      summary: 'The URL is longer than the server is willing to handle.',
      details: 'Usually caused by putting large data into query parameters, or by a redirect loop that keeps appending parameters.',
      items: ['Send large data in a POST body instead of the query string.', 'Check for redirect loops that append the same parameter repeatedly.'],
    },
    {
      summary: 'URL 超出了服务端愿意处理的长度。',
      details: '通常是把大量数据放进了查询参数，或者重定向循环不断追加参数。',
      items: ['大数据放到 POST 请求体中，不要放在查询字符串里。', '检查是否存在不断追加同一参数的重定向循环。'],
    },
  ),
  s(
    415,
    'Unsupported Media Type',
    [400, 406],
    {
      summary: 'The server doesn’t support the request body’s format.',
      details: 'The `Content-Type` header is missing or not one the endpoint accepts.',
      items: ['Send `Content-Type: application/json` for JSON bodies — `fetch` doesn’t set it automatically.', 'For file uploads use `multipart/form-data` and let the browser set the boundary (don’t set the header manually).'],
    },
    {
      summary: '服务端不支持请求体的格式。',
      details: '缺少 `Content-Type` 头，或者不是接口接受的类型。',
      items: ['发送 JSON 时带上 `Content-Type: application/json`，`fetch` 不会自动设置。', '上传文件使用 `multipart/form-data`，并让浏览器自动设置 boundary（不要手动写这个请求头）。'],
    },
  ),
  s(
    418,
    'I’m a teapot',
    [200],
    {
      summary: 'An April Fools’ joke from RFC 2324: the server is a teapot and refuses to brew coffee.',
      details: 'Not meant for real use, but some services return it playfully or to signal they refuse to handle a request (for example blocked bots).',
      items: ['If you get 418 from a real site, you may have been identified as an automated client.'],
    },
    {
      summary: '来自 RFC 2324 的愚人节玩笑：服务器是一个茶壶，拒绝煮咖啡。',
      details: '本不应在实际中使用，但有些服务会用它开玩笑，或表示拒绝处理请求（比如拦截爬虫）。',
      items: ['如果访问真实网站时遇到 418，可能是被识别为自动化程序。'],
    },
  ),
  s(
    422,
    'Unprocessable Content',
    [400, 409],
    {
      summary: 'The request is well-formed but its content fails validation.',
      details: 'The JSON parses fine, but values break business rules — an invalid email, a negative quantity, an end date before the start date.',
      items: ['Read the error details in the body; frameworks such as FastAPI and Rails list each invalid field.', 'Many APIs use 422 for validation errors and 400 for syntax errors.'],
    },
    {
      summary: '请求格式正确，但内容未通过校验。',
      details: 'JSON 能正常解析，但值违反业务规则，比如邮箱不合法、数量为负、结束日期早于开始日期。',
      items: ['查看响应体中的错误详情，FastAPI、Rails 等框架会逐个列出不合法的字段。', '许多接口用 422 表示校验错误，用 400 表示语法错误。'],
    },
  ),
  s(
    429,
    'Too Many Requests',
    [503, 403],
    {
      summary: 'The client sent too many requests in a given time (rate limiting).',
      details: 'The server may include a `Retry-After` header saying how long to wait. Very common with LLM and other metered APIs.',
      items: ['Respect `Retry-After`; otherwise retry with exponential backoff plus random jitter.', 'Reduce concurrency, batch requests, or cache results.', 'For LLM APIs, limits apply to requests and tokens per minute — check your usage tier or request a higher limit.', 'Don’t retry in a tight loop: it keeps you rate-limited.'],
    },
    {
      summary: '客户端在一定时间内发送的请求过多（被限流）。',
      details: '服务端可能会通过 `Retry-After` 头告知需要等待多久。调用大模型等计费接口时非常常见。',
      items: ['遵守 `Retry-After`；没有时用指数退避加随机抖动重试。', '降低并发、合并请求或缓存结果。', '大模型接口同时限制每分钟请求数和 Token 数，查看账户等级或申请提高额度。', '不要在循环里立刻重试，否则会一直被限流。'],
    },
  ),
  s(
    431,
    'Request Header Fields Too Large',
    [413, 400],
    {
      summary: 'The request headers are too large.',
      details: 'Almost always caused by too many or too large cookies, or a very long `Authorization` / `Referer` header.',
      items: ['Clear the site’s cookies; avoid storing large data in cookies.', 'Raise the server limit if needed (e.g. nginx `large_client_header_buffers`, Node `--max-http-header-size`).'],
    },
    {
      summary: '请求头太大。',
      details: '几乎都是 Cookie 太多或太大，或者 `Authorization`、`Referer` 头过长导致的。',
      items: ['清除该站点的 Cookie，避免在 Cookie 里存大量数据。', '必要时调大服务端限制，例如 nginx 的 `large_client_header_buffers`、Node 的 `--max-http-header-size`。'],
    },
  ),
  s(
    451,
    'Unavailable For Legal Reasons',
    [403, 404],
    {
      summary: 'The resource is blocked for legal reasons, such as a court order or government censorship.',
      details: 'The number is a nod to the novel Fahrenheit 451. The response may explain which authority demanded the block.',
      items: ['Usually region-specific — the content may be available elsewhere.'],
    },
    {
      summary: '因法律原因无法提供该资源，例如法院命令或政府审查。',
      details: '数字致敬小说《华氏 451》。响应中可能说明是哪个机构要求屏蔽。',
      items: ['通常与地区有关，内容在其他地区可能可以访问。'],
    },
  ),
  s(
    499,
    'Client Closed Request',
    [408, 504],
    {
      summary: 'nginx-specific: the client closed the connection before the server responded.',
      details: 'Appears in nginx logs, never sent to clients. Usually the user navigated away, a client-side timeout fired, or a load balancer gave up first.',
      items: ['If you see many 499s, your upstream is probably too slow — check the slow endpoints.', 'Make client and load-balancer timeouts longer than the expected response time, or stream long responses.'],
    },
    {
      summary: 'nginx 专用：服务端还没响应，客户端就关闭了连接。',
      details: '只出现在 nginx 日志里，不会发送给客户端。通常是用户离开了页面、客户端超时，或者前面的负载均衡先放弃了。',
      items: ['大量 499 往往说明上游太慢，排查耗时长的接口。', '让客户端和负载均衡的超时时间大于预期响应时间，或者对长任务使用流式响应。'],
    },
    'nginx',
  ),
  s(
    500,
    'Internal Server Error',
    [502, 503],
    {
      summary: 'The server hit an unexpected error.',
      details: 'A generic server-side failure, usually an unhandled exception in application code.',
      items: ['Check the server logs and error tracking for the stack trace — the response rarely says why.', 'Common causes: null/undefined access, failed database queries, missing environment variables, and unhandled input the code didn’t expect.', 'Return 4xx for bad input instead of letting it crash into a 500.'],
    },
    {
      summary: '服务端遇到了意外错误。',
      details: '通用的服务端错误，通常是业务代码抛出了未处理的异常。',
      items: ['查看服务端日志或错误追踪平台里的堆栈信息，响应本身很少说明原因。', '常见原因：空指针 / undefined、数据库查询失败、缺少环境变量、代码没有预料到的输入。', '对于不合法的输入应该返回 4xx，而不是让程序崩成 500。'],
    },
  ),
  s(
    501,
    'Not Implemented',
    [405, 500],
    {
      summary: 'The server doesn’t support the functionality required to fulfil the request.',
      details: 'Usually the HTTP method isn’t recognised by the server at all (unlike 405, where the method exists but isn’t allowed for this resource).',
      items: ['Check for unusual methods or proxies that don’t support them.'],
    },
    {
      summary: '服务端不支持完成请求所需的功能。',
      details: '通常是服务端完全不认识这个 HTTP 方法（405 是方法存在但该资源不允许）。',
      items: ['检查是否使用了不常见的请求方法，或者中间代理不支持该方法。'],
    },
  ),
  s(
    502,
    'Bad Gateway',
    [504, 503, 500],
    {
      summary: 'A gateway or proxy got an invalid response from the upstream server.',
      details: 'nginx, a load balancer or CDN tried to reach your application and the connection failed or returned garbage.',
      items: ['The application process may have crashed or not be listening — check that it’s running and the port matches the proxy config.', 'Check the proxy error log (e.g. “connect() failed” or “upstream prematurely closed connection”).', 'Out-of-memory kills and restarts during deploys are common causes.', 'For PHP-FPM, check that the socket path and pool are correct.'],
    },
    {
      summary: '网关或代理从上游服务器收到了无效响应。',
      details: 'nginx、负载均衡或 CDN 尝试连接你的应用时失败，或者收到了无法识别的响应。',
      items: ['应用进程可能崩溃或没有在监听，确认服务在运行、端口与代理配置一致。', '查看代理的错误日志（例如 “connect() failed”、“upstream prematurely closed connection”）。', '内存不足被系统杀掉、发布时重启都是常见原因。', 'PHP-FPM 要检查 socket 路径和进程池配置。'],
    },
  ),
  s(
    503,
    'Service Unavailable',
    [502, 504, 429],
    {
      summary: 'The server is temporarily unable to handle the request.',
      details: 'Overload, maintenance or no healthy instances behind a load balancer. It may include `Retry-After`.',
      items: ['Retry later with backoff; respect `Retry-After` if present.', 'On your own servers: check health checks, instance counts, connection pools and whether a maintenance mode is on.', 'LLM APIs return 503 (or 529) when overloaded — retry with backoff or fall back to another model.'],
    },
    {
      summary: '服务端暂时无法处理请求。',
      details: '可能是负载过高、正在维护，或负载均衡后面没有健康的实例。响应可能带有 `Retry-After`。',
      items: ['稍后用退避策略重试，有 `Retry-After` 时遵守它。', '如果是自己的服务：检查健康检查、实例数量、连接池，以及是否开启了维护模式。', '大模型接口过载时也会返回 503（或 529），退避重试或切换到其他模型。'],
    },
  ),
  s(
    504,
    'Gateway Timeout',
    [502, 503, 524],
    {
      summary: 'A gateway or proxy didn’t get a response from the upstream server in time.',
      details: 'The application is reachable but too slow: the proxy’s timeout (often 60 seconds) expired first.',
      items: ['Find the slow part: database queries, external API calls, or long LLM generations.', 'Increase proxy timeouts (e.g. nginx `proxy_read_timeout`) only if the work genuinely takes long.', 'Move long tasks to a background job (return 202) or stream the response so data starts flowing early.'],
    },
    {
      summary: '网关或代理没有在规定时间内收到上游服务器的响应。',
      details: '应用可以连通但太慢，代理的超时时间（通常是 60 秒）先到了。',
      items: ['找出慢的环节：数据库查询、外部接口调用，或者耗时较长的大模型生成。', '只有任务确实需要较长时间时，才调大代理超时（如 nginx 的 `proxy_read_timeout`）。', '把长任务改为后台任务（返回 202），或使用流式响应尽早开始返回数据。'],
    },
  ),
  s(
    520,
    'Web Server Returned an Unknown Error',
    [502, 522],
    {
      summary: 'Cloudflare-specific: the origin server returned an empty, unknown or unexpected response.',
      details: 'Cloudflare reached your server but the response was invalid — for example the connection was reset or the headers were too large.',
      items: ['Check origin logs for crashes or resets at that time.', 'Make sure response headers (including cookies) aren’t excessively large.', 'Confirm the origin isn’t blocking Cloudflare’s IP ranges.'],
    },
    {
      summary: 'Cloudflare 专用：源站返回了空的、未知的或意外的响应。',
      details: 'Cloudflare 连上了你的服务器，但响应无效，例如连接被重置或响应头过大。',
      items: ['查看源站同一时间的日志，是否有崩溃或连接重置。', '确认响应头（包括 Cookie）没有过大。', '确认源站防火墙没有拦截 Cloudflare 的 IP 段。'],
    },
    'Cloudflare',
  ),
  s(
    522,
    'Connection Timed Out',
    [504, 524],
    {
      summary: 'Cloudflare-specific: Cloudflare could not establish a TCP connection to the origin.',
      details: 'The origin didn’t answer the connection attempt in time — it may be down, overloaded or blocking Cloudflare.',
      items: ['Check that the origin is up and listening on the right port.', 'Allow Cloudflare IP ranges in your firewall or security group.', 'Verify the DNS record points to the correct origin IP.'],
    },
    {
      summary: 'Cloudflare 专用：Cloudflare 无法与源站建立 TCP 连接。',
      details: '源站没有及时响应连接请求，可能已宕机、负载过高或拦截了 Cloudflare。',
      items: ['确认源站正常运行并在正确的端口监听。', '在防火墙或安全组中放行 Cloudflare 的 IP 段。', '检查 DNS 记录是否指向正确的源站 IP。'],
    },
    'Cloudflare',
  ),
  s(
    524,
    'A Timeout Occurred',
    [504, 522],
    {
      summary: 'Cloudflare-specific: the connection succeeded but the origin didn’t respond within 100 seconds.',
      details: 'Cloudflare’s proxy read timeout (100 seconds on most plans) expired while waiting for the origin.',
      items: ['Speed up the endpoint, or move long-running work to a background job and poll for the result.', 'Stream the response (for example LLM output) so bytes arrive before the timeout.', 'Serve long tasks from a hostname that isn’t proxied by Cloudflare.'],
    },
    {
      summary: 'Cloudflare 专用：已连接到源站，但源站在 100 秒内没有响应。',
      details: 'Cloudflare 等待源站响应的超时时间（大多数套餐为 100 秒）已到。',
      items: ['优化接口速度，或把长任务放到后台执行、再轮询结果。', '使用流式响应（例如大模型输出），在超时前就开始返回数据。', '把长任务放到不经过 Cloudflare 代理的域名上。'],
    },
    'Cloudflare',
  ),
];

export const getStatus = (code: number) => httpStatuses.find((x) => x.code === code);
