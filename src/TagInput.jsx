import { useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { hasTag } from "./goalTags";

// Picked tags sit as pills inside the box, with the typing space after them.
// Enter or a comma adds a tag; clicking away adds a half-typed one too (e.g. straight onto Add goal).
// Tags used before on the same game show underneath as suggestions
function TagInput({ tags, suggestions, onChange }) {
    const inputId = useId();
    const inputRef = useRef(null);
    const [typed, setTyped] = useState("");
    const unusedSuggestions = suggestions.filter((tag) => !hasTag(tags, tag));

    function addTag(tag) {
        const cleanTag = tag.trim();
        if (cleanTag && !hasTag(tags, cleanTag)) {
            onChange([...tags, cleanTag]);
        }
        setTyped("");
    }

    function handleKeyDown(event) {
        if (event.key === "Enter" || event.key === ",") {
            // Enter would otherwise submit the whole goal form
            event.preventDefault();
            addTag(typed);
        }
    }

    return (
        <div className="form-field wide">
            <label htmlFor={inputId} className="label">
                Tags <span className="optional">optional</span>
            </label>
            {/* Clicking anywhere in the box (not just the typing space) puts the cursor in it */}
            <div className="tag-field" onClick={() => inputRef.current.focus()}>
                {tags.map((tag) => (
                    <span key={tag} className="badge tag-pill">
                        {tag}
                        <button
                            type="button"
                            className="tag-remove"
                            aria-label={"Remove tag " + tag}
                            onClick={() => onChange(tags.filter((existingTag) => existingTag !== tag))}
                        >
                            <X size={12} aria-hidden="true" />
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    id={inputId}
                    placeholder={tags.length > 0 ? "Add another" : "e.g. Story, then press Enter"}
                    value={typed}
                    onChange={(event) => setTyped(event.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => addTag(typed)}
                />
            </div>
            {unusedSuggestions.length > 0 && (
                <div className="tag-suggestions">
                    <span className="field-hint">Used before:</span>
                    {unusedSuggestions.map((tag) => (
                        <button key={tag} type="button" className="chip" onClick={() => addTag(tag)}>
                            + {tag}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TagInput;
