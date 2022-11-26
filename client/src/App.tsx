import React, { useEffect, useState } from "react";
import "./App.css";

interface Leo {
  name: string;
}

function App() {
  const [test, setTest] = useState<Leo>({ name: "hey" });

  useEffect(() => {
    console.log("hey");
    fetch("/test")
      .then((res) => res.json())
      .then((data) => setTest({ name: data.message }));
  });
  let i = 1;

  return <div>{test.name}</div>;
}

export default App;
