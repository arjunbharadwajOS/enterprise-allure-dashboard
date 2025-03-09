# allure-reports-portal

![image](https://github.com/user-attachments/assets/1141b767-eab0-41f8-83af-1539cc92336b)

Simple allure reports server.

Host your allure reports for multiple projects on the same server.

## Dependencies

- nodejs
- npm

## How to use

create folder:

```bash
mkdir enterprise-allure-dashboard
```

clone project to enterprise-allure-dashboard:

```bash
git clone https://github.com/arjunbharadwajOS/enterprise-allure-dashboard.git
```

navigate to allure-reports-portal folder:

```bash
cd enterprise-allure-dashboard/
```

### Docker way

build `Dockerfile` and use it

## Standalone way

install dependencies:

```bash
npm install
```

configure routes for server: (see `Config` section)

start web server

```bash
npm start
```

access via: `yourIPorDomainName:3000` usually locally it's `http://localhost:3000`

You can see all project's links.

## Config

1. add routes (links) to routes array in `config/default.json`:

```json
{
  "routes": ["project1", "project2", "project3"]
  ...
}
```

2. create folder inside `uploads` folder with same name as route:

- `uploads/project1`
- `uploads/project2`
- `uploads/project3`

3. upload all data from generated `allure-report` folder to that project's folder (possible via `scp` or similar).

**note: `uploads/project1/` should contain `index.html` and all files from `allure-report`**

```txt
uploads/
├── project1/
│   ├── index.html from allure-report folder
│   └── all other files and folders from allure-report folder
├── project2/
│   ├── index.html from allure-report folder
│   └── all other files and folders from allure-report folder
└── project3/
    ├── ...
    └── ...
```

**Server restarted after uploading and you can access to report via direct link:** `localhost:3000/project1` or `localhost:3000/project2` or `yourIPorDomainName:3000/project1` and etc

**note: webserver port is 3000 by default, and can be configured in `config/default.json` and if you use Docker, don't forget to change exposed port in Dockerfile  :**

```json
{
  ...
  "port": 3000
}
```

**note: also if you want to customize title of "Allure Reports Portal"**


**you can change settings in `config/default.json`**

```json
{
  ...
  "title": "Name of Company portal"
}
```

## Allure reports with history trends

1. you should create `allure-results` folder inside your project's folder and copy files from **allure-result** folder to that folder after each CI result.

2. generate `allure-report` on the report server based on `allure-results` folder data and copy data from that `allure-report` folder to your project's folder.
