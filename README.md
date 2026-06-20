Global Node.js package for formal writing in the style of *skripsi*, *makalah*, *proposal* commonly used in Indonesia.

**To install:**

```sh
npm install @zxp/skripsify -g --registry http://100.117.40.23:4873
```

**To use:**

- Make a project folder.
- Add `/assets` folder (optional).
- Add a markdown file.
- Run by `skripsify` if installed globally. Run by `npx @zxp/skripsify` if installed locally.
- Open `localhost:8080/paper/<your_md_file>` to see the document.

**Configuring port and host**

Set `SKRIPSIFY_PORT` or `PORT` to change the port, and `SKRIPSIFY_HOST` or `HOST` to change the bind address. Example:

```sh
SKRIPSIFY_PORT=3000 SKRIPSIFY_HOST=0.0.0.0 skripsify
```

or when running directly

```sh
PORT=3000 node .
```

Defaults are port `8080` and host `127.0.0.1`. Use `0.0.0.0` to bind publicly.