import { Card, CardContent } from "@/components/ui/card";
import { SignIn } from "@clerk/nextjs";

const Login = () => {
  return (
    <div className="px-3">
      <Card>
        <CardContent>
          <SignIn />
        </CardContent>
      </Card>
    </div>
  );
};
export default Login;
