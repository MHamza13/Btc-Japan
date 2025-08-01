import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '@mui/material/styles';
import { Typography, Box, Paper, TextField, Button, IconButton } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { IconEdit } from '@tabler/icons';
import bgImage from '../../assets/images/header.png';
import { fetchEditCustomerList, updateCustomer } from 'store/customer/customerActions';
import { imageUrl } from 'utils/ApiUrls';
import { fetchCountryList } from 'store/country/countryActions';
import BackDropLoading from 'views/utilities/BackDropLoading';

// Styled Components (aligned with VendersProfile)
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

const CustomersProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const customerData = useSelector((state) => state.customer.cEditList || {});
  const countryList = useSelector((state) => state.countries.list || []);
  const loading = useSelector((state) => state.customer.loading || false);
  const userData = useSelector((state) => state.user.user || {});
  const [customerDetails, setCustomerDetails] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [updatedCustomer, setUpdatedCustomer] = useState({});
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [newCnicFrontImage, setNewCnicFrontImage] = useState(null);
  const [newCnicBackImage, setNewCnicBackImage] = useState(null);
  const [newBusinessCardImage, setNewBusinessCardImage] = useState(null);
  const profileFileInputRef = useRef(null);
  const cnicFrontFileInputRef = useRef(null);
  const cnicBackFileInputRef = useRef(null);
  const businessCardFileInputRef = useRef(null);

  useEffect(() => {
    if (id) {
      Promise.all([dispatch(fetchEditCustomerList(id)), dispatch(fetchCountryList())]).catch((error) => {
        console.error('Error fetching data:', error);
      });
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (customerData && Object.keys(customerData).length > 0 && countryList.length > 0) {
      const country = countryList.find((c) => c.id === Number(customerData.countryId));
      const enrichedCustomer = {
        ...customerData,
        countryName: country ? country.name : 'Unknown',
        Id: customerData.id || id,
        FirstName: customerData.firstName || '',
        LastName: customerData.lastName || '',
        Email: customerData.email || '',
        Whatsapp: customerData.whatsapp || '',
        PhoneNumber: customerData.phoneNumber || '',
        Password: customerData.password || '',
        DateOfBirth: customerData.dateOfBirth || '',
        advanceAmount: customerData.advanceAmount || '',
        BusinessName: customerData.businessName || '',
        BusinessCard: customerData.businessCard || '',
        BusinessType: customerData.businessType || '',
        CountryId: customerData.countryId || '',
        currency: customerData.currency || '',
        BusinessCountryId: customerData.businessCountryId || '',
        Port: customerData.port || '',
        ShippingMode: customerData.shippingMode || '',
        TradeTerm: customerData.tradeTerm || '',
        Address: customerData.address || '',
        City: customerData.city || '',
        ZipCode: customerData.zipCode || '',
        cnicBack: customerData.cnicBack || '',
        cnicFront: customerData.cnicFront || '',
        profile: customerData.profile || '',
        FrontCNIC: '', // For new file upload
        BackCNIC: '', // For new file upload
        BusinessCardImage: '' // For new business card file upload
      };
      setCustomerDetails(enrichedCustomer);
      setUpdatedCustomer(enrichedCustomer);
    }
  }, [customerData, countryList, id]);

  const addThousandSeparator = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const toggleEdit = (field) => {
    setEditFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFieldChange = (field, value) => {
    setUpdatedCustomer((prev) => ({
      ...prev,
      [field]: field === 'advanceAmount' ? Number(value) : value
    }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file && ['image/jpeg', 'image/png'].includes(file.type)) {
      setNewProfileImage(URL.createObjectURL(file));
      setUpdatedCustomer((prev) => ({ ...prev, profile: file }));
    } else {
      alert('Unsupported File Format. Please select a JPG or PNG image.');
    }
  };

  const handleCnicFrontImageChange = (e) => {
    const file = e.target.files[0];
    if (file && ['image/jpeg', 'image/png'].includes(file.type)) {
      setNewCnicFrontImage(URL.createObjectURL(file));
      setUpdatedCustomer((prev) => ({ ...prev, FrontCNIC: file }));
    } else {
      alert('Unsupported File Format. Please select a JPG or PNG image.');
    }
  };

  const handleCnicBackImageChange = (e) => {
    const file = e.target.files[0];
    if (file && ['image/jpeg', 'image/png'].includes(file.type)) {
      setNewCnicBackImage(URL.createObjectURL(file));
      setUpdatedCustomer((prev) => ({ ...prev, BackCNIC: file }));
    } else {
      alert('Unsupported File Format. Please select a JPG or PNG image.');
    }
  };

  const handleBusinessCardImageChange = (e) => {
    const file = e.target.files[0];
    if (file && ['image/jpeg', 'image/png'].includes(file.type)) {
      setNewBusinessCardImage(URL.createObjectURL(file));
      setUpdatedCustomer((prev) => ({ ...prev, BusinessCardImage: file }));
    } else {
      alert('Unsupported File Format. Please select a JPG or PNG image.');
    }
  };

  const triggerProfileFileInput = () => {
    if (userData.userRole === 'SuperAdmin') {
      profileFileInputRef.current.click();
    }
  };

  const triggerCnicFrontFileInput = () => {
    if (userData.userRole === 'SuperAdmin') {
      cnicFrontFileInputRef.current.click();
    }
  };

  const triggerCnicBackFileInput = () => {
    if (userData.userRole === 'SuperAdmin') {
      cnicBackFileInputRef.current.click();
    }
  };

  const triggerBusinessCardFileInput = () => {
    if (userData.userRole === 'SuperAdmin') {
      businessCardFileInputRef.current.click();
    }
  };

  const handleUpdate = () => {
    const formData = new FormData();

    // Append all fields from updatedCustomer, ensuring unchanged data is included
    const fieldsToSend = {
      Id: updatedCustomer.Id,
      FirstName: updatedCustomer.FirstName,
      LastName: updatedCustomer.LastName,
      Email: updatedCustomer.Email,
      Whatsapp: updatedCustomer.Whatsapp,
      PhoneNumber: updatedCustomer.PhoneNumber,
      Password: updatedCustomer.Password,
      DateOfBirth: updatedCustomer.DateOfBirth,
      advanceAmount: updatedCustomer.advanceAmount,
      BusinessName: updatedCustomer.BusinessName,
      BusinessCard: updatedCustomer.BusinessCard,
      BusinessType: updatedCustomer.BusinessType,
      CountryId: updatedCustomer.CountryId,
      currency: updatedCustomer.currency,
      BusinessCountryId: updatedCustomer.BusinessCountryId,
      Port: updatedCustomer.Port,
      ShippingMode: updatedCustomer.ShippingMode,
      TradeTerm: updatedCustomer.TradeTerm,
      Address: updatedCustomer.Address,
      City: updatedCustomer.City,
      ZipCode: updatedCustomer.ZipCode,
      cnicBack: updatedCustomer.cnicBack, 
      cnicFront: updatedCustomer.cnicFront, 
      profile: updatedCustomer.profile 
    };

    // Append all text fields to FormData
    Object.keys(fieldsToSend).forEach((key) => {
      formData.append(key, fieldsToSend[key] !== undefined && fieldsToSend[key] !== null ? fieldsToSend[key] : '');
    });

    // Append new image files if they exist
    if (updatedCustomer.profile instanceof File) {
      formData.append('Profile', updatedCustomer.profile);
    }
    if (updatedCustomer.FrontCNIC instanceof File) {
      formData.append('FrontCNIC', updatedCustomer.FrontCNIC);
    }
    if (updatedCustomer.BackCNIC instanceof File) {
      formData.append('BackCNIC', updatedCustomer.BackCNIC);
    }
    if (updatedCustomer.BusinessCardImage instanceof File) {
      formData.append('BusinessCard', updatedCustomer.BusinessCardImage);
    }

    // Dispatch updateCustomer with id, formData, and navigate
    dispatch(updateCustomer(id, formData, navigate))
      .then((response) => {
        if (response.meta && response.meta.requestStatus === 'fulfilled') {
          setEditFields({});
          setNewProfileImage(null);
          setNewCnicFrontImage(null);
          setNewCnicBackImage(null);
          setNewBusinessCardImage(null);
          dispatch(fetchEditCustomerList(id));
        } else {
          console.error('Update failed:', response.error);
          alert('Failed to update customer. Please try again.');
        }
      })
      .catch((error) => {
        console.error('Error updating customer:', error);
      });
  };

  const isEditing =
    Object.values(editFields).some((value) => value) ||
    newProfileImage !== null ||
    newCnicFrontImage !== null ||
    newCnicBackImage !== null ||
    newBusinessCardImage !== null;

  if (loading || !customerDetails) {
    return (
      <StyledBox>
        <BackDropLoading />
      </StyledBox>
    );
  }

  const fields = [
    { key: 'FirstName', label: 'First Name', editable: true, format: (value) => value || 'N/A' },
    { key: 'LastName', label: 'Last Name', editable: true, format: (value) => value || 'N/A' },
    { key: 'Email', label: 'Email', editable: true, format: (value) => value || 'N/A' },
    { key: 'Id', label: 'Customer ID', editable: false, format: (value) => value || 'N/A' },
    { key: 'countryName', label: 'Country', editable: false, format: (value) => value || 'Unknown' },
    { key: 'PhoneNumber', label: 'Phone Number', editable: true, format: (value) => value || 'N/A' },
    { key: 'Whatsapp', label: 'WhatsApp', editable: true, format: (value) => value || 'N/A' },
    { key: 'Address', label: 'Address', editable: true, format: (value) => value || 'N/A' },
    { key: 'ZipCode', label: 'Zip Code', editable: true, format: (value) => value || 'N/A' },
    { key: 'City', label: 'City', editable: true, format: (value) => value || 'N/A' },
    { key: 'province', label: 'Province', editable: true, format: (value) => value || 'N/A' },
    { key: 'BusinessName', label: 'Business Name', editable: true, format: (value) => value || 'N/A' },
    { key: 'BusinessType', label: 'Business Type', editable: true, format: (value) => value || 'N/A' },
    { key: 'TradeTerm', label: 'Trade Term', editable: true, format: (value) => value || 'N/A' },
    { key: 'ShippingMode', label: 'Shipping Mode', editable: true, format: (value) => value || 'N/A' },
    { key: 'Port', label: 'Port', editable: true, format: (value) => value || 'N/A' },
    { key: 'currency', label: 'Currency', editable: true, format: (value) => value || 'N/A' },
    {
      key: 'advanceAmount',
      label: 'Advance Amount',
      editable: true,
      format: (value) => `${addThousandSeparator(value || 0)} ${customerDetails.currency || 'N/A'}`,
      style: { color: '#d32f2f', fontWeight: 'bold' }
    },
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
    }
  ];

  return (
    <StyledBox component={Paper}>
      <HeaderContainer>
        <HeaderImage src={bgImage} alt="Customer Profile Background" />
        <OverlayText>Customer Profile</OverlayText>
      </HeaderContainer>

      <ProfileBox>
        <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          {newProfileImage ? (
            <ProfileImage src={newProfileImage} alt="New Profile Preview" />
          ) : customerDetails.profile ? (
            <ProfileImage
              src={`${imageUrl}Customer/${customerDetails.profile}`.replace(/\\/g, '/')}
              alt="Customer Profile"
              onError={(e) => (e.target.src = '')}
            />
          ) : (
            <StyledPersonIcon />
          )}
          {userData.userRole === 'SuperAdmin' && (
            <>
              <input
                type="file"
                accept="image/*"
                ref={profileFileInputRef}
                onChange={handleProfileImageChange}
                style={{ display: 'none' }}
              />
              <IconButton
                size="small"
                onClick={triggerProfileFileInput}
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
                    value={updatedCustomer[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    size="small"
                    type={field.key === 'advanceAmount' ? 'number' : 'text'}
                    sx={{ width: '200px' }}
                  />
                ) : (
                  <Typography variant="body1" sx={field.style || {}}>
                    {field.format(customerDetails[field.key])}
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
          {customerDetails.cnicFront && (
            <DetailItem>
              <LabelText variant="body1">CNIC Front Image:</LabelText>
              <ValueBox>
                <img
                  src={newCnicFrontImage || `${imageUrl}Customer/${customerDetails.cnicFront}`.replace(/\\/g, '/')}
                  alt="Customer CNIC Front"
                  style={{ maxWidth: '200px', borderRadius: '8px' }}
                  onError={(e) => (e.target.src = placeholderImage)}
                />
                {userData.userRole === 'SuperAdmin' && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      ref={cnicFrontFileInputRef}
                      onChange={handleCnicFrontImageChange}
                      style={{ display: 'none' }}
                    />
                    <IconButton size="small" onClick={triggerCnicFrontFileInput}>
                      <IconEdit />
                    </IconButton>
                  </>
                )}
              </ValueBox>
            </DetailItem>
          )}
          {customerDetails.cnicBack && (
            <DetailItem>
              <LabelText variant="body1">CNIC Back Image:</LabelText>
              <ValueBox>
                <img
                  src={newCnicBackImage || `${imageUrl}Customer/${customerDetails.cnicBack}`.replace(/\\/g, '/')}
                  alt="Customer CNIC Back"
                  style={{ maxWidth: '200px', borderRadius: '8px' }}
                  onError={(e) => (e.target.src = placeholderImage)}
                />
                {userData.userRole === 'SuperAdmin' && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      ref={cnicBackFileInputRef}
                      onChange={handleCnicBackImageChange}
                      style={{ display: 'none' }}
                    />
                    <IconButton size="small" onClick={triggerCnicBackFileInput}>
                      <IconEdit />
                    </IconButton>
                  </>
                )}
              </ValueBox>
            </DetailItem>
          )}
          {customerDetails.BusinessCard && (
            <DetailItem>
              <LabelText variant="body1">Business Card Image:</LabelText>
              <ValueBox>
                <img
                  src={newBusinessCardImage || `${imageUrl}Customer/${customerDetails.BusinessCard}`.replace(/\\/g, '/')}
                  alt="Customer Business Card"
                  style={{ maxWidth: '200px', borderRadius: '8px' }}
                  onError={(e) => (e.target.src = placeholderImage)}
                />
                {userData.userRole === 'SuperAdmin' && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      ref={businessCardFileInputRef}
                      onChange={handleBusinessCardImageChange}
                      style={{ display: 'none' }}
                    />
                    <IconButton size="small" onClick={triggerBusinessCardFileInput}>
                      <IconEdit />
                    </IconButton>
                  </>
                )}
              </ValueBox>
            </DetailItem>
          )}
          {isEditing && userData.userRole === 'SuperAdmin' && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button variant="contained" color="primary" onClick={handleUpdate}>
                Update Customer
              </Button>
            </Box>
          )}
        </Box>
      </ProfileBox>
    </StyledBox>
  );
};

export default CustomersProfile;
