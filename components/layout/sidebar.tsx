"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Users, Package, Menu, X, LogOut, Home, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth"
import { Button } from "@/components/ui/button"

const navigation = [
	{ name: "Dashboard", href: "/", icon: Home },
	{ name: "Customers", href: "/customers", icon: Users },
	{ name: "Categories", href: "/categories", icon: Tag },
	{ name: "Products", href: "/products", icon: Package },
]

interface SidebarProps {
	className?: string
}

export default function Sidebar({ className }: SidebarProps) {
	const [isCollapsed, setIsCollapsed] = useState(false)
	const pathname = usePathname()
	const { user, logout } = useAuthStore()

	return (
		<motion.div
			initial={{ x: -300 }}
			animate={{ x: 0 }}
			className={cn(
				"flex flex-col h-full bg-white border-r border-purple-100 shadow-lg",
				isCollapsed ? "w-16" : "w-64",
				"transition-all duration-300 ease-in-out",
				className,
			)}
		>
			{/* Header with SUPERBAD.STORE Logo */}
			<div className="flex items-center justify-between p-4 border-b border-purple-100">
				{!isCollapsed ? (
					<div className="flex items-center">
						<div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-black to-purple-800 text-lg tracking-wider">
							SUPERBAD.STORE
						</div>
					</div>
				) : (
					<div className="w-8 h-8 bg-gradient-to-r from-black to-purple-800 rounded-md flex items-center justify-center mx-auto">
						<span className="font-bold text-white text-sm">SB</span>
					</div>
				)}
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setIsCollapsed(!isCollapsed)}
					className="p-2 text-gray-600 hover:text-purple-800 hover:bg-purple-50"
				>
					{isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
				</Button>
			</div>

			{/* Navigation */}
			<nav className="flex-1 p-4 space-y-2">
				{navigation.map((item) => {
					const isActive = pathname === item.href
					return (
						<Link key={item.name} href={item.href}>
							<motion.div
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className={cn(
									"flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
									isActive
										? "bg-purple-50 text-purple-700 border-r-2 border-purple-600"
										: "text-gray-600 hover:bg-purple-50/50 hover:text-purple-800",
								)}
							>
								<item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-purple-600" : "text-gray-500")} />
								{!isCollapsed && <span>{item.name}</span>}
							</motion.div>
						</Link>
					)
				})}
			</nav>

			{/* User Profile & Logout */}
			<div className="p-4 border-t border-purple-100">
				{!isCollapsed && user && (
					<div className="mb-3">
						<p className="text-sm font-medium text-gray-800">{user.name}</p>
						<p className="text-xs text-gray-500">{user.email}</p>
					</div>
				)}
				<Button
					variant="ghost"
					onClick={logout}
					className={cn(
						"w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50",
						isCollapsed && "justify-center",
					)}
				>
					<LogOut className="w-4 h-4" />
					{!isCollapsed && <span className="ml-2">Logout</span>}
				</Button>
			</div>
		</motion.div>
	)
}
