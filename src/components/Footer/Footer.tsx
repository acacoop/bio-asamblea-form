import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <p>© {currentYear} ACABIO</p>
    </footer>
  );
}
