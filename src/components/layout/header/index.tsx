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
            <Link href="#" className={styles.navBtns}>
              Button1
            </Link>
          </li>
          <li>
            <Link href="#" className={styles.navBtns}>
              Button2
            </Link>
          </li>
          <li>
            <Link href="#" className={styles.navBtns}>
              Button3
            </Link>
          </li>
          <li>
            <Link href="#" className={styles.navBtns}>
              Button4
            </Link>
          </li>
          <li>
            <Link href="#" className={styles.navBtns}>
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
