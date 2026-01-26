  'use client'
import React, { ChangeEvent, FormEvent, useState } from 'react'
import { PassThrough } from 'stream'

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
    <div className='h-screen w-screen flex justify-center items-center'>
      <div className=' '>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>

        <label htmlFor="name"  className='flex flex-col gap-2'>
          Full name
          <input type="text" id='name' name='name' placeholder='Enter Your Full Name'  onChange={handleChange}/>
          {errors.name && <p className='text-red-500 text-sm'>{errors.name}</p>}
        </label>

        <label htmlFor='email' className='flex flex-col gap-2'>
          Email
          <input type="email" name="email" id="email" placeholder='Enter Your Email'  onChange={handleChange}/>
          {errors.email && <p className='text-red-500 text-sm'>{errors.email}</p>}
        </label>

        <label htmlFor='password' className='flex flex-col gap-2'>
          Password
          <input type='password' name='password' id='password' placeholder='Enter Your Password' onChange={handleChange}/>
          {errors.password && <p className='text-red-500 text-sm'>{errors.password}</p>}
        </label>

        <label htmlFor='repeatPassword' className='flex flex-col gap-2'>
          Repeat password
          <input type='repeatPassword' name='repeatPassword' id='repeatPassword' placeholder='Repeat Your Password' onChange={handleChange}/>
          {errors.password && <p className='text-red-500 text-sm'>{errors.repeatPassword}</p>}
        </label>

        <button type='submit'>SignUp</button>
      </form>
    </div>
    </div>
  )
}

export default Signup
