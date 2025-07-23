import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUser, FiMail, FiKey, FiEdit, FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const AdminProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('https://attendmaster.onrender.com/api/admin/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching admin profile:', error);
        setError(error.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleEditProfile = () => {
    navigate('/admin/profile/edit');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiLoader className="animate-spin text-4xl text-purple-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md mx-auto" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 mt-16 dark:bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800 dark:bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Admin Profile</h1>
                <p className="opacity-90">Manage your account information</p>
              </div>
              <button
                onClick={handleEditProfile}
                className="flex items-center px-4 py-2 bg-gray-200 bg-opacity-20 rounded-md hover:bg-opacity-30 transition"
              >
                <FiEdit className="mr-2" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6 md:p-8">
            {profile ? (
              <div className="space-y-6">
                {/* Profile Picture Placeholder */}
                <div className="flex justify-center">
                  <div className="h-24 w-24 rounded-full bg-purple-950 dark:bg-purple-100 flex items-center justify-center">
                    <FiUser className="text-4xl text-purple-600" />
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-gray-700 dark:bg-gray-50 rounded-lg p-4">
                  <h2 className="text-lg font-semibold text-gray-200 dark:text-gray-700 mb-4 flex items-center">
                    <FiUser className="mr-2 text-purple-600" />
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-200 dark:text-gray-700">First Name</p>
                      <p className="font-medium text-gray-300 dark:text-gray-600">{profile.firstname || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-200 dark:text-gray-700">Last Name</p>
                      <p className="font-medium text-gray-300 dark:text-gray-600">{profile.lastname || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-gray-700 dark:bg-gray-50 rounded-lg p-4">
                  <h2 className="text-lg font-semibold text-gray-300 dark:text-gray-600 mb-4 flex items-center">
                    <FiMail className="mr-2 text-purple-600" />
                    Account Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-200 dark:text-gray-700">Email Address</p>
                      <p className="font-medium text-gray-300 dark:text-gray-600">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-200 dark:text-gray-700">User ID</p>
                      <p className="font-medium flex items-center text-gray-300 dark:text-gray-600">
                        <FiKey className="mr-2 text-purple-600" />
                        {profile.userid}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Info Section - Can be customized based on your API */}
                <div className="bg-gray-700 dark:bg-gray-50 rounded-lg p-4">
                  <h2 className="text-lg font-semibold text-gray-200 dark:text-gray-700 mb-4">
                    Admin Privileges
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-950 dark:bg-green-100 text-green-600 text-sm rounded-full">
                      User Management
                    </span>
                    <span className="px-3 py-1 bg-blue-950 dark:bg-blue-100 text-blue-600 text-sm rounded-full">
                      Attendance Oversight
                    </span>
                    <span className="px-3 py-1 bg-purple-950 dark:bg-purple-100 text-purple-600 text-sm rounded-full">
                      System Configuration
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No profile data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Last Login Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Last login: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
