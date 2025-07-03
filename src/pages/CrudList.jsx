import React, { useContext, useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button,
  TextField, Typography, Skeleton, Box
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { HeaderContext } from '../layout/Header';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function CrudList({ UserData = [], setUserForm, fetchUsers }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const { currentTheme } = useContext(HeaderContext);
  const darkTheme = createTheme({ palette: { mode: currentTheme } });
  const { t } = useTranslation();

  const filteredUsers = UserData.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [UserData]);

  const deleteUser = async (user) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/users/${user._id}`);
      toast.success("User deleted");
      fetchUsers(); // Refresh list from DB
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Typography variant="h5" align="center" gutterBottom>
        {t("userList")}
      </Typography>
      <hr />

      {loading ? (
        <Box>
          <Skeleton variant="text" height={40} />
          <Skeleton variant="rectangular" height={50} sx={{ my: 1 }} />
          <Skeleton variant="rectangular" height={50} sx={{ my: 1 }} />
          <Skeleton variant="rectangular" height={50} sx={{ my: 1 }} />
        </Box>
      ) : (
        <>
          {UserData.length > 0 && (
            <div className='mb-2'>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("searchByNameOrEmail")}
                margin="dense"
              />
            </div>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("name")}</TableCell>
                  <TableCell>{t("email")}</TableCell>
                  <TableCell align="right">{t("actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          color="warning"
                          size="small"
                          onClick={() => setUserForm(user)}
                          sx={{ mr: 1 }}
                        >
                          {t("edit")}
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => deleteUser(user)}
                        >
                          {t("delete")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      {t("noUsersFound")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </ThemeProvider>
  );
}
