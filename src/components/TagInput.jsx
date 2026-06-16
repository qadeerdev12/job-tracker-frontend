import { useState } from "react";
import { inputClass, PRESET_TAGS } from "../utils/constants";
import { getTagColor } from "../utils/helpers";

export default function TagInput({ tags, setTags, allTags }) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = [...new Set([...PRESET_TAGS, ...allTags])]
    .filter((t) => !tags.includes(t) && t.toLowerCase().includes(input.toLowerCase()))
    .slice(0, 8);

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setInput("");
    setShowSuggestions(false);
  };

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="relative">
      <div className={`${inputClass} flex flex-wrap gap-1.5 min-h-[42px] py-1.5 px-2.5 cursor-text`} onClick={() => document.getElementById("tag-input-field")?.focus()}>
        {tags.map((tag) => (
          <span key={tag} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${getTagColor(tag)}`}>
            {tag}
            <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(tag); }} className="hover:opacity-70">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </span>
        ))}
        <input
          id="tag-input-field"
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Type or select tags..." : ""}
          className="flex-1 min-w-[100px] outline-none bg-transparent text-sm py-1"
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-card border border-line-strong rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {suggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addTag(tag)}
              className="w-full text-left px-3 py-2 text-sm text-body hover:bg-brand-50 hover:text-brand-700 transition-colors"
            >
              <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium mr-2 ${getTagColor(tag)}`}>{tag}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
