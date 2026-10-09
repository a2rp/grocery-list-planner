import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiPlus, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import ConfirmDialog from "../confirmDialog";
import styles from "./styles.module.css";

const storageKey = "market-day-list";
const starterItems = [
    { id: 1, name: "Avocados", amount: "3", aisle: "Produce", price: 4.5, checked: false },
    { id: 2, name: "Sourdough loaf", amount: "1", aisle: "Bakery", price: 5, checked: true },
    { id: 3, name: "Oat milk", amount: "2 cartons", aisle: "Dairy & alternatives", price: 7.2, checked: false },
    { id: 4, name: "Cherry tomatoes", amount: "1 box", aisle: "Produce", price: 4, checked: false },
    { id: 5, name: "Dark chocolate", amount: "2 bars", aisle: "Pantry", price: 6, checked: true },
];
const aisles = ["Produce", "Bakery", "Dairy & alternatives", "Pantry", "Frozen", "Other"];

const readItems = () => {
    try {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : starterItems;
    } catch {
        return starterItems;
    }
};

const GroceryListPlanner = () => {
    const [items, setItems] = useState(readItems);
    const [filter, setFilter] = useState("All items");
    const [aisle, setAisle] = useState("Every aisle");
    const [draft, setDraft] = useState({ name: "", amount: "1", aisle: "Produce", price: "" });
    const [pendingDelete, setPendingDelete] = useState(null);

    useEffect(() => localStorage.setItem(storageKey, JSON.stringify(items)), [items]);
    const remaining = items.filter((item) => !item.checked).length;
    const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const checkedTotal = items.filter((item) => item.checked).reduce((sum, item) => sum + Number(item.price || 0), 0);
    const visibleItems = useMemo(() => items.filter((item) => {
        const matchesStatus = filter === "All items" || (filter === "To get" ? !item.checked : item.checked);
        return matchesStatus && (aisle === "Every aisle" || item.aisle === aisle);
    }), [items, filter, aisle]);

    const addItem = (event) => {
        event.preventDefault();
        if (!draft.name.trim()) return;
        setItems((current) => [...current, { ...draft, name: draft.name.trim(), price: Number(draft.price) || 0, id: Date.now(), checked: false }]);
        setDraft({ name: "", amount: "1", aisle: "Produce", price: "" });
    };
    const toggleItem = (id) => setItems((current) => current.map((item) => item.id === id ? { ...item, checked: !item.checked } : item));
    const removeItem = () => {
        setItems((current) => current.filter((item) => item.id !== pendingDelete.id));
        setPendingDelete(null);
    };

    return (
        <section className={styles.groceryListPlanner} id="workspace">
            <div className={styles.intro}>
                <div><p className={styles.label}>THE MARKET LIST</p><h1>Shop the list.<br /><span>Keep the day.</span></h1><p className={styles.description}>A tidy list for the things you actually need.</p></div>
                <div className={styles.basketNote}><span><FiShoppingCart aria-hidden="true" /></span><div><strong>{remaining}</strong><p>left to pick up</p></div></div>
            </div>

            <div className={styles.statsRow}>
                <div><span>Estimated basket</span><strong>{"$" + total.toFixed(2)}</strong></div>
                <div><span>Already in the cart</span><strong>{"$" + checkedTotal.toFixed(2)}</strong></div>
                <div><span>Aisles to visit</span><strong>{new Set(visibleItems.filter((item) => !item.checked).map((item) => item.aisle)).size}</strong></div>
            </div>

            <div className={styles.listLayout}>
                <section className={styles.listPanel} aria-label="Grocery list">
                    <div className={styles.listHeading}><div><h2>Shopping list</h2><p>Tap a circle as it goes in your basket.</p></div><label className={styles.aisleFilter}><span>Aisle</span><select value={aisle} onChange={(event) => setAisle(event.target.value)}><option>Every aisle</option>{aisles.map((name) => <option key={name}>{name}</option>)}</select></label></div>
                    <div className={styles.filters} role="group" aria-label="Filter shopping list">
                        {["All items", "To get", "In cart"].map((option) => <button key={option} type="button" className={filter === option ? styles.activeFilter : ""} onClick={() => setFilter(option)}>{option}<span>{option === "All items" ? items.length : option === "To get" ? remaining : items.length - remaining}</span></button>)}
                    </div>
                    <ul className={styles.itemList}>
                        {visibleItems.map((item) => (
                            <li className={item.checked ? styles.checkedRow : ""} key={item.id}>
                                <button className={styles.checkButton} type="button" aria-pressed={item.checked} aria-label={(item.checked ? "Uncheck " : "Check off ") + item.name} onClick={() => toggleItem(item.id)}>{item.checked && <FiCheck aria-hidden="true" />}</button>
                                <div className={styles.itemName}><strong>{item.name}</strong><span>{item.aisle}</span></div>
                                <span className={styles.amount}>{item.amount}</span>
                                <strong className={styles.price}>{"$" + Number(item.price).toFixed(2)}</strong>
                                <button className={styles.deleteButton} type="button" aria-label={"Remove " + item.name} onClick={() => setPendingDelete(item)}><FiTrash2 aria-hidden="true" /></button>
                            </li>
                        ))}
                        {visibleItems.length === 0 && <li className={styles.emptyState}>Nothing in this view yet. Add an item below.</li>}
                    </ul>
                    <form className={styles.addForm} id="add" onSubmit={addItem}>
                        <div className={styles.formTitle}><FiPlus aria-hidden="true" /><strong>Add to the list</strong></div>
                        <label>Item<input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="What do you need?" /></label>
                        <label>Amount<input value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: event.target.value })} /></label>
                        <label>Aisle<select value={draft.aisle} onChange={(event) => setDraft({ ...draft, aisle: event.target.value })}>{aisles.map((name) => <option key={name}>{name}</option>)}</select></label>
                        <label>Est. price<input type="number" min="0" step="0.01" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} placeholder="0.00" /></label>
                        <button type="submit" className={styles.addButton}>Add item <FiPlus aria-hidden="true" /></button>
                    </form>
                </section>

                <aside className={styles.sidePanel}>
                    <div className={styles.sideIcon}><FiShoppingCart aria-hidden="true" /></div>
                    <h2>In the basket</h2>
                    <p>Check items off as you shop. Your estimate updates along with it.</p>
                    <div className={styles.basketProgress}><span style={{ width: (items.length ? (items.length - remaining) / items.length * 100 : 0) + "%" }} /></div>
                    <div className={styles.progressLabels}><span>{items.length - remaining} picked up</span><span>{items.length} total</span></div>
                    <div className={styles.basketTotal}><span>Checked items</span><strong>{"$" + checkedTotal.toFixed(2)}</strong></div>
                    <button type="button" className={styles.resetButton} onClick={() => setItems((current) => current.map((item) => ({ ...item, checked: false })))} disabled={remaining === items.length}>Unmark picked items</button>
                    <p className={styles.localNote}>Your list is saved in this browser.</p>
                </aside>
            </div>

            {pendingDelete && <ConfirmDialog title="Remove this grocery item?" description={"â€œ" + pendingDelete.name + "â€ will be removed from your list."} onCancel={() => setPendingDelete(null)} onConfirm={removeItem} />}
        </section>
    );
};

export default GroceryListPlanner;

