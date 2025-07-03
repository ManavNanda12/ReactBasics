import React, { useContext, useEffect, useRef, useState } from 'react';
import CrudList from './CrudList';
import { HeaderContext } from '../layout/Header';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function Crud() {
  const [mainForm, setMainForm] = useState({
    _id: null,
    name: '',
    email: '',
    password: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [userList, setUserList] = useState([]);

  const { currentTheme, lang } = useContext(HeaderContext);
  const [formInputClass, setFormInputClass] = useState("form-group");

  const inputRef = useRef(null);
  const { t } = useTranslation();

  // 👉 Fetch users on load
  useEffect(() => {
    fetchUsers();
    focusInput();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/users`);
      setUserList(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (mainForm.name && mainForm.email && mainForm.password) {
      try {
        // Check for duplicate email (client-side)
        const isDuplicate = userList.some(
          user => user.email === mainForm.email && user._id !== mainForm._id
        );
        if (isDuplicate) {
          toast("User with this email already exists.");
          return;
        }

        if (mainForm._id) {
          // Update
          await axios.put(`${process.env.REACT_APP_API_URL}/users/${mainForm._id}`, mainForm);
          toast("User updated successfully.");
        } else {
          // Add
          await axios.post(`${process.env.REACT_APP_API_URL}/users/add`, mainForm);
          toast("User added successfully.");
        }

        setMainForm({ _id: null, name: '', email: '', password: '' });
        setSubmitted(false);
        fetchUsers();
      } catch (err) {
        toast.error("Operation failed");
        console.error(err);
      }
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    setFormInputClass(currentTheme === "dark" ? "form-group custom-dark" : "form-group");
  }, [currentTheme]);

  return (
    <div>
      <div className={formInputClass}>
        <form onSubmit={submitForm} className="form">
          <div className="form-group">
            <label htmlFor="name">{t("name")}</label>
            <input ref={inputRef} type="text" className="form-control" id="name" placeholder={t("enterName")}
              value={mainForm.name} onChange={(e) => setMainForm({ ...mainForm, name: e.target.value })} />
            {submitted && !mainForm.name && <span className='text-danger'>{t("nameRequired")}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">{t("email")}</label>
            <input type="text" className='form-control' id="email" placeholder={t("enterEmail")}
              value={mainForm.email} onChange={(e) => setMainForm({ ...mainForm, email: e.target.value })} />
            {submitted && !mainForm.email && <span className='text-danger'>{t("emailRequired")}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">{t("password")}</label>
            <input type="password" className='form-control' id="password" placeholder={t("enterPassword")}
              value={mainForm.password} onChange={(e) => setMainForm({ ...mainForm, password: e.target.value })} />
            {submitted && !mainForm.password && <span className='text-danger'>{t("passwordRequired")}</span>}
          </div>

          <div className="text-center mt-2">
            <Button variant="contained" type="submit" className="btn btn-primary">
              {mainForm._id ? t("update") : t("add")}
            </Button>
          </div>
        </form>
      </div>

      <div className="main-list mt-2">
        <CrudList UserData={userList} setUserForm={setMainForm} fetchUsers={fetchUsers} />
      </div>
    </div>
  );
}
