"use client"

import { Bell, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/lib/auth"

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const { user, logout } = useAuthStore()

  return (
    <header className="bg-white border-b border-purple-100 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-black to-purple-800">{title}</h1>
          <div className="text-xs uppercase tracking-wider text-purple-600 mt-1">SUPERBAD.STORE Admin Panel</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            <p className="text-sm text-gray-700">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              {user?.name || 'Admin'}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
