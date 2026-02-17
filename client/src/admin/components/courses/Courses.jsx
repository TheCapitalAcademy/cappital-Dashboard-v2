import { Book, BookTwoTone,  Bookmark,  Info, NearMe, Payment, PriceChange, Discount, PercentOutlined, MoneyOff } from '@mui/icons-material';
import { Button, FormControl,  MenuItem, Select, TextField, Switch, FormControlLabel, RadioGroup, Radio, FormLabel } from '@mui/material'
import React, { useState } from 'react'
import axios from 'axios'

//notify
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import axiosInstance from '../../../baseUrl.js';

const Courses = () => {
    const [reload, setReload] = useState(false);
    const { enqueueSnackbar } = useSnackbar();


    const [courseName, setCourseName] = useState('');
    const [coursePrice, setCoursePrice] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState('percentage');
    const [discountActive, setDiscountActive] = useState(false);
    const [courseNameError, setCourseNameError] = useState('');
    const [coursePriceError, setCoursePriceError] = useState('');
    const [courseDescriptionError, setCourseDescriptionError] = useState('');
    const [cData, setcData] = useState([]);

    const handleSubmit = async () => {
        if (!courseName || !coursePrice || !courseDescription) {
            if (!courseName) {
                setCourseNameError('Please enter a course name');
            } else {
                setCourseNameError('');
            }
            if (!coursePrice) {
                setCoursePriceError('Please enter a course price');
            } else {
                setCoursePriceError('');
            }
            if (!courseDescription) {
                setCourseDescriptionError('Please enter a course description');
            } else {
                setCourseDescriptionError('');
            }
            return;
        }
        // Submit the form
        try {
            const res = await axiosInstance.post('/course', { 
                courseName, 
                coursePrice, 
                courseDescription,
                discount,
                discountType,
                discountActive
            })
            enqueueSnackbar(res.data.message, { variant: "success", autoHideDuration: 1500 });
            setReload(!reload)
        } catch (error) {
            enqueueSnackbar("something went Wrong", { variant: 'error', autoHideDuration: 1400 })
            setReload(!reload)
        }
    }

    const handleCourseChange = async (e) => {
        await setCourseName(e.target.value);
        const res = await axiosInstance.get(`/course/${e.target.value}`);
        console.log(res)
        setCoursePrice(res.data.cprice)
        setCourseDescription(res.data.cdesc)
        setDiscount(res.data.cdiscount || 0)
        setDiscountType(res.data.discountType || 'percentage')
        setDiscountActive(res.data.discountActive || false)
    }

    useEffect(() => {
        const fetch = async () => {
            let res = await axiosInstance.get('/course/all');
            console.log(res);
            setcData(res.data)
        }
        fetch();
    },[reload])

    return (
        <div className="admin-courses">
            <div className="container">
                <div className="row my-3 col-md-6">
                    <FormControl error={!!courseNameError}>
                        <strong className='my-2 text-primary fw-bold'>Course Name <Bookmark style={{ color: "blueviolet" }} /></strong>
                        <Select labelId="course-type-label" id="course-type-select" placeholder='Select Course' onChange={(e) => handleCourseChange(e)}>
                            <MenuItem value="nums">Nums</MenuItem>
                            <MenuItem value="mdcat">MdCat</MenuItem>
                            <MenuItem value="mdcat+nums">MdCat + Nums</MenuItem>
                        </Select>
                        {courseNameError && <span className='text-danger'>{courseNameError}</span>}
                    </FormControl>
                </div>
                <div className="row col-md-6 my-2">
                    <FormControl error={!!coursePriceError}>
                        <strong className='my-2 text-primary fw-bold'>Course Price <Payment style={{ color: "goldenrod" }} /></strong>
                        <TextField type="number" value={coursePrice} onChange={(e) => setCoursePrice(e.target.value)} />
                        {coursePriceError && <span className='text-danger'>{coursePriceError}</span>}
                    </FormControl>
                </div>
                
                {/* Discount Section */}
                <div className="row col-md-12 my-3">
                    <div className="col-12 mb-3">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={discountActive}
                                    onChange={(e) => setDiscountActive(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={<strong className='text-primary fw-bold'><Discount style={{ color: "green", marginRight: "5px" }} />Enable Discount</strong>}
                        />
                    </div>
                    
                    {discountActive && (
                        <>
                            <div className="col-md-6 mb-2">
                                <FormControl component="fieldset">
                                    <FormLabel component="legend" className='text-primary fw-bold mb-2'>
                                        Discount Type
                                    </FormLabel>
                                    <RadioGroup
                                        row
                                        value={discountType}
                                        onChange={(e) => setDiscountType(e.target.value)}
                                    >
                                        <FormControlLabel
                                            value="percentage"
                                            control={<Radio />}
                                            label={
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <PercentOutlined fontSize="small" /> Percentage
                                                </span>
                                            }
                                        />
                                        <FormControlLabel
                                            value="fixed"
                                            control={<Radio />}
                                            label={
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <MoneyOff fontSize="small" /> Fixed Amount
                                                </span>
                                            }
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                            
                            <div className="col-md-6 mb-2">
                                <FormControl fullWidth>
                                    <strong className='my-2 text-primary fw-bold'>
                                        Discount Value {discountType === 'percentage' ? '(%)' : '(PKR)'}
                                    </strong>
                                    <TextField
                                        type="number"
                                        value={discount}
                                        onChange={(e) => setDiscount(Number(e.target.value))}
                                        inputProps={{ 
                                            min: 0, 
                                            max: discountType === 'percentage' ? 100 : undefined 
                                        }}
                                    />
                                </FormControl>
                            </div>
                            
                            {coursePrice && discount > 0 && (
                                <div className="col-12">
                                    <div className="alert alert-success" role="alert">
                                        <strong>Final Price: </strong>
                                        {discountType === 'percentage'
                                            ? `PKR ${(coursePrice - (coursePrice * discount / 100)).toFixed(2)}`
                                            : `PKR ${(coursePrice - discount).toFixed(2)}`
                                        }
                                        {' '}
                                        <span className="text-muted">
                                            (Original: PKR {coursePrice})
                                        </span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="mx-2">
                    <div className="row my-4">
                        <FormControl error={!!courseDescriptionError}>
                            <strong className='my-2 text-primary fw-bold'>Course description <Info style={{ color: "teal" }} /></strong>
                            <TextField value={courseDescription} multiline rows={4} onChange={(e) => setCourseDescription(e.target.value)} />
                            {courseDescriptionError && <span className='text-danger'>{courseDescriptionError}</span>}
                        </FormControl>
                    </div>
                    <div className=" my-4">
                        <Button className='pt-2' variant="contained" color="primary" onClick={handleSubmit}>Submit</Button>
                    </div>
                </div>
            </div>

            {/* table of courses */}
            <div className="container table-responsive mt-5 pt-1">
                <table className="table table-striped table-hover table-primary rounded-4 shadow">
                    <thead>
                        <tr >
                            <th scope="col">No</th>
                            <th scope="col">Course Name</th>
                            <th scope="col">Original Price</th>
                            <th scope="col">Discount</th>
                            <th scope="col">Final Price</th>
                            <th scope="col">Course description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cData.map((e, index) => {
                            const discount = e.cdiscount || 0;
                            const finalPrice = e.discountActive
                                ? e.discountType === 'percentage'
                                    ? e.cprice - (e.cprice * discount / 100)
                                    : e.cprice - discount
                                : e.cprice;
                            
                            return (
                                <tr key={index}>
                                    <th scope="row">{index+1}</th>
                                    <td>{e?.cname}</td>
                                    <td>PKR {e?.cprice}</td>
                                    <td>
                                        {e?.discountActive ? (
                                            <span className="badge bg-success">
                                                {discount}{e?.discountType === 'percentage' ? '%' : ' PKR'} OFF
                                            </span>
                                        ) : (
                                            <span className="badge bg-secondary">No Discount</span>
                                        )}
                                    </td>
                                    <td>
                                        <strong>PKR {finalPrice.toFixed(2)}</strong>
                                        {e?.discountActive && (
                                            <span className="text-success ms-2">
                                                ({((e.cprice - finalPrice) / e.cprice * 100).toFixed(0)}% off)
                                            </span>
                                        )}
                                    </td>
                                    <td><textarea style={{resize:"none"}} readOnly className='form-control resize-none'>{e?.cdesc}</textarea></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Courses