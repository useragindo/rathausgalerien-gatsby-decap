---
locale: de
type: lottery
uuid: 99f637bf-a7cd-403a-8380-5c620b509bef
key: fahrschein
heading: Fahrschein zu gewinnen
intro: Gewinne einen Fahrschein vom VVT von deiner Heimatadresse zu den
  Rathausgalerien und wieder nach Hause.
date: 2026-09-14T15:17:00.000Z
text_color: ""
background_color: ""
form:
  state:
    idle:
      button: Teilnehmen
    sending:
      button: Wird gesendet...
    success:
      title: Vielen Dank für deine Teilnahme!
      button: Zurück zur Startseite
    failure:
      title: Bitte entschuldige...
      errors:
        required: Dieses Feld wird benötigt.
    retrying:
      button: Noch einmal versuchen
  fields:
    - type: CHECKBOX
      required: true
      name: input
      label: Willst du einen Fahrschein?
  name: fahrscheinspiel-20260914
seo:
  ogType: website
  twitterCard: summary_large_image
  noIndex: false
  url: fahrschein
---
Eine Aktion von agindo
