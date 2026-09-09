---
locale: de
type: lottery
uuid: 67c4ba4e-8c06-4428-aa5e-7f9e3b9a2426
key: gewinnspiel-2026-03
heading: Gewinnspiel
intro: Mache mit bei unserem Gewinnspiel und gewinne einen von 10 Gutscheinen
  für die RathausGalerien im Wert von jeweils 100 €!
date: ""
images:
  - /media/lottery/rhg_mall_flanieren_web.jpg
form:
  name: lottery-2026-03
  state:
    idle:
      button: Teilnehmen1
    sending:
      button: Wird gesendet...
    success:
      title: Vielen Dank für deine Teilnahme!
      content: Wir wünschen dir viel Glück!
      button: Zurück zur Startseite
    failure:
      title: Bitte entschuldige...
      content: ...aber die Teilnahme konnte nicht verarbeitet werden - bitte versuche
        es erneut!
      errors:
        required: Dieses Feld wird benötigt.
    retrying:
      button: Noch einmal versuchen
  fields:
    - name: name
      label: Name
      type: TEXT
      required: true
    - name: age
      label: Alter
      type: TEXT
      required: true
    - name: question
      label: Wie würdest du deinen Besuch in den RathausGalerien beschreiben?
      type: SELECT
      required: true
      options:
        - label: Gezielter Einkauf
          value: option-1
        - label: Bummeln & inspirieren lassen
          value: option-2
        - label: Treffpunkt mit Freunden
          value: option-3
    - name: email
      label: E-Mail
      type: EMAIL
      required: true
    - name: terms
      label: Ich akzeptiere die [Teilnahmebedingungen](/datenschutz)
      type: CHECKBOX
      required: true
    - type: TEXT
      required: true
      name: input
      label: Ort
seo:
  title: Gewinnspiel
  description: Mache mit bei unserem Gewinnspiel und gewinne einen von 10
    Gutscheinen für die RathausGalerien im Wert von jeweils 100 €!
  url: gewinnspiel
---
Mach mit bei unserem Gewinnspiel und sichere dir die Chance auf einen von 10 Gutscheinen für die RathausGalerien im Wert von jeweils 100 €!

Fülle dazu einfach alle untenstehenden Felder aus.

Viel Glück!
