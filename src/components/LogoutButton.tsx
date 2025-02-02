"use client";
import { signOut } from "next-auth/react";
import Button from "./ui/Button";
import { ButtonHTMLAttributes, FC, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, LogOut } from "lucide-react";

interface LogOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const LogoutButton: FC<LogOutButtonProps> = ({ ...props }) => {
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
  return (
    <Button
      {...props}
      variant="ghost"
      onClick={async () => {
        setIsSigningOut(true);
        try {
          await signOut();
        } catch (error) {
          toast.error("Error signing out");
        } finally {
          setIsSigningOut(false);
        }
      }}
    >
      {isSigningOut ? (
        <Loader2 className="animate-spin h-4 w-4" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
    </Button>
  );
};

export default LogoutButton;
