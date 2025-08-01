import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '@mui/material/styles';
import { Typography, Box, TextField, Button, IconButton } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { IconEdit } from '@tabler/icons';
import bgImage from '../../assets/images/header.png';
import { fetchEditVendorList, updateVendor } from 'store/vendor/vendorActions';
import { imageUrl } from 'utils/ApiUrls';
import { fetchCountryList } from 'store/country/countryActions';
import BackDropLoading from 'views/utilities/BackDropLoading';

// Styled Components (unchanged)
const StyledBox = styled(Box)({
  maxWidth: '100%',
  width: '100%',
  margin: '0 auto',
  backgroundColor: '#f9f9f9',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  borderRadius: '8px'
});

const HeaderContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '300px',
  marginBottom: theme.spacing(3)
}));

const HeaderImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '8px 8px 0 0'
});

const OverlayText = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  top: '100px',
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '2rem',
  padding: '5px 15px',
  borderRadius: '5px'
}));

const ProfileBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: theme.spacing(3),
  margin: '-100px auto 60px',
  maxWidth: '90%',
  zIndex: 1000,
  border: '1px solid #e0e0e0',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
}));

const ProfileImage = styled('img')({
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  objectFit: 'cover',
  position: 'relative',
  border: '4px solid #fff',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
  marginBottom: '20px'
});

const StyledPersonIcon = styled(PersonIcon)({
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  border: '4px solid #fff',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
  marginBottom: '20px',
  color: '#ccc'
});

const DetailItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2),
  borderBottom: '1px solid #f0f0f0',
  backgroundColor: '#fafafa',
  borderRadius: '4px',
  marginBottom: theme.spacing(1),
  '&:last-child': {
    borderBottom: 'none',
    marginBottom: 0
  },
  '&:hover': {
    backgroundColor: '#f5f5f5'
  }
}));

const LabelText = styled(Typography)({
  fontWeight: 'bold',
  color: '#333',
  flex: '0 0 30%',
  textAlign: 'left'
});

const ValueBox = styled(Box)({
  flex: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '10px'
});

function VendersProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const editVendorList = useSelector((state) => state.vendor.vEditList || {});
  const countryList = useSelector((state) => state.countries.list || []);
  const loading = useSelector((state) => state.vendor.loading || false);
  const userData = useSelector((state) => state.user.user || {});
  const [vendorDetails, setVendorDetails] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [updatedVendor, setUpdatedVendor] = useState({});
  const [newImage, setNewImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (id) {
      Promise.all([dispatch(fetchEditVendorList(id)), dispatch(fetchCountryList())]).catch((error) => {
        console.error('Error fetching data:', error);
      });
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (editVendorList && Object.keys(editVendorList).length > 0 && countryList.length > 0) {
      const country = countryList.find((c) => c.id === Number(editVendorList.countryId));
      const enrichedVendor = {
        ...editVendorList,
        countryName: country ? country.name : 'Unknown',
        countryId: editVendorList.countryId, // Ensure countryId is included
        Id: editVendorList.id || id,
        Title: editVendorList.title || '',
        Email: editVendorList.email || '',
        ContactNumber: editVendorList.contactNumber || '',
        RegistrationNo: editVendorList.registrationNo || '',
        Currency: editVendorList.currency || '',
        advanceAmount: editVendorList.advanceAmount || 0,
        Address: editVendorList.address || '',
        Type: editVendorList.type || '',
        frontCard: editVendorList.frontCard || '',
        backCard: editVendorList.backCard || ''
      };
      setVendorDetails(enrichedVendor);
      setUpdatedVendor(enrichedVendor);
    }
  }, [editVendorList, countryList, id]);

  const addThousandSeparator = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const toggleEdit = (field) => {
    setEditFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFieldChange = (field, value) => {
    setUpdatedVendor((prev) => ({
      ...prev,
      [field]: field === 'advanceAmount' ? Number(value) || 0 : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Unsupported File Format. Please select a JPG or PNG image.');
        return;
      }
      setNewImage(URL.createObjectURL(file));
      setUpdatedVendor((prev) => ({ ...prev, frontCard: file }));
    }
  };

  const triggerFileInput = () => {
    if (userData.userRole === 'SuperAdmin') {
      fileInputRef.current.click();
    }
  };

  const handleUpdate = async () => {
    const formData = new FormData();

    const fieldsToSend = {
      Id: updatedVendor.Id,
      Title: updatedVendor.Title,
      Email: updatedVendor.Email,
      countryId: updatedVendor.countryId, // Correctly sending countryId
      ContactNumber: updatedVendor.ContactNumber,
      RegistrationNo: updatedVendor.RegistrationNo,
      Currency: updatedVendor.Currency,
      advanceAmount: updatedVendor.advanceAmount,
      Address: updatedVendor.Address,
      Type: updatedVendor.Type,
      frontCard: vendorDetails.frontCard,
      backCard: vendorDetails.backCard
    };

    // Validate countryId
    if (!fieldsToSend.countryId) {
      alert('Country ID is missing. Please ensure a country is selected.');
      return;
    }

    Object.keys(fieldsToSend).forEach((key) => {
      formData.append(key, fieldsToSend[key] !== undefined && fieldsToSend[key] !== null ? fieldsToSend[key] : '');
    });

    // Handle imagefile as a required field
    if (updatedVendor.frontCard instanceof File) {
      formData.append('imagefile', updatedVendor.frontCard);
    } else if (vendorDetails.frontCard) {
      const response = await fetch(`${imageUrl}Vendors/${vendorDetails.frontCard}`);
      const blob = await response.blob();
      const file = new File([blob], vendorDetails.frontCard, { type: blob.type });
      formData.append('imagefile', file);
    } else {
      alert('An image file is required. Please upload an image.');
      return;
    }

    // Log FormData for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    dispatch(updateVendor(id, formData, navigate))
      .then((response) => {
        if (response.meta && response.meta.requestStatus === 'fulfilled') {
          setEditFields({});
          setNewImage(null);
          dispatch(fetchEditVendorList(id));
        } else {
          console.error('Update failed:', response.error);
          alert('Failed to update vendor. Please try again.');
        }
      })
      .catch((error) => {
        console.error('Error updating vendor:', error);
      });
  };

  const isEditing = Object.keys(editFields).some((key) => editFields[key]) || newImage !== null;

  if (loading || !vendorDetails) {
    return (
      <StyledBox>
        <BackDropLoading />
      </StyledBox>
    );
  }

  const fields = [
    { key: 'Title', label: 'Title', editable: true, format: (value) => value || 'Vendor' },
    { key: 'Email', label: 'Email', editable: true, format: (value) => value || 'N/A' },
    { key: 'Id', label: 'Vendor ID', editable: false, format: (value) => value || 'N/A' },
    { key: 'countryName', label: 'Country', editable: false, format: (value) => value || 'Unknown' },
    { key: 'ContactNumber', label: 'Contact', editable: true, format: (value) => value || 'N/A' },
    { key: 'RegistrationNo', label: 'Registration No', editable: true, format: (value) => value || 'N/A' },
    { key: 'Currency', label: 'Currency', editable: true, format: (value) => value || 'N/A' },
    {
      key: 'advanceAmount',
      label: 'Advance Amount',
      editable: true,
      format: (value) => `${addThousandSeparator(value || 0)} ${vendorDetails.Currency || 'N/A'}`,
      style: { color: '#d32f2f', fontWeight: 'bold' }
    },
    { key: 'Address', label: 'Address', editable: true, format: (value) => value || 'N/A' },
    { key: 'recCreatedBy', label: 'Created By', editable: false, format: (value) => value || 'N/A' },
    {
      key: 'recCreatedDt',
      label: 'Created Date',
      editable: false,
      format: (value) => (value ? new Date(value).toLocaleString() : 'N/A')
    },
    { key: 'recUpdatedBy', label: 'Updated By', editable: false, format: (value) => value || 'N/A' },
    {
      key: 'recUpdatedDt',
      label: 'Updated Date',
      editable: false,
      format: (value) => (value ? new Date(value).toLocaleString() : 'N/A')
    },
    { key: 'Type', label: 'Type', editable: true, format: (value) => value || 'N/A' }
  ];

  return (
    <StyledBox>
      <HeaderContainer>
        <HeaderImage src={bgImage} alt="Vendor Profile Background" />
        <OverlayText>Vendor Profile</OverlayText>
      </HeaderContainer>

      <ProfileBox>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          {newImage ? (
            <ProfileImage src={newImage} alt="New Profile Preview" />
          ) : vendorDetails.frontCard ? (
            <ProfileImage src={`${imageUrl}Vender/${vendorDetails.frontCard}`} alt="Vendor Profile" />
          ) : (
            <StyledPersonIcon />
          )}
          {userData.userRole === 'SuperAdmin' && (
            <>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
              <IconButton
                size="small"
                onClick={triggerFileInput}
                sx={{
                  position: 'absolute',
                  bottom: '20px',
                  right: { xs: '30%', md: '42%' },
                  background: '#2196f3',
                  color: 'white'
                }}
              >
                <IconEdit />
              </IconButton>
            </>
          )}
        </Box>

        <Box>
          {fields.map((field) => (
            <DetailItem key={field.key}>
              <LabelText variant="body1">{field.label}:</LabelText>
              <ValueBox>
                {editFields[field.key] && field.editable ? (
                  <TextField
                    value={updatedVendor[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    size="small"
                    type={field.key === 'advanceAmount' ? 'number' : 'text'}
                    sx={{ width: '200px' }}
                  />
                ) : (
                  <Typography variant="body1" sx={field.style || {}}>
                    {field.format(vendorDetails[field.key])}
                  </Typography>
                )}
                {userData.userRole === 'SuperAdmin' && field.editable && (
                  <IconButton size="small" onClick={() => toggleEdit(field.key)}>
                    <IconEdit />
                  </IconButton>
                )}
              </ValueBox>
            </DetailItem>
          ))}
          {isEditing && userData.userRole === 'SuperAdmin' && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button variant="contained" color="primary" onClick={handleUpdate}>
                Update Vendor
              </Button>
            </Box>
          )}
        </Box>
      </ProfileBox>
    </StyledBox>
  );
}

export default VendersProfile;
