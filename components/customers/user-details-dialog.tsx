import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function UserDetailsDialog({
  isOpen,
  onClose,
  user,
}: UserDetailsDialogProps) {
  if (!user) return null;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            Complete information about this customer
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 mt-4">
          {/* Header with avatar and main info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.name} />
              ) : (
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant={user.role === "admin" ? "outline" : "default"}>
                  {user.role || "User"}
                </Badge>
                <Badge
                  variant={user.deletedAt ? "destructive" : "default"}
                  className={user.deletedAt ? "bg-red-100 text-red-800" : ""}
                >
                  {user.deletedAt ? "Deleted" : "Active"}
                </Badge>
                <Badge
                  variant={user.emailConfirmed ? "default" : "secondary"}
                >
                  {user.emailConfirmed ? "Email Verified" : "Email Unverified"}
                </Badge>
                {user.phoneNumberConfirmed && (
                  <Badge variant="default">Phone Verified</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Details section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-gray-500">ID</p>
              <p className="font-medium break-all">{user.id}</p>
            </div>
            
            {user.phoneNumber && (
              <div className="space-y-1">
                <p className="text-gray-500">Phone Number</p>
                <p className="font-medium">{user.phoneNumber}</p>
              </div>
            )}
            
            <div className="space-y-1">
              <p className="text-gray-500">Created At</p>
              <p className="font-medium">{formatDate(user.createdAt)}</p>
            </div>
            
            {user.createdBy && (
              <div className="space-y-1">
                <p className="text-gray-500">Created By</p>
                <p className="font-medium">{user.createdBy}</p>
              </div>
            )}
            
            {user.updatedAt && (
              <div className="space-y-1">
                <p className="text-gray-500">Last Updated</p>
                <p className="font-medium">{formatDate(user.updatedAt)}</p>
              </div>
            )}
            
            {user.updatedBy && (
              <div className="space-y-1">
                <p className="text-gray-500">Updated By</p>
                <p className="font-medium">{user.updatedBy}</p>
              </div>
            )}
            
            {user.deletedAt && (
              <div className="space-y-1">
                <p className="text-gray-500">Deleted At</p>
                <p className="font-medium">{formatDate(user.deletedAt)}</p>
              </div>
            )}
            
            {user.deletedBy && (
              <div className="space-y-1">
                <p className="text-gray-500">Deleted By</p>
                <p className="font-medium">{user.deletedBy}</p>
              </div>
            )}
          </div>

          {/* Cover image if available */}
          {user.coverUrl && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Cover Image</p>
              <div className="rounded-md overflow-hidden h-32">
                <img
                  src={user.coverUrl}
                  alt="User cover"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
