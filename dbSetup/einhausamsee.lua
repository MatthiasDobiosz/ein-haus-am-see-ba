/* a lot of the code here is based on: https://github.com/openstreetmap/osm2pgsql/tree/master/flex-config */

local points = osm2pgsql.define_node_table('points', {
    { column = 'name' },
    { column = 'subclass' },
    { column = 'geom', type = 'point', not_null = true },
})

local ways = osm2pgsql.define_way_table('ways', {
    { column = 'name' },
    { column = 'subclass' },
    { column = 'geom', type = 'linestring', not_null = true },
})

local polygons = osm2pgsql.define_area_table('polygons', {
{ column = 'name' },
{ column = 'subclass' },
{ column = 'geom', type = 'geometry', not_null = true },
})

local relations = osm2pgsql.define_relation_table('relations', {
{ column = 'name' },
{ column = 'subclass' },
{ column = 'geom', type = 'multilinestring', not_null = true },
})


function process_geom(object, geom, table)

if (object.tags.amenity == 'university' or object.tags.amenity == 'college') then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'university'
    })
end
if (object.tags.amenity == 'pub' or object.tags.amenity == 'bar' or object.tags.amenity == 'biergarten') then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'pub'
    })
end
if object.tags.amenity == 'restaurant' then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'restaurant'
    })
end
if object.tags.amenity == 'school' then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'school'
    })
end
if object.tags.amenity == 'kindergarten' then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'kindergarten'
    })
end
if object.tags.amenity == 'hospital' then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'hospital'
    })
end
if object.tags.amenity == 'clinic' then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'clinic'
    })
end
if object.tags.amenity == 'pharmacy' then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'pharmacy'
    })
end
if object.tags.amenity == 'cinema' then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'cinema'
    })
end
if object.tags.amenity == 'theatre' then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'theatre'
    })
end
if object.tags.shop == 'supermarket' then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'supermarket'
    })
end
if object.tags.amenity == 'cafe' then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'cafe'
    })
end
if (object.tags.shop == 'department_store' or object.tags.shop == 'mall') then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'mall'
    })
end
if object.tags.amenity == 'parking' then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'parking'
    })
end
if ( (object.tags.public_transport == 'stop_position' and object.tags.bus == 'yes') or object.tags.highway == 'bus_stop') then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'busstop'
    })
end
if (object.tags.highway == 'motorway' or object.tags.highway == 'motorway_link') then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'highway'
    })
end
if (object.tags.leisure == 'park' or object.tags.leisure == 'nature_reserve' or object.tags.landuse == 'village_green' or object.tags.landuse == 'recreation_ground') then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'park'
    })
end
if (object.tags.public_transport == 'stop_position' and object.tags.railway == 'stop') then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'railwaystation'
    })
end
if (object.tags.landuse == 'forest' or object.tags.natural == 'wood') then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'forest'
    })
end
if object.tags.waterway == 'river' then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'river'
    })
end
if (object.tags.natural == 'water' and object.tags.water == 'lake') then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'lake'
    })
end
if (object.tags.boundary == 'administrative' and object.tags.name == 'Bamberg') then
    table:insert({
        name = object.tags.name,
        geom = geom,
        subclass = 'city'
    })
end
end

function has_area_tags(tags)
if tags.area == 'yes' then
    return true
end
if tags.area == 'no' then
    return false
end

return tags.aeroway
    or tags.amenity
    or tags.building
    or tags.harbour
    or tags.historic
    or tags.landuse
    or tags.leisure
    or tags.man_made
    or tags.military
    or tags.natural
    or tags.office
    or tags.place
    or tags.power
    or tags.public_transport
    or tags.shop
    or tags.sport
    or tags.tourism
    or tags.water
    or tags.waterway
    or tags.wetland
    or tags['abandoned:aeroway']
    or tags['abandoned:amenity']
    or tags['abandoned:building']
    or tags['abandoned:landuse']
    or tags['abandoned:power']
    or tags['area:highway']
end

-- Helper function to remove some of the tags we usually are not interested in.
-- Returns true if there are no tags left.
function clean_tags(tags)
tags.odbl = nil
tags.created_by = nil
tags.source = nil
tags['source:ref'] = nil

return next(tags) == nil
end

function osm2pgsql.process_node(object)
    process_geom(object, object:as_point(), points)
end

function osm2pgsql.process_way(object)
if object.is_closed and has_area_tags(object.tags) then
    process_geom(object, object:as_linestring(), ways)
else
    process_geom(object, object:as_linestring(), ways)
end
end

function osm2pgsql.process_relation(object)
if clean_tags(object.tags) then
    return
end

local relation_type = object:grab_tag('type')

-- Store multipolygon relations as multipolygons
if relation_type == 'multipolygon' then
    process_geom(object, object:as_multipolygon(), polygons)
end

-- Store boundary relations as multilinestrings
if relation_type == 'boundary' then 
    process_geom(object, object:as_multilinestring(), relations)
end

if relation_type == 'waterway' then
    process_geom(object, object:as_multilinestring(), relations)
end

if relation_type == 'route' then
    process_geom(object, object:as_multilinestring(), relations)
end

if relation_type == 'public_transport' then
    process_geom(object, object:as_multilinestring(), relations)
end
end