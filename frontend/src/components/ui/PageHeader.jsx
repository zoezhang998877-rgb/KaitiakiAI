/** 页面顶部标题区 */
export default function PageHeader({ eyebrow, title, description }) {
  return (
    <header className="page-header">
      {eyebrow && <div className="page-header__eyebrow">{eyebrow}</div>}
      <h1 className="page-header__title">{title}</h1>
      {description && <p className="page-header__desc">{description}</p>}
    </header>
  );
}
