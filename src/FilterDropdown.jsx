function FilterDropdown({ options, shownTypes, onToggle, onToggleAll }) {
    const allShown = shownTypes.length === options.length;

    let buttonLabel = options
        .filter((option) => shownTypes.includes(option.type))
        .map((option) => option.label)
        .join(", ");
    if (allShown) {
        buttonLabel = "All";
    } else if (shownTypes.length === 0) {
        buttonLabel = "None";
    }

    return (
        <details className="filter-dropdown">
            <summary>Show: {buttonLabel} ▾</summary>
            <ul>
                <li>
                    <button type="button" onClick={onToggleAll}>
                        <span className="check">{allShown && "✓"}</span>All
                    </button>
                </li>
                {options.map((option) => (
                    <li key={option.type}>
                        <button type="button" onClick={() => onToggle(option.type)}>
                            <span className="check">{shownTypes.includes(option.type) && "✓"}</span>{option.label}
                        </button>
                    </li>
                ))}
            </ul>
        </details>
    );
}

export default FilterDropdown;
