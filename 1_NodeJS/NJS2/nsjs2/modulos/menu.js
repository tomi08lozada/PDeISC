export function mostrarMenu() {
    return `
    <style>
        nav {
            background: linear-gradient(90deg, #1e3c72, #2a5298);
            padding: 12px;
            display: flex;
            justify-content: center;
            gap: 20px;
            border-radius: 8px;
        }

        nav a {
            color: white;
            text-decoration: none;
            font-family: Arial, sans-serif;
            font-weight: bold;
            padding: 8px 12px;
            border-radius: 5px;
            transition: 0.3s;
        }

        nav a:hover {
            background-color: rgba(255,255,255,0.2);
            transform: scale(1.1);
        }

        hr {
            margin-top: 15px;
            border: none;
            height: 2px;
            background: #ccc;
        }
        @media (max-width: 600px) {
            nav {
                flex-direction: column;
                align-items: center;
            }

            nav a {
                margin: 5px 0;
                font-size: 18px;
    </style>

    <nav>
        <a href="/">Inicio</a>
        <a href="/p2">Pagina 2</a>
        <a href="/p3">Pagina 3</a>
        <a href="/p4">Pagina 4</a>
        <a href="/p5">Pagina 5</a>
    </nav>
    <hr>
    `;
}