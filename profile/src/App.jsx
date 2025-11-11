import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Auth/Login/Login";
import Register from "./components/Auth/Register/Register";
import AdminDashboard from "./Pages/AdminPages/AdminDashboard/AdminDashboard.jsx";
import ProtectedRoute from "./routing/ProtectedRoute.jsx";
import UserDashboard from "./Pages/UserPages/UserDashboard/UserDashboard.jsx"; 
import Layout from "./layout/Layout.jsx";
import UserProfiles from "./Pages/AdminPages/UserProfiles/UserProfiles.jsx";
import UserProfileView from "./Pages/AdminPages/UserProfileView/UserProfileView.jsx";
import ProfileBuckets from "./Pages/AdminPages/ProfileBuckets/ProfileBuckets.jsx";
import BucketView from "./Pages/AdminPages/BucketView/BucketView.jsx";
import PublicBucketView from "./Pages/Public/PublicBucketView/PublicBucketView.jsx";
import UserProfile from "./Pages/UserPages/UserProfile/UserProfile.jsx";
import PublicProfileView from "./Pages/Public/PublicProfileView.jsx";
import ForgotPassword from "./Pages/PasswordPages/ForgotPassword/ForgotPassword.jsx";
import ResetPassword from "./Pages/PasswordPages/ResetPassword/ResetPassword.jsx";
import MyProfile from "./Pages/UserPages/MyProfile/MyProfile.jsx";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/public/bucket/:shareToken" element={<PublicBucketView />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/resetPassword/:resetToken" element={<ResetPassword />} />
      <Route path="/public/profile/:id" element={<PublicProfileView />} />

      {/* Protected routes with the new layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/myProfile" element={<MyProfile />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/userProfiles" element={<UserProfiles />} />
          <Route path="/admin/userProfile/:id" element={<UserProfileView />} />
          <Route path="/admin/profileBuckets" element={<ProfileBuckets />} />
          <Route path="/admin/bucket/:id" element={<BucketView />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
