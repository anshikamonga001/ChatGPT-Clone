import "./Sidebar.css";

function Sidebar(){
    return (
        <section className="sidebar">
            {/* new chat button */}
            <button>
                <img src="src/assets/blacklogo.png" alt="gpt logo" className="logo" />
                <span><i className="fa-regular fa-pen-to-square"></i></span>
            </button>

            {/* history */}
            <ul className="history">
                <li>thread1</li>
                <li>thread2</li>
                <li>thread3</li>
            </ul>

            {/* sign */}
            <div className="sign">
                <p>By AnshikaMonga &hearts;</p>
            </div>
        </section>
    )
}

export default Sidebar;