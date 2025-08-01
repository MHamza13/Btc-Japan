import React, { useState, useEffect, useRef } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import {
  Container,
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  TextField,
  Autocomplete,
  IconButton,
  Typography
} from '@mui/material';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { fetchVendorList } from 'store/vendor/vendorActions';
import { useNavigate, useParams } from 'react-router';
import { addCar, fetchEditCarList, updateCar } from 'store/car/carActions';
import BackDropLoading from 'views/utilities/BackDropLoading';
import moment from 'moment/moment';
import { fetchCountryList, fetchCurrenciesList } from 'store/country/countryActions';
import Swal from 'sweetalert2';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ImageIcon from '@mui/icons-material/Image';
import { fetchCategoryList } from 'store/category/categoryAction';
import { fetchStationList } from 'store/station/StationAction';
import { imageUrl } from 'utils/ApiUrls';

// List of 100+ random colors (unchanged)
const colors = [
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Purple',
  'Orange',
  'Pink',
  'Black',
  'White',
  'Gray',
  'Silver',
  'Gold',
  'Bronze',
  'Brown',
  'Beige',
  'Turquoise',
  'Cyan',
  'Magenta',
  'Lime',
  'Teal',
  'Indigo',
  'Violet',
  'Maroon',
  'Navy',
  'Olive',
  'Coral',
  'Crimson',
  'Fuchsia',
  'Slate',
  'Aqua',
  'Lavender',
  'Peach',
  'Mint',
  'Ivory',
  'Amber',
  'Emerald',
  'Sapphire',
  'Ruby',
  'Topaz',
  'Onyx',
  'Pearl',
  'Plum',
  'Charcoal',
  'Ebony',
  'Sand',
  'Khaki',
  'Burgundy',
  'Tangerine',
  'Lilac',
  'Mauve',
  'Sky Blue',
  'Forest Green',
  'Mustard',
  'Salmon',
  'Rose',
  'Denim',
  'Copper',
  'Steel',
  'Ash',
  'Saffron',
  'Jade',
  'Cerulean',
  'Sepia',
  'Taupe',
  'Rust',
  'Cobalt',
  'Periwinkle',
  'Orchid',
  'Sienna',
  'Umber',
  'Vermilion',
  'Chartreuse',
  'Aquamarine',
  'Bisque',
  'Carmine',
  'Celadon',
  'Champagne',
  'Chestnut',
  'Claret',
  'Eggplant',
  'Fawn',
  'Flax',
  'Garnet',
  'Hazel',
  'Lemon',
  'Malachite',
  'Moccasin',
  'Mulberry',
  'Ochre',
  'Pewter',
  'Pine',
  'Pistachio',
  'Prune',
  'Quartz',
  'Raspberry',
  'Sable',
  'Scarlet',
  'Tan',
  'Thistle',
  'Ultramarine',
  'Vanilla',
  'Wheat',
  'Wine',
  'Zinc',
  'Jet Black',
  'Snow White',
  'Midnight Blue'
];

// Validation schema (updated to include otherDetails as optional)
const validation = yup.object({
  model: yup.string('Enter Model').required('Model is required'),
  chassisNo: yup.string('Enter Chassis No').required('Chassis No is required'),
  purchasePrice: yup.string('Enter Purchase Price').required('Purchase Price is required'),
  purchaseVendorId: yup.string('Select Purchase Vendor').required('Purchase Vendor is required'),
  purchaseCurrency: yup.string('Select Currency').required('Currency is required'),
  category: yup.string('Select Category').required('Category is required'),
  countryId: yup.string('Select Country').required('Country is required'),
  otherDetails: yup.string('Enter Other Details') // Optional field, no required validation
});

function CarAdd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const vendorList = useSelector((state) => state.vendor.vlist || []);
  const currenciesList = useSelector((state) => state.countries.currenciesList || []);
  const countryList = useSelector((state) => state.countries.list || []);
  const editCarList = useSelector((state) => state.car.caEditList || {});
  const categoriesList = useSelector((state) => state.category.categoryList || []);
  const stationList = useSelector((state) => state.stations.list || []);
  const userData = useSelector((state) => state.user.user || {});
  const loading = useSelector((state) => state.car.loading);
  const todayDate = moment().format('YYYY-MM-DD');

  const [country, setCountry] = useState({
    id: userData.userRole === 'SuperAdmin' ? (id && editCarList?.countryId ? editCarList.countryId : 0) : userData.countryId || 0,
    name:
      userData.userRole === 'SuperAdmin'
        ? id && editCarList?.countryId
          ? countryList.find((c) => c.id === editCarList.countryId)?.name || 'Select Country'
          : 'Select Country'
        : userData.countryName || ''
  });
  const [stationValue, setStationValue] = useState({
    id: editCarList?.stationId || 0,
    stationName: editCarList?.stationId
      ? stationList.find((s) => s.id === editCarList.stationId)?.stationName || 'Select Station'
      : 'Select Station'
  });
  const [previewImages, setPreviewImages] = useState([]);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Filter vendors and stations based on the selected country
  const filteredVendors = vendorList.filter((vendor) => Number(vendor.countryId) === Number(country.id));
  const filteredStations = stationList.filter((station) => Number(station.country) === Number(country.id));
  // Filter active categories
  const activeCategories = categoriesList.filter((category) => category.status === 'active');

  useEffect(() => {
    dispatch(fetchCurrenciesList());
    dispatch(fetchCountryList());
    dispatch(fetchVendorList());
    dispatch(fetchCategoryList());
    dispatch(fetchStationList());
    if (id) {
      dispatch(fetchEditCarList(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (id && editCarList?.stationId && stationList.length > 0) {
      const currentStation = stationList.find((station) => station.id === editCarList.stationId) || {
        id: 0,
        stationName: 'Select Station'
      };
      setStationValue(currentStation);
      formik.setFieldValue('stationId', currentStation.id || '');
    }
  }, [editCarList, stationList]);

  useEffect(() => {
    if (id && editCarList?.countryId && countryList.length > 0) {
      const currentCountry = countryList.find((c) => c.id === editCarList.countryId) || {
        id: 0,
        name: 'Select Country'
      };
      setCountry(currentCountry);
      formik.setFieldValue('countryId', currentCountry.id || '');
    }
  }, [editCarList, countryList]);

  useEffect(() => {
    if (id && editCarList?.galleryImages && editCarList.galleryImages !== '') {
      try {
        const existingImages =
          typeof editCarList.galleryImages === 'string' && editCarList.galleryImages.startsWith('[')
            ? JSON.parse(editCarList.galleryImages)
            : editCarList.galleryImages.split(',').map((url) => url.trim());
        const formattedImages = existingImages.map((url, index) => ({
          url: url.startsWith('http') ? url : `${imageUrl}/${url}`,
          name: `Existing Image ${index + 1}`,
          file: null,
          isExisting: true
        }));
        setPreviewImages(formattedImages);
      } catch (e) {
        console.error('Failed to parse galleryImages:', e);
        setPreviewImages([]);
      }
    }
  }, [editCarList]);

  // Reset vendor, currency, and station when country changes
  useEffect(() => {
    formik.setFieldValue('purchaseVendorId', '');
    formik.setFieldValue('purchaseCurrency', '');
    formik.setFieldValue('stationId', '');
    setStationValue({ id: 0, stationName: 'Select Station' });
  }, [country.id]);

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + previewImages.length > 20) {
      Swal.fire({ title: 'Error!', text: 'You can only upload up to 20 images.', icon: 'error' });
      return;
    }
    const validFiles = files.filter((file) => file.type === 'image/png' || file.type === 'image/jpeg');
    if (validFiles.length !== files.length) {
      Swal.fire({ title: 'Warning!', text: 'Some files were skipped. Only PNG and JPEG images are allowed.', icon: 'warning' });
    }
    const newPreviews = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      isExisting: false
    }));
    setPreviewImages((prev) => [...prev, ...newPreviews]);
    formik.setFieldValue('galleryImages', [...previewImages.filter((img) => !img.isExisting).map((img) => img.file), ...validFiles]);
  };

  const handleCameraImage = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + previewImages.length > 20) {
      Swal.fire({ title: 'Error!', text: 'You can only upload up to 20 images.', icon: 'error' });
      return;
    }
    const validFiles = files.filter((file) => file.type === 'image/png' || file.type === 'image/jpeg');
    if (validFiles.length === 0) {
      Swal.fire({ title: 'Error!', text: 'Please capture a valid PNG or JPEG image.', icon: 'error' });
      return;
    }
    const newPreviews = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      isExisting: false
    }));
    setPreviewImages((prev) => [...prev, ...newPreviews]);
    formik.setFieldValue('galleryImages', [...previewImages.filter((img) => !img.isExisting).map((img) => img.file), ...validFiles]);
  };

  const handleRemoveImage = (index) => {
    const newPreviews = [...previewImages];
    const removed = newPreviews.splice(index, 1)[0];
    setPreviewImages(newPreviews);
    if (!removed.isExisting) {
      URL.revokeObjectURL(removed.url);
      const newImages = formik.values.galleryImages.filter((file) => file.name !== removed.name);
      formik.setFieldValue('galleryImages', newImages);
    }
  };

  const handleCameraClick = () => cameraInputRef.current.click();
  const handleGalleryClick = () => galleryInputRef.current.click();

  const handleVendorChange = (event) => {
    const vendorId = event.target.value;
    formik.handleChange(event);
    const selectedVendor = filteredVendors.find((vendor) => vendor.id === vendorId);
    if (selectedVendor && selectedVendor.currency) {
      const matchingCurrency = currenciesList.find((currency) => currency.title === selectedVendor.currency);
      formik.setFieldValue('purchaseCurrency', matchingCurrency ? matchingCurrency.title : '');
    } else {
      formik.setFieldValue('purchaseCurrency', '');
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    validateOnMount: true,
    initialValues: {
      model: id && editCarList?.model ? `${editCarList.model}` : '',
      chassisNo: id && editCarList?.chassisNo ? `${editCarList.chassisNo}` : '',
      purchasePrice: id && editCarList?.purchasePrice ? `${editCarList.purchasePrice}` : '',
      purchaseVendorId: id && editCarList?.purchaseVendorId ? `${editCarList.purchaseVendorId}` : '',
      purchaseCurrency: id && editCarList?.purchaseCurrency ? `${editCarList.purchaseCurrency}` : '',
      isAvailable: id && editCarList?.isAvailable !== undefined ? `${editCarList.isAvailable}` : true,
      purchaseDate: id && editCarList?.purchaseDate ? moment(editCarList.purchaseDate).format('YYYY-MM-DD') : todayDate,
      galleryImages: [],
      purchaseDetails: id && editCarList?.purchaseDetails ? `${editCarList.purchaseDetails}` : '',
      bodyType: id && editCarList?.bodyType ? `${editCarList.bodyType}` : '',
      location: id && editCarList?.location ? `${editCarList.location}` : '',
      manufactureYear:
        id && editCarList?.manufactureYear && moment(editCarList.manufactureYear).isValid()
          ? moment(editCarList.manufactureYear).format('YYYY-MM-DD')
          : '',
      engineCC: id && editCarList?.engineCC ? `${editCarList.engineCC}` : '',
      mileage: id && editCarList?.mileage ? `${editCarList.mileage}` : '',
      seatingCapicaty: id && editCarList?.seatingCapicaty ? `${editCarList.seatingCapicaty}` : '',
      doors: id && editCarList?.doors ? `${editCarList.doors}` : '',
      cylinders: id && editCarList?.cylinders ? `${editCarList.cylinders}` : '',
      horespower: id && editCarList?.horespower ? `${editCarList.horespower}` : '',
      steeringSide: id && editCarList?.steeringSide ? `${editCarList.steeringSide}` : '',
      driveSystem: id && editCarList?.driveSystem ? `${editCarList.driveSystem}` : '',
      transmission: id && editCarList?.transmission ? `${editCarList.transmission}` : '',
      condition: id && editCarList?.condition ? `${editCarList.condition}` : '',
      fuelType: id && editCarList?.fuelType ? `${editCarList.fuelType}` : '',
      color: id && editCarList?.color ? `${editCarList.color}` : '',
      stationId: id && editCarList?.stationId ? `${editCarList.stationId}` : '',
      category: id && editCarList?.category ? `${editCarList.category}` : '',
      countryId:
        id && editCarList?.countryId ? `${editCarList.countryId}` : userData.userRole !== 'SuperAdmin' ? userData.countryId || '' : '',
      isMoved: false,
      otherDetails: id && editCarList?.details ? `${editCarList.details}` : '' // New field for Other Details
    },
    validationSchema: validation,
    onSubmit: (values) => {
      const formData = new FormData();
      formData.append('Model', values.model);
      formData.append('CountryId', values.countryId || country.id || '');
      formData.append('ChassisNo', values.chassisNo);
      formData.append('PurchasePrice', values.purchasePrice);
      formData.append('PurchaseVendorId', values.purchaseVendorId);
      formData.append('PurchaseCurrency', values.purchaseCurrency);
      formData.append('PurchaseDate', values.purchaseDate);
      formData.append('PurchaseDetails', values.purchaseDetails || '');
      formData.append('IsAvailable', values.isAvailable.toString());
      formData.append('Location', values.location || '');
      formData.append('BodyType', values.bodyType || '');
      formData.append('YearOfManufacture', values.manufactureYear || '');
      formData.append('EngineCC', values.engineCC || '');
      formData.append('Mileage', values.mileage || '');
      formData.append('SeatingCapicaty', values.seatingCapicaty || '');
      formData.append('Doors', values.doors || '');
      formData.append('Cylinders', values.cylinders || '');
      formData.append('Horespower', values.horespower || '');
      formData.append('SteeringSide', values.steeringSide || '');
      formData.append('DriveSystem', values.driveSystem || '');
      formData.append('Transmission', values.transmission || '');
      formData.append('Condition', values.condition || '');
      formData.append('FuelType', values.fuelType || '');
      formData.append('Color', values.color || '');
      formData.append('StationId', values.stationId || '');
      formData.append('Category', values.category || '');
      formData.append('IsMoved', values.isMoved.toString());
      formData.append('Details', values.otherDetails || ''); // Append Other Details to FormData

      if (values.galleryImages && values.galleryImages.length > 0) {
        values.galleryImages.forEach((file) => {
          formData.append('GalleryImages', file);
        });
      }

      if (id) {
        const existingImages =
          editCarList?.galleryImages && editCarList.galleryImages !== ''
            ? typeof editCarList.galleryImages === 'string' && editCarList.galleryImages.startsWith('[')
              ? JSON.parse(editCarList.galleryImages)
              : editCarList.galleryImages.split(',').map((url) => url.trim())
            : [];
        const remainingExistingImages = existingImages.filter((url) =>
          previewImages.some((img) => img.url === (url.startsWith('http') ? url : `${imageUrl}/${url}`) && img.isExisting)
        );
        formData.append('ExistingGalleryImages', JSON.stringify(remainingExistingImages.length > 0 ? remainingExistingImages : []));
      }

      console.log('Form Data being sent:');
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      if (id) {
        dispatch(updateCar(id, formData, navigate));
      } else {
        dispatch(addCar(formData, navigate));
      }
    }
  });

  return (
    <>
      {loading && <BackDropLoading />}
      <MainCard
        title={
          id ? (
            <p
              style={{
                margin: 0,
                fontSize: '1.5rem',
                color: '#121926',
                fontWeight: 700,
                fontFamily: "'Roboto', sans-serif",
                flex: '1 1 100%'
              }}
            >
              Edit Vehicles
            </p>
          ) : (
            <p
              style={{
                margin: 0,
                fontSize: '1.5rem',
                color: '#121926',
                fontWeight: 700,
                fontFamily: "'Roboto', sans-serif",
                flex: '1 1 100%'
              }}
            >
              Add New Vehicles
            </p>
          )
        }
      >
        <Container>
          <Box component="form" noValidate onSubmit={formik.handleSubmit} autoComplete="off">
            <Grid container spacing={2}>
              {/* Country */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required error={Boolean(formik.touched.countryId && formik.errors.countryId)}>
                  <Autocomplete
                    name="countryId"
                    value={country}
                    onChange={(event, newValue) => {
                      const selectedCountry = newValue || { id: 0, name: '' };
                      setCountry(selectedCountry);
                      formik.setFieldValue('countryId', selectedCountry.id || '');
                    }}
                    options={countryList}
                    getOptionLabel={(option) => option.name || ''}
                    renderInput={(params) => <TextField {...params} label="Select Country" />}
                    disabled={userData.userRole !== 'SuperAdmin'}
                  />
                  {formik.touched.countryId && formik.errors.countryId && <FormHelperText error>{formik.errors.countryId}</FormHelperText>}
                </FormControl>
              </Grid>
              {/* Category */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required error={Boolean(formik.touched.category && formik.errors.category)}>
                  <InputLabel>Category</InputLabel>
                  <Select name="category" value={formik.values.category} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                    <MenuItem value="">
                      <em>Select Category</em>
                    </MenuItem>
                    {activeCategories && Array.isArray(activeCategories) && activeCategories.length > 0 ? (
                      activeCategories.map((item) => (
                        <MenuItem key={item.id} value={item.categoryName}>
                          {item.categoryName}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No active categories available</MenuItem>
                    )}
                  </Select>
                  {formik.touched.category && formik.errors.category && <FormHelperText error>{formik.errors.category}</FormHelperText>}
                </FormControl>
              </Grid>
              {/* Model */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required error={Boolean(formik.touched.model && formik.errors.model)}>
                  <InputLabel>Maker Model Variant</InputLabel>
                  <OutlinedInput name="model" value={formik.values.model} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                  {formik.touched.model && formik.errors.model && <FormHelperText error>{formik.errors.model}</FormHelperText>}
                </FormControl>
              </Grid>
              {/* Body Type */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Body Type</InputLabel>
                  <Select name="bodyType" value={formik.values.bodyType} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                    <MenuItem value="">
                      <em>Select Body Type</em>
                    </MenuItem>
                    {[
                      'Sedan',
                      'SUV',
                      'Hatchback',
                      'Convertible',
                      'Coupe',
                      'Minivan',
                      'Pickup Truck',
                      'Touring Bus',
                      'Double Decker Bus',
                      'Scooter',
                      'Sport Bike',
                      'Cruiser Bike',
                      'Dirt Bike',
                      'Tractor',
                      'Farm Harvester'
                    ].map((type, i) => (
                      <MenuItem key={i} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Location */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Location</InputLabel>
                  <OutlinedInput name="location" value={formik.values.location} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                </FormControl>
              </Grid>
              {/* Manufacture Year */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <TextField
                    label="Year of Manufacture"
                    type="date"
                    name="manufactureYear"
                    value={formik.values.manufactureYear}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ max: todayDate }}
                  />
                </FormControl>
              </Grid>
              {/* Engine CC */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Engine CC</InputLabel>
                  <Select name="engineCC" value={formik.values.engineCC} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                    <MenuItem value="">
                      <em>Select Engine CC</em>
                    </MenuItem>
                    {[
                      '50cc',
                      '100cc',
                      '125cc',
                      '150cc',
                      '200cc',
                      '250cc',
                      '400cc',
                      '600cc',
                      '800cc',
                      '1000cc',
                      '1300cc',
                      '1500cc',
                      '1800cc',
                      '2000cc',
                      '2500cc',
                      '3000cc',
                      '3500cc',
                      '4000cc',
                      '4500cc',
                      '5000cc'
                    ].map((cc, i) => (
                      <MenuItem key={i} value={cc}>
                        {cc}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Mileage */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Mileage</InputLabel>
                  <OutlinedInput name="mileage" value={formik.values.mileage} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                </FormControl>
              </Grid>
              {/* Seating Capacity */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Seating Capacity</InputLabel>
                  <Select
                    name="seatingCapicaty"
                    value={formik.values.seatingCapicaty}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="">
                      <em>Select Seating Capacity</em>
                    </MenuItem>
                    {[
                      '2 Seater',
                      '4 Seater',
                      '5 Seater',
                      '7 Seater',
                      '8 Seater',
                      '10 Seater',
                      '12 Seater',
                      '15 Seater',
                      '20 Seater',
                      '25 Seater',
                      '30 Seater',
                      '40 Seater',
                      '50+ Seater'
                    ].map((capacity, i) => (
                      <MenuItem key={i} value={capacity}>
                        {capacity}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Doors */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Doors</InputLabel>
                  <Select name="doors" value={formik.values.doors} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                    <MenuItem value="">
                      <em>Select Doors</em>
                    </MenuItem>
                    {['2 Doors', '3 Doors', '4 Doors', '5 Doors', '6 Doors', 'More than 6 Doors'].map((doors, i) => (
                      <MenuItem key={i} value={doors}>
                        {doors}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Cylinders */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Cylinders</InputLabel>
                  <Select name="cylinders" value={formik.values.cylinders} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                    <MenuItem value="">
                      <em>Select Cylinders</em>
                    </MenuItem>
                    {[
                      '2 Cylinders',
                      '3 Cylinders',
                      '4 Cylinders',
                      '5 Cylinders',
                      '6 Cylinders',
                      '8 Cylinders',
                      '10 Cylinders',
                      '12 Cylinders',
                      '16 Cylinders'
                    ].map((cylinders, i) => (
                      <MenuItem key={i} value={cylinders}>
                        {cylinders}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Horsepower */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Horsepower</InputLabel>
                  <Select name="horespower" value={formik.values.horespower} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                    <MenuItem value="">
                      <em>Select Horsepower</em>
                    </MenuItem>
                    {[
                      'Less than 100 HP',
                      '100 - 200 HP',
                      '200 - 300 HP',
                      '300 - 400 HP',
                      '400 - 500 HP',
                      '500 - 600 HP',
                      '600 - 700 HP',
                      '700+ HP'
                    ].map((hp, i) => (
                      <MenuItem key={i} value={hp}>
                        {hp}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Steering Side */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <FormLabel>Steering Side</FormLabel>
                  <RadioGroup
                    row
                    name="steeringSide"
                    value={formik.values.steeringSide}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <FormControlLabel value="left" control={<Radio />} label="Left-hand Drive" />
                    <FormControlLabel value="right" control={<Radio />} label="Right-hand Drive" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {/* Drive System */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <FormLabel>Drive System</FormLabel>
                  <RadioGroup
                    row
                    name="driveSystem"
                    value={formik.values.driveSystem}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <FormControlLabel value="2WD" control={<Radio />} label="2 WD" />
                    <FormControlLabel value="4WD" control={<Radio />} label="4 WD" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {/* Transmission */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <FormLabel>Transmission</FormLabel>
                  <RadioGroup
                    row
                    name="transmission"
                    value={formik.values.transmission}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <FormControlLabel value="automatic" control={<Radio />} label="Automatic" />
                    <FormControlLabel value="manual" control={<Radio />} label="Manual" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {/* Condition */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Condition</InputLabel>
                  <Select name="condition" value={formik.values.condition} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                    <MenuItem value="">
                      <em>Select Condition</em>
                    </MenuItem>
                    {['New', 'Used', 'Damaged'].map((condition, i) => (
                      <MenuItem key={i} value={condition}>
                        {condition}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Fuel Type */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Fuel Type</InputLabel>
                  <Select name="fuelType" value={formik.values.fuelType} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                    <MenuItem value="">
                      <em>Select Fuel Type</em>
                    </MenuItem>
                    {['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'].map((fuel, i) => (
                      <MenuItem key={i} value={fuel}>
                        {fuel}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Color */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Color</InputLabel>
                  <Select name="color" value={formik.values.color} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                    <MenuItem value="">
                      <em>Select Color</em>
                    </MenuItem>
                    {colors.map((color, index) => (
                      <MenuItem key={index} value={color}>
                        {color}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Camera Input */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: 1,
                      p: 2,
                      borderRadius: '12px',
                      bgcolor: '#f8fafc',
                      border: '1px solid #bfc0c2',
                      cursor: 'pointer'
                    }}
                    onClick={handleCameraClick}
                  >
                    <IconButton color="primary" sx={{ p: 2 }}>
                      <PhotoCameraIcon sx={{ fontSize: 48 }} />
                    </IconButton>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Take New Image
                    </Typography>
                  </Box>
                  <input
                    id="cameraInput"
                    ref={cameraInputRef}
                    type="file"
                    name="galleryImages"
                    accept="image/png, image/jpeg"
                    capture="environment"
                    onChange={handleCameraImage}
                    style={{ display: 'none' }}
                  />
                  <FormHelperText>Click camera icon to capture image</FormHelperText>
                </FormControl>
              </Grid>
              {/* Gallery Upload */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: 1,
                      p: 2,
                      borderRadius: '12px',
                      bgcolor: '#f8fafc',
                      border: '1px solid #bfc0c2',
                      cursor: 'pointer'
                    }}
                  >
                    <IconButton color="primary" sx={{ p: 2 }} onClick={handleGalleryClick} title="Upload Images">
                      <ImageIcon sx={{ fontSize: 48 }} />
                    </IconButton>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Upload from Gallery
                    </Typography>
                  </Box>
                  <input
                    id="galleryInput"
                    ref={galleryInputRef}
                    type="file"
                    name="galleryImages"
                    accept="image/png, image/jpeg"
                    multiple
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <FormHelperText>Click gallery icon to upload images</FormHelperText>
                </FormControl>
              </Grid>
              {/* Image Preview */}
              <Grid item xs={12}>
                {previewImages.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      {previewImages.map((image, index) => (
                        <Grid item key={index}>
                          <Box sx={{ position: 'relative', width: 120, height: 120 }}>
                            <img
                              src={image.url}
                              alt={image.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                            <IconButton
                              onClick={() => handleRemoveImage(index)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
                              }}
                              size="small"
                            >
                              <DeleteIcon color="error" />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Grid>
              {/* Other Details Textarea */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <TextField
                    label="Other Details"
                    name="otherDetails"
                    value={formik.values.otherDetails}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    multiline
                    rows={4}
                    placeholder="Enter any additional details about the vehicle here..."
                  />
                  {formik.touched.otherDetails && formik.errors.otherDetails && (
                    <FormHelperText error>{formik.errors.otherDetails}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              {/* Vendor */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required error={Boolean(formik.touched.purchaseVendorId && formik.errors.purchaseVendorId)}>
                  <InputLabel>Select Purchase Vendor</InputLabel>
                  <Select
                    name="purchaseVendorId"
                    value={formik.values.purchaseVendorId}
                    onChange={handleVendorChange}
                    onBlur={formik.handleBlur}
                    disabled={country.id === 0}
                  >
                    <MenuItem value="">
                      <em>Select Purchase Vendor</em>
                    </MenuItem>
                    {filteredVendors.length > 0 ? (
                      filteredVendors.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.title}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No vendors available for this country</MenuItem>
                    )}
                  </Select>
                  {formik.touched.purchaseVendorId && formik.errors.purchaseVendorId && (
                    <FormHelperText error>{formik.errors.purchaseVendorId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              {/* Purchase Price */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required error={Boolean(formik.touched.purchasePrice && formik.errors.purchasePrice)}>
                  <InputLabel>Purchase Price</InputLabel>
                  <OutlinedInput
                    name="purchasePrice"
                    value={formik.values.purchasePrice}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.purchasePrice && formik.errors.purchasePrice && (
                    <FormHelperText error>{formik.errors.purchasePrice}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              {/* Currency */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required error={Boolean(formik.touched.purchaseCurrency && formik.errors.purchaseCurrency)}>
                  <InputLabel>Select Purchase Currency</InputLabel>
                  <Select
                    name="purchaseCurrency"
                    value={formik.values.purchaseCurrency}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled
                  >
                    <MenuItem value="">
                      <em>Select Purchase Currency</em>
                    </MenuItem>
                    {currenciesList?.map((item, i) => (
                      <MenuItem key={i} value={item.title}>
                        {item.title}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.purchaseCurrency && formik.errors.purchaseCurrency && (
                    <FormHelperText error>{formik.errors.purchaseCurrency}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              {/* Chassis No */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required error={Boolean(formik.touched.chassisNo && formik.errors.chassisNo)}>
                  <InputLabel>Chassis No</InputLabel>
                  <OutlinedInput
                    name="chassisNo"
                    value={formik.values.chassisNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.chassisNo && formik.errors.chassisNo && <FormHelperText error>{formik.errors.chassisNo}</FormHelperText>}
                </FormControl>
              </Grid>
              {/* Purchase Date */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Purchase Date</InputLabel>
                  <OutlinedInput
                    type="date"
                    name="purchaseDate"
                    value={formik.values.purchaseDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </FormControl>
              </Grid>
              {/* Station Selection */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth error={Boolean(formik.touched.stationId && formik.errors.stationId)}>
                  <Autocomplete
                    name="stationId"
                    value={stationValue}
                    onChange={(event, newValue) => {
                      setStationValue(newValue || { id: 0, stationName: 'Select Station' });
                      formik.setFieldValue('stationId', newValue?.id || '');
                    }}
                    options={filteredStations}
                    getOptionLabel={(option) => option.stationName || ''}
                    renderInput={(params) => <TextField {...params} label="Select Station" />}
                    disabled={country.id === 0}
                  />
                  {formik.touched.stationId && formik.errors.stationId && <FormHelperText error>{formik.errors.stationId}</FormHelperText>}
                </FormControl>
              </Grid>
              {/* Submit Button */}
              <Grid item xs={12} sx={{ textAlign: 'right' }}>
                <Button disableElevation size="large" type="submit" variant="contained" color="secondary" disabled={loading}>
                  {id ? 'Update' : 'Submit'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </MainCard>
    </>
  );
}

export default CarAdd;
