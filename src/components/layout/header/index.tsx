import Link from "next/link";
import { useSession } from "next-auth/react";
import styles from "./style.module.css";

export const Header = () => {
  const { data: session } = useSession();

  return (
    <header className={styles.header}>
      <Link href="/" style={{ fontWeight: "bold", fontSize: "1.25rem" }}>
        Messaging App
      </Link>
      <nav style={{}}>
        <ul className="flex gap-1 ">
          <li>
            <Link href="/button1" className={styles.navBtns}>
              Button1
            </Link>
          </li>
          <li>
            <Link href="/button2" className={styles.navBtns}>
              Button2
            </Link>
          </li>
          <li>
            <Link href="/button3" className={styles.navBtns}>
              Button3
            </Link>
          </li>
          <li>
            <Link href="/button4" className={styles.navBtns}>
              Button4
            </Link>
          </li>
          <li>
            <Link href="/button5" className={styles.navBtns}>
              Button5
            </Link>
          </li>
        </ul>
      </nav>
      {!session?.user ? (
        <Link href="/login" className={styles.authLink}>
          Login
        </Link>
      ) : (
        <Link href="/channels/me" className={styles.authLink}>
          Open App
        </Link>
      )}
    </header>
  );
};
