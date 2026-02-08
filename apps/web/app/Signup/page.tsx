  'use client'
import Image from 'next/image'
import React, { ChangeEvent, FormEvent, useState } from 'react'
import Link from 'next/link'

const Signup = () => {
  const[formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    repeatPassword: ""
  })

  const[errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    repeatPassword: ""
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let newErrors = ({
      name: "",
      email: "",
      password: "",
      repeatPassword: ""
    })

    if(!formData.name) newErrors.name = '*Name is required';
    if(!formData.email) newErrors.email = '*Email is required';
    if(!formData.password) newErrors.password = '*Password is required';
    if(!formData.repeatPassword) newErrors.repeatPassword = '*Password is required'

    if(newErrors.name || newErrors.email || newErrors.password || newErrors.repeatPassword){
      setErrors(newErrors);
    }

  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>{
    const name = e.target.name;
    const value = e.target.value; 

    setFormData({
      ...formData,
      [name]: value
    })

    setErrors({
      ...errors,
      [name]: ""
    })
  }
  return (
    <div className='min-h-screen w-full flex justify-center items-center px-4 sm:px-0'>
      <div className='w-full max-w-md sm:max-w-lg bg-black rounded-2xl p-6 sm:p-10'>
          <div className='flex flex-col justify-center items-center'>
            <div className='w-full flex justify-center items-center pb-4'>
              <Image src='/ideora_logo.png' alt='logo' width={50} height={50} className='rounded-3xl'/>
            </div>
            <div className='flex flex-col justify-center items-center'>
              <h1 className='text-2xl sm:text-3xl font-bold text-white'>Ready to Get Started?</h1>
              <p className="mx-auto max-w-[300px] text-center text-gray-400 leading-relaxed text-sm pb-3">join us and unlock full potential of our online meeting dashboard</p>
            </div>
          </div>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4 w-full'>

          <label htmlFor="name"  className='flex flex-col gap-1'>
             <span className="text-white text-sm">Full name</span>
            <input className='h-10 w-full rounded-2xl px-3 bg-zinc-900 text-sm sm:text-base' type="text" id='name' name='name' placeholder='Enter Your Full Name'  onChange={handleChange}/>
            {errors.name && <p className='text-red-500 text-sm'>{errors.name}</p>}
          </label>

          <label htmlFor='email' className='flex flex-col gap-1'>
            <span className='text-white text-sm'> Email </span>
            <input className='h-10 w-full rounded-2xl px-3 bg-zinc-900 text-sm sm:text-base' type="email" name="email" id="email" placeholder='Enter Your Email'  onChange={handleChange}/>
            {errors.email && <p className='text-red-500 text-sm'>{errors.email}</p>}
          </label>

          <label htmlFor='password' className='flex flex-col gap-1'>
            <span className='text-white text-sm'> Password </span>
            <input className='h-10 w-full rounded-2xl px-3 bg-zinc-900 text-sm sm:text-base' type='password' name='password' id='password' placeholder='Enter Your Password' onChange={handleChange}/>
            {errors.password && <p className='text-red-500 text-sm'>{errors.password}</p>}
          </label>

          <label htmlFor='repeatPassword' className='flex flex-col gap-1'>
            <span className='text-white text-sm'> Repeat password </span>
            <input className='h-10 w-full rounded-2xl px-3 bg-zinc-900 text-sm sm:text-base' type='repeatPassword' name='repeatPassword' id='repeatPassword' placeholder='Repeat Your Password' onChange={handleChange}/>
            {errors.password && <p className='text-red-500 text-sm'>{errors.repeatPassword}</p>}
          </label>

          <button type='submit' className='h-10 w-full rounded-2xl bg-primary text-white mt-3 cursor-pointer'>SignUp</button>

          <div className='w-full'>
            <p className='text-[12px] text-center text-gray-400'>Or Sign up with</p>
          </div>

          <div className='flex flex-col sm:flex-row gap-3 w-full'>
            <button className='h-10 w-full sm:w-1/2 rounded-2xl bg-zinc-900 text-sm cursor-pointer'>Google</button>
            <button className='h-10 w-full sm:w-1/2 rounded-2xl bg-zinc-900 text-sm cursor-pointer'>Linkdin</button>
          </div>
          <div className='w-full text-[12px]'>
            <p className='text-center text-gray-400'>Already have an account? <b className='cursor-pointer text-blue-700'><Link href='/login'>Login</Link></b></p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Signup
