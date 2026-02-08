'use client'
import Image from 'next/image'
import React, { ChangeEvent, FormEvent, useState } from 'react'
import Link from 'next/link'

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    let newErrors = { email: '', password: '' }

    if (!formData.email) newErrors.email = '*Email is required'
    if (!formData.password) newErrors.password = '*Password is required'

    setErrors(newErrors)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  return (
    <div className="min-h-screen w-full flex justify-center items-center px-4">
      <div className="w-full max-w-md sm:max-w-lg bg-black rounded-2xl p-6 sm:p-10">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <Image src="/ideora_logo.png" alt="logo" width={50} height={50} />
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-4">
            Ready to Get Started?
          </h1>
          <p className="text-center text-gray-400 text-sm max-w-xs mt-2">
            Join us and unlock full potential of our online meeting dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <label className="flex flex-col gap-1">
            <span className="text-white text-sm">Email</span>
            <input
              className="h-10 w-full rounded-2xl px-3 bg-zinc-900 text-sm sm:text-base"
              name="email"
              placeholder="Enter your email"
              onChange={handleChange}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-white text-sm">Password</span>
            <input
              type="password"
              className="h-10 w-full rounded-2xl px-3 bg-zinc-900 text-sm sm:text-base"
              name="password"
              placeholder="Enter your password"
              onChange={handleChange}
            />
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
          </label>

          <button className="h-10 w-full rounded-2xl bg-primary text-white mt-2 cursor-pointer">
            Login
          </button>

          <p className="text-xs text-center text-gray-400">Or login with</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="h-10 w-full sm:w-1/2 rounded-2xl bg-zinc-900 text-sm cursor-pointer">
              Google
            </button>
            <button className="h-10 w-full sm:w-1/2 rounded-2xl bg-zinc-900 text-sm cursor-pointer">
              LinkedIn
            </button>
          </div>

          <p className="text-xs text-center text-gray-400 mt-2">
            Create an account?{' '}
            <Link href="/Signup" className="text-blue-600 font-semibold">
              Signup
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Signup
