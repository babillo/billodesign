import { Button } from "@/components/ui/Button";
import styles from "./not-found.module.css";

export const metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>Page Not Found</h1>
        <p>The page you are looking for doesn&apos;t exist or has been moved</p>
        <Button href="/">Go Home</Button>
      </div>
    </section>
  );
}
