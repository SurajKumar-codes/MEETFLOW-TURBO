'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Home,
  Video,
  MessageSquare,
  Calendar,
  Users,
  User,
  Menu,
  X
} from "lucide-react"

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/meeting", icon: Video, label: "Meeting" },
  { href: "/schedule", icon: Calendar, label: "Schedule" },
  { href: "/chat", icon: MessageSquare, label: "Chat" },
  { href: "/people", icon: Users, label: "People" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isProfileActive = pathname === "/profile"

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-black border-b border-zinc-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <img
            src="/Ideora_logo.png"
            alt="Ideora"
            className="w-8 h-8 object-cover rounded-full"
          />
          <span className="text-white font-semibold">MeetFlow</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/80 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-out Menu */}
      <div className={`md:hidden fixed top-14 left-0 bottom-0 w-64 bg-black border-r border-zinc-800 z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <nav className="flex flex-col p-4 gap-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{label}</span>
              </Link>
            )
          })}
          
          <div className="border-t border-zinc-800 mt-4 pt-4">
            <Link
              href="/profile"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                isProfileActive
                  ? "bg-blue-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <User size={20} />
              <span className="font-medium">Profile</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-20 bg-black border-r border-zinc-800 flex-col justify-between items-center py-6 flex-shrink-0">
        {/* Top section */}
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
            <img
              src="/Ideora_logo.png"
              alt="Ideora"
              className="w-10 h-10 object-cover"
            />
          </div>

          {/* Navigation */}
          {navItems.map(({ href, icon: Icon }) => {
            const isActive = pathname === href

            return (
              <Link
                key={href}
                href={href}
                className={`w-11 h-11 flex items-center justify-center rounded-xl transition
                  ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
              >
                <Icon size={20} />
              </Link>
            )
          })}
        </div>

        {/* Bottom section - User Profile */}
        <Link
          href="/profile"
          className={`w-11 h-11 flex items-center justify-center rounded-xl transition ${
            isProfileActive
              ? "bg-blue-600 text-white"
              : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          <User size={20} />
        </Link>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black border-t border-zinc-800 flex items-center justify-around z-50">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
                isActive
                  ? "text-primary"
                  : "text-zinc-500"
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px]">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
