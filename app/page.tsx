'use client';
import Login from "./components/Login";

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen w-full">
      <Login 
        onLogin={() => {
          console.log('Login');
        }} 
        onRegister={() => {
          console.log('Register');
        }} 
      />
    </div>
  );
}
