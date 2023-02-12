import { observer } from "mobx-react-lite";
import { HelpItem } from "./HelpItem";

interface HelperSection {
  title: string;
  text: string;
}

const helperSections: HelperSection[] = [
  {
    title: "Was sind Filtergruppen",
    text: "In einer Filtergruppe können ein oder mehrere Filter einer Kategorien enthalten sein, die individuell erstellt werden. Filtergruppen kombinieren alle enthaltenen Filter. Hat man zum Beispiel eine Filtergruppe, die einen Filter für See mit Umkreis 500 Meter und einen Filter für Restaurant mit Umkreis 200m beinhaltet, dann werden nur Gebiete angezeigt in denen sowohl ein See in 500 Meter Umkreis als auch ein Restaurant in 200 Meter Umkreis sind. Zusätzlich hat jede Gruppe eine 'Relevanz' die bestimmt wie wichtig dir diese Gruppe im Vergleich zu anderen ist.",
  },
  {
    title: "Erstellen eines Filtergruppe",
    text: "Um eine Filtergruppe zu erstellen gehe zur Filterauswahl und klicke auf einer der Kategorien um die Entität auszuwählen nach der gefiltert werden soll. Klicke dann auf 'neue Gruppe'. Bestimme nun wie wichtig diese Gruppe in der Ansicht gewertet werden soll, sowie die Einstellungen für den ersten Filter dieser Gruppe.",
  },
  {
    title: "Filtereinstellungen",
    text: "Ein Filter hat grundsätzlich 2 Kriterien die du bestimmen kannst. Der Umkreis gibt an wie groß das Gebiet für einen Filter ist. Wählst du zum Beispiel einen Filter Restaurant mit einem Umkreis von 200 Metern, werden nur Gebiete betrachtet die sich in 200 oder weniger Metern Umkreis eines Restaurants befinden. Zusätzlich kannst du bestimmen ob der Filter Gebiete anzeigen soll, die sich in der Nähe des Objekts befinden oder aber mindestens so weit entfernt sind.  ",
  },
  {
    title: "Ansichten",
    text: "Es gibt 3 Ansichten, die du nutzen kannst. In der Gebietsansicht wird die Karte nach deinen Filtergruppen gefiltert und zeigt Gebiete an, die für dich relevant sind. Bei der Ortsansicht werden dir die verschiedenen Filterobjekte auf der Karte farblich markiert. Die Hausansicht kannst du aktivieren, wenn du bei nahem hinzoomen zusätzlich Marker für einzelne Wohnungen oder Häuser sehen möchtest.",
  },
];

export const HelpSection = observer(() => {
  return (
    <div>
      {helperSections.map((section, i) => {
        return <HelpItem title={section.title} text={section.text} key={i} />;
      })}
    </div>
  );
});
