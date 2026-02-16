'use client';


import { Tabs, TabsContent, TabsTrigger, TabsList } from "../../components/ui/tabs";
import Login from "./Login";
import Signup from "./Signup";
import Home from "./HomeScreen"


const Auth = () => {
  return (
    <Tabs defaultValue="login" className="w-[500px]">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Signup</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
            <Login/>
        </TabsContent>
        <TabsContent value="signup">
            <Signup/>
        </TabsContent>
    </Tabs>
  );
};

export default Auth;