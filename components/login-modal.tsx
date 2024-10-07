import { SignIn } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none shadow-none bg-transparent w-full max-w-md mx-auto">
        <div className="relative w-full h-full min-h-[400px] flex flex-col">
          <div className="flex-grow flex items-center justify-center p-4">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full max-w-sm mx-auto",
                  card: "shadow-lg",
                },
              }}
              routing="hash"
              redirectUrl="/"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
