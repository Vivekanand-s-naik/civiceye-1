import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface UserAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
}

export function UserAvatar({ src, alt = "User", fallback, className }: UserAvatarProps) {
  const initials = fallback || alt.slice(0, 2).toUpperCase();
  
  return (
    <Avatar className={className} data-testid="avatar-user">
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>
        {fallback ? initials : <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
}
