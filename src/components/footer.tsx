export function Footer() {
  return (
    <footer className="w-full">
      <div className="site-container footer-container">
        <p
          className="text-[var(--color-footer-text)] dark:text-[var(--color-dark-footer-text)]"
          style={{
            fontFamily: "var(--font-montserrat)",
            fontSize: "var(--footer-font-size)",
          }}
        >
          Made with ❤️ in San Francisco
        </p>
      </div>
    </footer>
  );
}
