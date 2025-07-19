import { message } from 'antd';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button, Form, Modal, Col, InputGroup, Row, FloatingLabel } from 'react-bootstrap';

const AllProperties = () => {
   const [image, setImage] = useState(null);
   const [editingPropertyId, setEditingPropertyId] = useState(null);
   const [editingPropertyData, setEditingPropertyData] = useState({
      propertyType: '',
      propertyAdType: '',
      propertyAddress: '',
      ownerContact: '',
      propertyAmt: 0,
      additionalInfo: '',
      isAvailable: 'Available',
   });
   const [allProperties, setAllProperties] = useState([]);
   const [show, setShow] = useState(false);

   const handleClose = () => {
      setShow(false);
      setImage(null);
      setEditingPropertyId(null);
      setEditingPropertyData({
         propertyType: '',
         propertyAdType: '',
         propertyAddress: '',
         ownerContact: '',
         propertyAmt: 0,
         additionalInfo: '',
         isAvailable: 'Available',
      });
   };

   const handleShow = (propertyId) => {
      const propertyToEdit = allProperties.find(property => property._id === propertyId);
      if (propertyToEdit) {
         setEditingPropertyId(propertyId);
         setEditingPropertyData(propertyToEdit);
         setShow(true);
      }
   };

   const getAllProperty = async () => {
      try {
         const response = await axios.get('http://localhost:8001/api/owner/getallproperties', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
         });
         if (response.data.success) {
            setAllProperties(response.data.data);
         } else {
            message.error('Something went wrong');
         }
      } catch (error) {
         console.log(error);
      }
   };

   useEffect(() => {
      getAllProperty();
   }, []);

   const handleImageChange = (e) => {
      const file = e.target.files[0];
      setImage(file);
   };

   const handleChange = (e) => {
      const { name, value } = e.target;
      setEditingPropertyData(prev => ({ ...prev, [name]: value }));
   };

   const saveChanges = async (propertyId, status = editingPropertyData.isAvailable) => {
      try {
         const formData = new FormData();
         formData.append('propertyType', editingPropertyData.propertyType);
         formData.append('propertyAdType', editingPropertyData.propertyAdType);
         formData.append('propertyAddress', editingPropertyData.propertyAddress);
         formData.append('ownerContact', editingPropertyData.ownerContact);
         formData.append('propertyAmt', editingPropertyData.propertyAmt);
         formData.append('additionalInfo', editingPropertyData.additionalInfo);
         if (image) {
            formData.append('propertyImage', image);
         }
         formData.append('isAvailable', status);

         const res = await axios.patch(
            `http://localhost:8001/api/owner/updateproperty/${propertyId}`,
            formData,
            {
               headers: {
                  'Authorization': `Bearer ${localStorage.getItem("token")}`,
                  'Content-Type': 'multipart/form-data'
               }
            }
         );

         if (res.data.success) {
            message.success(res.data.message);
            getAllProperty();
            handleClose();
         }
      } catch (error) {
         console.error(error);
         message.error('Failed to save changes');
      }
   };

   const handleDelete = async (propertyId) => {
      const confirmDelete = window.confirm("Are you sure you want to delete?");
      if (confirmDelete) {
         try {
            const response = await axios.delete(
               `http://localhost:8001/api/owner/deleteproperty/${propertyId}`,
               { headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` } }
            );

            if (response.data.success) {
               message.success(response.data.message);
               getAllProperty();
            } else {
               message.error(response.data.message);
            }
         } catch (error) {
            console.log(error);
         }
      }
   };

   return (
      <div>
         <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="property table">
               <TableHead>
                  <TableRow>
                     <TableCell>Property ID</TableCell>
                     <TableCell align="center">Property Type</TableCell>
                     <TableCell align="center">Ad Type</TableCell>
                     <TableCell align="center">Address</TableCell>
                     <TableCell align="center">Owner Contact</TableCell>
                     <TableCell align="center">Amount</TableCell>
                     <TableCell align="center">Availability</TableCell>
                     <TableCell align="center">Actions</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {allProperties.map((property) => (
                     <TableRow key={property._id}>
                        <TableCell>{property._id}</TableCell>
                        <TableCell align="center">{property.propertyType}</TableCell>
                        <TableCell align="center">{property.propertyAdType}</TableCell>
                        <TableCell align="center">{property.propertyAddress}</TableCell>
                        <TableCell align="center">{property.ownerContact}</TableCell>
                        <TableCell align="center">{property.propertyAmt}</TableCell>
                        <TableCell align="center">{property.isAvailable}</TableCell>
                        <TableCell align="center">
                           <Button variant="outline-info" onClick={() => handleShow(property._id)}>
                              Edit
                           </Button>
                           <Modal show={show && editingPropertyId === property._id} onHide={handleClose}>
                              <Modal.Header closeButton>
                                 <Modal.Title>Edit Property</Modal.Title>
                              </Modal.Header>
                              <Modal.Body>
                                 <Form onSubmit={(e) => {
                                    e.preventDefault();
                                    saveChanges(property._id);
                                 }}>
                                    <Row className="mb-3">
                                       <Col md={4}>
                                          <Form.Label>Property Type</Form.Label>
                                          <Form.Select
                                             name="propertyType"
                                             value={editingPropertyData.propertyType}
                                             onChange={handleChange}
                                          >
                                             <option disabled value="">Choose...</option>
                                             <option value="residential">Residential</option>
                                             <option value="commercial">Commercial</option>
                                             <option value="land/plot">Land/Plot</option>
                                          </Form.Select>
                                       </Col>
                                       <Col md={4}>
                                          <Form.Label>Ad Type</Form.Label>
                                          <Form.Select
                                             name="propertyAdType"
                                             value={editingPropertyData.propertyAdType}
                                             onChange={handleChange}
                                          >
                                             <option disabled value="">Choose...</option>
                                             <option value="rent">Rent</option>
                                             <option value="sale">Sale</option>
                                          </Form.Select>
                                       </Col>
                                       <Col md={4}>
                                          <Form.Label>Address</Form.Label>
                                          <Form.Control
                                             type="text"
                                             name="propertyAddress"
                                             value={editingPropertyData.propertyAddress}
                                             onChange={handleChange}
                                             required
                                          />
                                       </Col>
                                    </Row>
                                    <Row className="mb-3">
                                       <Col md={6}>
                                          <Form.Label>Image</Form.Label>
                                          <Form.Control
                                             type="file"
                                             accept="image/*"
                                             onChange={handleImageChange}
                                          />
                                       </Col>
                                       <Col md={3}>
                                          <Form.Label>Contact</Form.Label>
                                          <Form.Control
                                             type="text"
                                             name="ownerContact"
                                             value={editingPropertyData.ownerContact}
                                             onChange={handleChange}
                                             required
                                          />
                                       </Col>
                                       <Col md={3}>
                                          <Form.Label>Amount</Form.Label>
                                          <Form.Control
                                             type="number"
                                             name="propertyAmt"
                                             value={editingPropertyData.propertyAmt}
                                             onChange={handleChange}
                                             required
                                          />
                                       </Col>
                                    </Row>
                                    <FloatingLabel label="Additional Info" className="mb-3">
                                       <Form.Control
                                          as="textarea"
                                          name="additionalInfo"
                                          value={editingPropertyData.additionalInfo}
                                          onChange={handleChange}
                                          placeholder="Additional Info"
                                       />
                                    </FloatingLabel>
                                    <Button type="submit" variant="outline-info" className="float-end">Update</Button>
                                 </Form>
                              </Modal.Body>
                           </Modal>
                           <Button
                              variant="outline-danger"
                              className="mx-2"
                              onClick={() => handleDelete(property._id)}
                           >
                              Delete
                           </Button>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </TableContainer>
      </div>
   );
};

export default AllProperties;
