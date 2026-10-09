import { useEffect, useState } from "react";
import styles from "./App.module.css";
import SiteHeader from "./components/siteHeader";
import SiteFooter from "./components/siteFooter";
import BackToTop from "./components/backToTop";
import GroceryListPlanner from "./components/groceryListPlanner";

const App = () => {
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const onScroll = () => setShowBackToTop(window.scrollY > 50);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div className={styles["app-shell"]} id="top">
            <SiteHeader
                title="Market Day"
                mark="M"
                navItems={[["Shopping list", "#workspace"], ["Add item", "#add"]]}
                repoUrl="https://github.com/a2rp/grocery-list-planner"
            />
            <main className={styles.pageContent}>
                <GroceryListPlanner />
            </main>
            <SiteFooter repoUrl="https://github.com/a2rp/grocery-list-planner" />
            <BackToTop visible={showBackToTop} />
        </div>
    );
};

export default App;