import React, { useRef, useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import {getDownloadURL, getStorage, ref, uploadBytes, uploadBytesResumable} from 'firebase/storage';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import {Link} from 'react-router-dom';
import {updateUserFailure, updateUserSuccess, updateUserStart, deleteUserFailure, deleteUserStart, deleteUserSuccess, signOutUserStart, signOutUserFailure, signOutUserSuccess} from '../redux/user/userSlice.js';

const Profile = () => {
  const {currentUser, loading, error}=useSelector((state)=>state.user);
  const fileRef=useRef(null);
  const dispatch = useDispatch();
  const [file,setFile]=useState(undefined);
  const [filePerc, setFilePerc]=useState(0);
  const [fileUploadError,setFileUploadError]=useState(false);
  const [formData, setFormData]=useState({});
  const [updateSuccess,setUpdateSuccess]=useState(false);
  const [showListingError,setshowListingsError]=useState(false); 
  const [userListings,setUserListings]=useState([]);
  console.log(formData);
  // firebase storage
    // allow read;
    // allow write: if
    // request.resource.size < 2 * 1024 * 1024 && 
    // request.resource.contentType.matches('image/.*')
    useEffect(()=>{
      if(file){
        handleFileUpload(file);
      }
    }, [file]);
    const handleFileUpload= (file) =>{
      const storage=getStorage(app);
      const fileName=new Date().getTime() + file.name;
      const storageRef=ref(storage, fileName);
      const uploadTask=uploadBytesResumable(storageRef,file);
      
     
      console.log(file);
      uploadTask.on('state_changed',
      (snapshot)=>{
        const progress=(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error)=>{
        setFileUploadError(true);
      },
      ()=>{
        getDownloadURL(uploadTask.snapshot.ref).then((getDownloadURL)=>
          setFormData({...formData, avatar: getDownloadURL})
        )
      }
      )
    }
    const handleChange=(e)=>{
      setFormData({...formData, [e.target.id]: e.target.value});
    }
    const handleSubmit= async (e)=>{
      e.preventDefault();
      try{
        dispatch(updateUserStart());
        const response = await fetch(`/api/user/update/${currentUser._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        const data= await response.json();
        if(data.success===false){
          dispatch(updateUserFailure(data.message));
          return;
        }
        dispatch(updateUserSuccess(data));
        setUpdateSuccess(true);
      }catch(error){
        dispatch(updateUserFailure(error.message));
      }
    }
    const handleDeleteUser=async()=>{
      try{
        dispatch(deleteUserStart());
        const res=await fetch(`/api/user/delete/${currentUser._id}`,{
          method: "DELETE",
        });
        const data=await res.json();
        if(data.success===false){
          dispatch(deleteUserFailure(data.message));
          return;
        }
        dispatch(deleteUserSuccess(data));
      }catch(error){
        dispatch(deleteUserFailure(error.message));
      }
    }
    const handleSignOut=async() =>{
      try{
        dispatch(signOutUserStart());
        const res=await fetch('/api/auth/signOut');
        const data=await res.json();
        if(data.success===false){
          dispatch(signOutUserFailure(data.message));
          return;
        }
        dispatch(signOutUserSuccess(data));
      }catch(error){
        dispatch(signOutUserFailure(data.message));
      }
    }

    const handleShowListings = async () => {
      try {
        setshowListingsError(false);
        const res = await fetch(`/api/user/listing/${currentUser._id}`);
        const data = await res.json();
        if (data.success === false) {
          setshowListingsError(true);
          return;
        }
  
        setUserListings(data);
      } catch (error) {
        setshowListingsError(true);
      }
    };
    const handleListingDelete = async (listingId) => {
      try {
        const res = await fetch(`/api/listing/delete/${listingId}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.success === false) {
          console.log(data.message);
          return;
        }
  
        setUserListings((prev) =>
          prev.filter((listing) => listing._id !== listingId)
        );
      } catch (error) {
        console.log(error.message);
      }
    };
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input onChange={(e) => setFile(e.target.files[0])} type="file"  ref={fileRef} hidden accept='image/*'/>
        <img onClick={()=>fileRef.current.click()} src={formData?.avatar || currentUser.avatar} alt="profile" className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2 ' />
        <p className='text-sm self-center'>{fileUploadError ?
        (<span className='text-red-700'>Error image upload (Image must be less than 2 Mb)</span>) : filePerc > 0 && filePerc<100 ?(
          <span className='text-slate-700'>{`Uploading ${filePerc}`}</span>)
          : filePerc===100 ?(
            <span className='text-green-700'>Image Successfully Uploaded!</span>)
            : ("")
      }</p>
        <input type="text" placeholder='username' id='username' defaultValue={currentUser.username} className='border p-3 rounded-lg' onChange={handleChange}/>
        <input type="email" placeholder='email' id='email' defaultValue={currentUser.email}  className='border p-3 rounded-lg 'onChange={handleChange} />
        <input type="password" placeholder='password' id='password' className='border p-3 rounded-lg 'onChange={handleChange}/>
        <button disabled={loading} className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'>{loading? 'Loading...': 'Update'}</button>
        <Link className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95' to={"/create-listing"}>Create Listing</Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>Delete Account</span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>Sign Out</span>
      </div>
      <p className='text-red-700 mt-5'>{error?error:''}</p>
      <p className='text-green-700 mt-5'>{updateSuccess? 'User is updated successfully!': ''}</p>
      <button onClick={handleShowListings} className='text-green-700 w-full '>Show Listings</button>
      <p className='text-red-700 mt-5'>{showListingError? 'Error showing Listings': ''}</p>
      {userListings && userListings.length>0  && 
       <div className="flex flex-col gap-4">
        <h1 className='text-center mt-7 text-2xl font-semibold'>Your Listings</h1>
        {userListings.map((listing) => (
        <div key={listing._id} className="border rounded-lg p-3 flex justify-between items-center gap-4">
          <Link to={`/listing/${listing._id}`}>
            <img src={listing.imageUrls[0]} alt="listing cover" className='h-16 w-16 object-contain rounded-lg' />
          </Link>
          <Link className='flex-1 font-semibold hover:underline truncate' to={`/listing/${listing._id}`}>
           <p>{listing.name}</p>
          </Link>
          <div className='flex flex-col items-center'>
          <button onClick={()=>handleListingDelete(listing._id)} className='text-red-700 uppercase'>Delete</button>
          <button className='text-green-700 uppercase'>Edit</button>
          </div>
        </div>
      ))}
       </div>
       }
    </div>
    
  )
}

export default Profile;
