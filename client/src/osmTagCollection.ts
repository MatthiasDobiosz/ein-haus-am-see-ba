/* eslint-disable quotes */

export interface complexQuery {
  dataTable: string;
  conditions: string[];
}

//TODO merge these two to reduce duplicate code
export const enum TagNames {
  Bar = "Bar",
  Restaurant = "Restaurant",
  Cafe = "Cafe",
  University = "Universität und Hochschule",
  School = "Schule",
  Supermarket = "Supermarkt",
  Mall = "Einkaufszentrum",
  Parking = "Parkplatz",
  BusStop = "Bushaltestelle",
  RailwayStation = "Bahnhof",
  Highway = "Autobahn",
  Parks = "Parks und Grünflächen",
  Forest = "Wald",
  River = "Fluss",
}
export const TagColors = new Map([
  ["Bar", "#7209b7"],
  ["Restaurant", "#e63946"],
  ["Cafe", "#38a3a5"],
  ["Schule", "#aa998f"],
  ["Parks und Grünflächen", "#90be6d"],
  ["Universität und Hochschule", "#cb997e"],
  ["Supermarkt", "#fe7f2d"],
  ["Einkaufszentrum", "#f20089"],
  ["Bahnhof", "#a44a3f"],
  ["Bushaltestelle", "#00b4d8"],
  ["Parkplatz", "#de9e36"],
  ["Autobahn", "#f4a261"],
  ["Fluss", "#1d3557"],
  ["Wald", "#386641"],
]);

class TagCollection {
  getQueryForCategoryPostGIS(tag: string): string {
    return "subclass = '" + this.getSubclass(tag) + "'";
  }

  // returns subclass name that matches PostGIS entries
  getSubclass(tag: string): string {
    switch (tag) {
      case TagNames.Bar:
        return "pub";

      case TagNames.Restaurant:
        return "restaurant";

      case TagNames.Cafe:
        return "cafe";

      case TagNames.University:
        return "university";

      case TagNames.School:
        return "school";

      case TagNames.Supermarket:
        return "supermarket";

      case TagNames.Mall:
        return "mall";

      case TagNames.Parking:
        return "parking";

      case TagNames.BusStop:
        return "busstop";

      case TagNames.RailwayStation:
        return "railwaystation";

      case TagNames.Highway:
        return "highway";

      case TagNames.Parks:
        return "park";

      case TagNames.Forest:
        return "forest";

      case TagNames.River:
        return "river";

      default:
        throw new Error(
          "Unknown input value for osm tag! No suitable key was found!"
        );
    }
  }
}

export default new TagCollection();
