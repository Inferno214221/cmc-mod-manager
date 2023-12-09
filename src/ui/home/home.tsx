import { createRoot } from 'react-dom/client';
import './home.css';
import Nav from '../global/nav';

export function navigate() {
    const root = createRoot(document.body);
    root.render(
        <div><Nav activeTab={'Home'}/></div>
    );
}