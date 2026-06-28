import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '../context/UserContext';

// ✅ Use a public image path (recommended for poster image)
const ProfileSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  position: relative;
  color: white;
  background-image: url('/horizontal_combined_movie_poster.png');
  background-size: 90%;
  background-position: center;
  background-repeat: no-repeat;
  isolation: isolate;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(18, 17, 17, 0.65); /* dark overlay */
    z-index: -1;
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 2rem;
  font-weight: 800;
  letter-spacing: 1px;
  color:rgb(107, 216, 241); /* soft dark gray */
  text-align: center;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5); /* subtle depth */
  transition: all 0.4s ease;

  &:hover {
    color: rgb(35, 165, 212);
    text-shadow: 0 0 18px #a855f7, 0 0 28px #a855f7;
    transform: scale(1.04);
  }
`;
<motion.h1
  initial={{ opacity: 0, y: -30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.9, ease: "easeOut" }}
  whileHover={{
    scale: 1.04,
    textShadow: "0px 0px 16px #a855f7",
    transition: { duration: 0.3 },
  }}
>
  <Title>Who's watching?</Title>
</motion.h1>




const ProfilesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 800px;
  margin-bottom: 2rem;
`;

const ProfileCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const ProfileEmoji = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 18px;
  background: linear-gradient(135deg, #a855f7 40%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  margin-bottom: 1rem;
  border: 3px solid transparent;
  box-shadow: 0 4px 24px 0 #00000044;
  &:hover {
    border-color: #6d28d9;
  }
`;

const ProfileName = styled.span`
  font-size: 1.2rem;
  text-align: center;
  margin-top: 0.5rem;
  letter-spacing: 0.5px;
  color: #fff;
`;

const AddProfileCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
`;

const AddProfileIcon = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 18px;
  background: linear-gradient(135deg, #232526 0%, #414345 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #a855f7;
  border: 2px dashed #a855f7;
`;

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ProfileCreationModal = styled.div`
  background-color: #1e1e1e;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
`;

const ModalTitle = styled.h2`
  margin-bottom: 1.5rem;
  color: white;
  text-align: center;
`;

const InputField = styled.input`
  width: 100%;
  padding: 1rem;
  margin-bottom: 1.5rem;
  background-color: #2d2d2d;
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 1rem;
  &:focus {
    outline: 2px solid #6d28d9;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
  &:first-child {
    background-color: #2d2d2d;
    color: white;
    &:hover {
      background-color: #3d3d3d;
    }
  }
  &:last-child {
    background-color: #6d28d9;
    color: white;
    &:hover {
      background-color: #7d38e9;
    }
  }
`;

const PROFILE_EMOJI = '🎬';

const ProfileSelector = ({ onSelectProfile, onCreateProfile }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: '',
    emoji: PROFILE_EMOJI,
    isChild: false
  });
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        if (user?.isAdmin || user?.is_admin) {
          navigate('/home');
          return;
        }

        const response = await fetch('http://localhost:5000/user/profiles', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProfiles(data);
        } else {
          throw new Error('Failed to fetch profiles');
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [navigate, user]);

  const handleCreateProfile = async () => {
    if (!newProfile.name.trim()) {
      toast.error('Profile name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/user/profiles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newProfile.name,
          profile_emoji: PROFILE_EMOJI,
          is_child: newProfile.isChild
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create profile');
      }

      const createdProfile = await response.json();
      toast.success('Profile created successfully!');
      setProfiles(prev => [...prev, createdProfile]);
      setNewProfile({ name: '', emoji: PROFILE_EMOJI, isChild: false });
      setShowCreateForm(false);
      onSelectProfile(createdProfile);
    } catch (error) {
      toast.error(error.message);
      console.error('Profile creation error:', error);
    }
  };

  if (isLoading) {
    return (
      <ProfileSelectorContainer>
        <div className="spinner">Loading profiles...</div>
      </ProfileSelectorContainer>
    );
  }

  return (
    <ProfileSelectorContainer>
      <Title>Who's watching?</Title>
      <ProfilesGrid>
        {profiles.map(profile => (
          <ProfileCard
            key={profile._id || profile.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectProfile(profile)}
          >
            <ProfileEmoji>{PROFILE_EMOJI}</ProfileEmoji>
            <ProfileName>{profile.name}</ProfileName>
          </ProfileCard>
        ))}
        <AddProfileCard
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateForm(true)}
        >
          <AddProfileIcon>+</AddProfileIcon>
          <span>Add Profile</span>
        </AddProfileCard>
      </ProfilesGrid>

      {showCreateForm && (
        <ModalBackdrop onClick={() => setShowCreateForm(false)}>
          <ProfileCreationModal onClick={e => e.stopPropagation()}>
            <ModalTitle>Create Profile</ModalTitle>
            <InputField
              type="text"
              value={newProfile.name}
              onChange={(e) => setNewProfile(p => ({ ...p, name: e.target.value }))}
              placeholder="Enter profile name"
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <ProfileEmoji>{PROFILE_EMOJI}</ProfileEmoji>
            </div>
            <FormActions>
              <ActionButton onClick={() => setShowCreateForm(false)}>Cancel</ActionButton>
              <ActionButton onClick={handleCreateProfile}>Create</ActionButton>
            </FormActions>
          </ProfileCreationModal>
        </ModalBackdrop>
      )}
    </ProfileSelectorContainer>
  );
};

export default ProfileSelector;