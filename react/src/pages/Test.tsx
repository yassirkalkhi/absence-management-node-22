import { useEffect, useState } from "react";



export default function Test() {
    const [name, setName] = useState("");
     
    useEffect(() => {
        console.log("rendered");
    }, [name]);
    
    return (
        <div>
            
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
    );
}