/** 通用搜索栏：输入框 + 按钮，支持按 Enter 搜索 */
export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search a New Zealand location...',
  buttonLabel = 'Search',
  loading = false,
  disabled = false
}) {
  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      onSubmit();
    }
  }

  return (
    <div className="search-bar">
      <input
        className="search-bar__input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || loading}
      />
      <button
        type="button"
        className="btn btn--primary"
        onClick={onSubmit}
        disabled={disabled || loading}
      >
        {loading ? 'Loading...' : buttonLabel}
      </button>
    </div>
  );
}
