---
locale: de
key: lottery
type: page
template: standard
menu: null
order: 2
seo:
  description: Mache mit bei unserem Gewinnspiel und gewinne 1 von 10 Tickets für das Innsbruck Winter Dance Festival 2026!
  title: Gewinnspiel
  url: gewinnspiel
form:
  name: lottery-march-2026
  state:
    idle:
      button: "Teilnehmen"
    sending:
      button: "In Verarbeitung..."
    success:
      title: "Vielen Dank für deine Teilnahme!"
      content: "Wir wünschen dir viel Glück!"
      button: "Zurück zur Startseite"
    failure:
      title: "Bitte entschuldige..."
      content: "...aber die Teilnahme konnte nicht verarbeitet werden - bitte versuche es erneut!"
      errors:
        required: "Dieses Feld wird benötigt."
    retrying:
      button: "Noch einmal probieren"
      
  fields:
    - name: name
      label: "Name"
      type: TEXT
      required: true
    - name: age
      label: "Alter"
      type: TEXT
      required: true
    - name: question
      label: "Wie würdest du deinen Besuch in den RathausGalerien beschreiben?"
      type: SELECT
      required: true
      options:
        - label: "Gezielter Einkauf"
          value: "option-1"
        - label: "Bummeln & inspirieren lassen"
          value: "option-2"
        - label: "Treffpunkt mit Freunden"
          value: "option-3"
    - name: email
      label: "E-Mail"
      type: EMAIL
      required: true
    - name: terms
      label: "Ich akzeptiere die [Teilnahmebedingungen](/datenschutz)"
      type: CHECKBOX
      required: true
---
Mach mit bei unserem Gewinnspiel und sichere dir die Chance auf einen von 10 Gutscheinen für die RathausGalerien im Wert von jeweils 100 €!
Fülle dazu einfach alle untenstehenden Felder aus.

Viel Glück!
