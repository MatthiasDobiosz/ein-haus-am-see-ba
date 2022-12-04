export interface Filter {
  name: string;
  distance: string;
}

interface FiltersProps {
  activeFilters: Filter[];
}

export const Filters = (props: FiltersProps): JSX.Element => {
  const { activeFilters } = props;

  return (
    <div>
      {activeFilters.length > 0 ? (
        <div>
          {activeFilters.map((filter) => {
            return (
              <p>
                {filter.name} {filter.distance}
              </p>
            );
          })}
        </div>
      ) : (
        <div className="p-[20px]">
          <p className="m-[14px]">Keine Filter sind im Moment aktiv.</p>
          <p className="m-[14px]">
            Klicke auf eine der Kategorien oben, um Filter auszuwählen.
          </p>
        </div>
      )}
    </div>
  );
};
