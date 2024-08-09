import { useMutation, useQuery } from '@apollo/client';
import { Add, Edit } from '@mui/icons-material';
import { Button, Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { styled as muiStyled } from '@mui/material/styles';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ADD_TRANSACTION, EDIT_TRANSACTION_MUTATION, GET_TRANSACTION } from '../../apis/graphql/queries';


const CardStyle = muiStyled(Card)(({ theme }) => ({
    backgroundColor: 'white',
    margin: '15px',
    boxShadow: '0px 4px 8px rgba(2, 136, 209, 0.3)',
    padding: '20px',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
}));

const FormContainer = muiStyled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
}));

const SubmitButton = muiStyled(Button)(({ theme }) => ({
    backgroundColor: '#4a90e2', // Light Blue
    color: 'white',
    '&:hover': {
        backgroundColor: '#357ABD', // Darker Blue
    },
}));

const TransactionForm = () => {
    const navigate = useNavigate();
    const { transactionId } = useParams();
    const [formData, setFormData] = useState({
        description: '',
        category: 'Deposit',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
    });
    const [loadingError, setLoadingError] = useState('');
    const isEditing = Boolean(transactionId);
    const [editTransaction] = useMutation(EDIT_TRANSACTION_MUTATION);


   const [addTransaction] = useMutation(ADD_TRANSACTION, {
        onError: (error) => {
            setLoadingError(`Error adding transaction: ${error.message}`);
        },
    });

    useQuery(GET_TRANSACTION, {
        variables: { id: transactionId },
        skip: !isEditing,
        onCompleted: (data) => {
            if (data && data.getTransaction) {
                setFormData({
                    description: data.getTransaction.description,
                    category: data.getTransaction.category,
                    amount: data.getTransaction.amount,
                    date: new Date(data.getTransaction.date).toISOString().split('T')[0],
                });
            }
        },
        onError: (error) => {
            setLoadingError(`Error fetching transaction: ${error.message}`);
        },
    });

    // useEffect(() => {
    //     if (isEditing && transactionData) {
    //         const { getTransaction } = transactionData;
    //         setFormData({
    //             description: getTransaction.description,
    //             category: getTransaction.category,
    //             amount: getTransaction.amount,
    //             date: new Date(getTransaction.date).toISOString().split('T')[0],
    //         });
    //     }
    //    }, [transactionId, isEditing]);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prevData => ({ ...prevData, [name]: value }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();

            try {
                if (!formData.description || !formData.category || !formData.amount || !formData.date) {
                    setLoadingError("Please fill in all fields");
                    return;
                }
                if (isEditing) {
                    const { description, category, amount, date } = formData;
                    const response = await editTransaction({ variables: {  id: transactionId, description: description, category: category, amount: parseFloat(amount), date: date } });
                    if (response.data.editTransaction.message === "Transaction updated") {
                        console.log("Transaction updated successfully");
                        navigate('/transactions');
                    } else {
                        console.error("Transaction failed to add");
                        setLoadingError("Error saving data: ");
                    }
                } else {
                    console.log("Adding transaction");
                    const { description, category, amount, date } = formData;
                    //const response = await addTransaction(formData.description, formData.category, formData.amount, formData.date);
                    const response = await addTransaction({ variables: { description, category, amount: parseFloat(amount), date } });
                    console.log("Adding transaction 3");
                    console.log(response.data);
                    console.log(response.data.addTransaction);
                    console.log(response.data.addTransaction.message);

                    if (response.data.addTransaction.message === "Transaction added") {
                        console.log("Transaction added successfully");
                        navigate('/transactions');
                    } else {
                        console.error("Transaction failed to add");
                        setLoadingError("Error saving data: ");
                    }
                }

            } catch (error) {
                setLoadingError("Error saving data: " + error.message);
            }
        };

        return (
            <FormContainer>
                <CardStyle>
                    <CardContent>
                        <Typography variant="h4" component="h2" gutterBottom>
                            {isEditing ? 'Edit Transaction' : 'Add Transaction'}
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl variant="outlined" fullWidth margin="normal">
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            label="Category"
                                        >
                                            <MenuItem value="Deposit">Deposit</MenuItem>
                                            <MenuItem value="Expense">Expense</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Amount"
                                        name="amount"
                                        type="number"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Date"
                                        name="date"
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                {loadingError && (
                                    <Grid item xs={12}>
                                        <Typography color="error">{loadingError}</Typography>
                                    </Grid>
                                )}
                                <Grid item xs={12}>
                                    <SubmitButton
                                        variant="contained"
                                        type="submit"
                                        startIcon={isEditing ? <Edit /> : <Add />}
                                    >
                                        {isEditing ? 'Save Changes' : 'Add Transaction'}
                                    </SubmitButton>
                                </Grid>
                            </Grid>
                        </form>
                    </CardContent>
                </CardStyle>
            </FormContainer>
        );
    };

    export default TransactionForm;
