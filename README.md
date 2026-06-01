# Rathausgalerien Gatsby + Decap CMS

Gatsby-Projekt mit Decap CMS Admin-Bereich unter `/admin/`.

## Entwicklung starten

```shell
npm run develop
```

Website: <http://localhost:8000>

CMS: <http://localhost:8000/admin/>

## Decap CMS lokal testen

Für lokale CMS-Änderungen läuft Decap über den offiziellen lokalen Backend-Proxy. Starte dafür zwei Terminals:

```shell
npm run develop
```

```shell
npm run cms:proxy
```

Danach öffnest du <http://localhost:8000/admin/>. Durch `local_backend: true` nutzt Decap lokal den Proxy und schreibt Änderungen direkt in die Dateien im Repository.

## Produktive Anmeldung

Die produktive Konfiguration ist auf Decaps `git-gateway` vorbereitet:

```yaml
backend:
  name: git-gateway
  branch: main
```

Damit echte Logins funktionieren, muss beim Hosting Git Gateway/Identity eingerichtet sein, z. B. auf Netlify:

1. Site mit dem Git-Repository verbinden.
2. Netlify Identity aktivieren.
3. Git Gateway aktivieren.
4. Benutzer einladen oder Registrierung konfigurieren.
5. Deployment öffnen und `/admin/` aufrufen.

Ohne Git-Gateway/Identity funktioniert produktiv kein Login, weil Decap Schreibrechte auf das Repository authentifizieren muss.

## CMS-Struktur

- Admin UI: `static/admin/index.html`
- CMS-Konfiguration: `static/admin/config.yml`
- Seiten: `content/pages/*.mdx`
- News: `content/news/*.mdx`
- Website-Einstellungen: `content/settings/site.yml`
- Uploads: `static/uploads/`

Decap CMS wird bewusst per CDN-Script eingebunden und **nicht** als `decap-cms-app` npm-Paket installiert.
