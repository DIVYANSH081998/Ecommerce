import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Alert,
  Box,
  Chip,

  Stack,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Grid,
  Avatar,
  CircularProgress,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DirectionsBikeOutlinedIcon from '@mui/icons-material/DirectionsBikeOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import LaptopWindowsOutlinedIcon from '@mui/icons-material/LaptopWindowsOutlined';
import axios from 'axios';

import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';

import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';

import SearchIcon from '@mui/icons-material/Search';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewListIcon from '@mui/icons-material/ViewList';


const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://ecommerce-backend-one-ashy.vercel.app/api'
    : 'http://localhost:5000/api');
const Tablestyle = {
  table: {
    '& .MuiTableCell-head': {
      backgroundColor: '#f5f5f5',
      fontWeight: 700,
      color: '#2c3e50',
      padding: '8px 16px',
    },
    '& .MuiTableRow-root:nth-of-type(even)': {
      backgroundColor: '#fafafa',
    },
    '& .MuiTableRow-root:hover': {
      backgroundColor: '#f0f7ff',
    },
  },
  tableContainer: {
    borderRadius: 2,
    boxShadow: 'none',
    border: '1px solid #e0e0e0',
    maxHeight: 'calc(100vh - 300px)',
    '& .MuiTableHead-root': {
      position: 'sticky',
      top: 0,
      zIndex: 1,
    },
  },
};


function App() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDescription, setOrderDescription] = useState('');
  const [selectedProducts, setSelectedProducts] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [searchResults, setSearchResults] = useState([]); 
  const [isSearchActive, setIsSearchActive] = useState(false); 
  const theme = useTheme();

  const [products] = useState([
    { id: 1, productname: 'HP laptop', productdescription: 'This is HP laptop', icon: <LaptopWindowsOutlinedIcon/> },
    { id: 2, productname: 'lenovo laptop', productdescription: 'This is lenovo', icon: <LaptopWindowsOutlinedIcon/> },
    { id: 3, productname: 'Car', productdescription: 'This is Car', icon: <DirectionsCarFilledOutlinedIcon/> },
    { id: 4, productname: 'Bike', productdescription: 'This is Bike', icon: <DirectionsBikeOutlinedIcon/> },
  ]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/order`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (order = null) => {
    setError('');
    setSelectedOrder(order);
    if (order) {
      setOrderDescription(order.orderdescription);
     
      const productMap = {};
      if (order.products) {
        order.products.forEach(product => {
          productMap[product.id] = true;
        });
      }
      setSelectedProducts(productMap);
    } else {
      setOrderDescription('');
      setSelectedProducts({});
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setError('');
    setOpenDialog(false);
    setSelectedOrder(null);
    setOrderDescription('');
    setSelectedProducts({});
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (!orderDescription.trim()) {
        setError('Order description is required');
        return;
      }

      const productIds = Object.keys(selectedProducts).filter(id => selectedProducts[id]);
      if (productIds.length === 0) {
        setError('Please select at least one product');
        return;
      }

      const orderData = {
        orderDescription: orderDescription,
        productIds: productIds.map(Number),
      };

      if (selectedOrder) {
        await axios.put(`${API_BASE_URL}/orders/${selectedOrder.id}`, orderData);
      } else {
        await axios.post(`${API_BASE_URL}/orders`, orderData);
      }

      handleCloseDialog();
      fetchOrders();
    } catch (error) {
      console.error('Error saving order:', error);
      setError('Failed to save order. Please try again.');
    }
  };

  const handleDelete = async (orderId) => {
    try {
      setError('');
      await axios.delete(`${API_BASE_URL}/orders/${orderId}`);
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Failed to delete order. Please try again.');
    }
  };
  const fetchOrderById = async (searchTerm) => {
    try {
      setLoadingOrder(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/order/${searchTerm}`);
    
      if (response.data) {
        setSearchResults(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        setSearchResults([]);
      }
      setIsSearchActive(true);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to fetch order. Please try again.');
      setSearchResults([]);
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm) {
      fetchOrderById(searchTerm);
      setSearchTerm('');
    } else {
      setIsSearchActive(false);
      setSearchResults([]);
      fetchOrders();
    }
  };

  const displayOrders = isSearchActive ? searchResults : (orders || []);

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Stack spacing={4}>
        <Card elevation={0} sx={{ bgcolor: 'primary.main', color: 'white', p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <DashboardIcon sx={{ fontSize: 40 }} />
            <Typography variant="h4" fontWeight="bold">
              Order Management Dashboard
            </Typography>
          </Stack>
        </Card>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center"
                >
                  <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
                    <ShoppingCartIcon />
                  </Avatar>
                  <Stack >
                    <Typography variant="h4" fontWeight="bold">
                      {orders.length}
                    </Typography>
                    <Typography color="text.secondary">Total Orders</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'secondary.light', width: 56, height: 56 }}>
                    <LocalMallOutlinedIcon />
                  </Avatar>
                  <Stack>
                    <Typography variant="h4" fontWeight="bold">
                      {products.length}
                    </Typography>
                    <Typography color="text.secondary">Available Products</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <TextField
                    
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon  onClick={handleSearch} 
                           sx={{ cursor: 'pointer' }}/>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ bgcolor: 'background.paper' }}
                  />
                  <Stack direction="row" spacing={1}>
                    
                    {isSearchActive && (
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => {
                          setIsSearchActive(false);
                          setSearchResults([]);
                          setSearchTerm('');
                          fetchOrders();
                        }}
                        startIcon={<ViewListIcon />}
                      >
                        Show All
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">
                  Orders List
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddCircleIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  New Order
                </Button>
              </Stack>
              <Divider />
              <TableContainer sx={Tablestyle.tableContainer}>
                <Table stickyHeader sx={Tablestyle.table}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Products</TableCell>
                      <TableCell>Created Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading || loadingOrder ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : displayOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary">No orders found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Chip
                              label={`#${order.id}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{order.orderdescription}</TableCell>
                          <TableCell>
                            <Chip
                              label={`${order.countofproducts || 0} items`}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdat).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenDialog(order)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(order.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {selectedOrder ? 'Edit Order' : 'Create New Order'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2, borderRadius: '8px' }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Order Description"
            value={orderDescription}
            onChange={(e) => setOrderDescription(e.target.value)}
            margin="normal"
            required
            error={!orderDescription.trim()}
            helperText={!orderDescription.trim() ? 'Order description is required' : ''}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
          <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 500 }}>
            Select Products:
          </Typography>
          <Box sx={{ display: 'grid', gap: 1 }}>
            <Paper
              sx={{
                p: 2,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: '#f8f9fa',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5" sx={{ minWidth: 40 }}>
                  <FactCheckOutlinedIcon/>
                </Typography>
                <Box flex={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Select All Products
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={products.every(p => selectedProducts[p.id])}
                      indeterminate={products.some(p => selectedProducts[p.id]) && !products.every(p => selectedProducts[p.id])}
                      onChange={(e) => {
                        const newSelected = {};
                        products.forEach(product => {
                          newSelected[product.id] = e.target.checked;
                        });
                        setSelectedProducts(newSelected);
                      }}
                    />
                  }
                  label=""
                  sx={{ m: 0 }}
                />
              </Box>
            </Paper>
            {products.map((product) => (
              <Paper
                key={product.id}
                sx={{
                  p: 2,
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: selectedProducts[product.id] ? 'primary.main' : 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h5" sx={{ minWidth: 40 }}>
                    {product.icon}
                  </Typography>
                  <Box 
                    flex={1} 
                    onClick={() => setSelectedProducts({
                      ...selectedProducts,
                      [product.id]: !selectedProducts[product.id]
                    })}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {product.productname}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.productdescription}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!selectedProducts[product.id]}
                        onChange={(e) => {
                          setSelectedProducts({
                            ...selectedProducts,
                            [product.id]: e.target.checked
                          });
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    }
                    label=""
                    sx={{ m: 0 }}
                  />
                </Box>
              </Paper>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={Tablestyle.actionButton}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            sx={Tablestyle.actionButton}
          >
            {selectedOrder ? 'Update Order' : 'Create Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;