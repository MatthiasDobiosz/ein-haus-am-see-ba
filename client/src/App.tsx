import React, { useEffect, useState } from "react";
import "./App.css";

interface Leo {
  name: string;
}

interface data {
  message: string;
}

function App() {
  const [test, setTest] = useState<Leo>({ name: "hey" });

  useEffect(() => {
    console.log("hey");
    fetch("/test")
      .then((res) => res.json())
      .then((data: data) => setTest({ name: data.message }))
      .catch((err) => console.log(err));
  });

  return <div>{test.name}</div>;
}

export default App;
