import { UserAvatar } from "../user-avatar";

export default function UserAvatarExample() {
  return (
    <div className="flex items-center gap-4 p-8">
      <UserAvatar 
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
        alt="John Doe"
        fallback="JD"
      />
      <UserAvatar 
        alt="Jane Smith"
        fallback="JS"
      />
      <UserAvatar alt="User" />
    </div>
  );
}
