import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  TextField,
  Typography,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { HeaderContext } from '../layout/Header';
import { useForm } from 'react-hook-form';
import emailjs from 'emailjs-com';
import Loader from '../common/loader';
import { toast } from 'react-toastify';
import axios from 'axios';
export default function ContactUs() {
  const { t } = useTranslation();
  const { currentTheme } = useContext(HeaderContext);
  const [loading, setLoading] = useState(false);
  const theme = createTheme({ palette: { mode: currentTheme } });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm({ mode: 'onChange' });

  const onSubmit = async (data, e) => {
    e.preventDefault();
    setLoading(true);
    const contactData = {
      name: data.name,
      email: data.email,
      contactNo: data.contactNo,
      message: data.message,
      title: data.title || 'Contact Request'
    };
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/contactedUsers/add`, contactData);
      if(res.success){
        emailjs.send(
          'service_az3inmz',
          'template_zrr4ais',
          contactData,
          'FtmuxWM4nlEWwWmX7'
        )
        .then((result) => {
          toast("Thank you! We'll get back to you soon.");
          setTimeout(() => {
            const replyData = {
              name: data.name,
              email: data.email,
              title: data.title || 'Contact Request'
            };
            replyToCustomer(replyData);
          }, 5000);
          reset();
          setLoading(false);
        })
        .catch((error) => {
          toast("Failed to send email.");
          setLoading(false);
        });
      }
      else{
        toast.error(res.data.message);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send email.");
    }
  };
  
  const replyToCustomer = (replyData) => {
    emailjs.send(
      'service_az3inmz',
      'template_v6eh9oq',
      replyData,
      'FtmuxWM4nlEWwWmX7'
    )
    .then((result) => {
    })
    .catch((error) => {
      console.error("❌ Auto-reply failed:", error.text);
    });
  };
  


  return (
    <ThemeProvider theme={theme}>
        {loading && <Loader showLoader={false} />}
        {!loading && (
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: 3,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: 'background.paper'
        }}
      >
        <Typography variant="h5" align="center">{t("contactUs")}</Typography>

        <TextField
          label={t("enterName")}
          {...register("name", { required: t("nameRequired"), minLength: 3 })}
          error={!!errors.name}
          helperText={errors.name?.message}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/^\s+/, '');
          }}
        />

        <TextField
          label={t("enterEmail")}
          type="email"
          {...register("email", {
            required: t("emailRequired"),
            pattern: {
              value: /^\S+@\S+$/i,
              message: t("invalidEmail")
            }
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^\w@+.-]/g, '');
          }}
        />

        <TextField
          label={t("enterContactNo")}
          {...register("contactNo", {
            required: t("contactNoRequired"),
            minLength: { value: 10, message: t("contactNoInvalid") },
            maxLength: { value: 10, message: t("contactNoInvalid") }
          })}
          error={!!errors.contactNo}
          helperText={errors.contactNo?.message}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
          }}
        />

        <TextField
          label={t("enterMessage")}
          multiline
          rows={4}
          {...register("message", { required: t("messageRequired") })}
          error={!!errors.message}
          helperText={errors.message?.message}  
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^\w\s]/g, '');
          }}
        />

        <Button type="submit" variant="contained" color="primary" fullWidth disabled={!isValid}>
          {t("submit")}
        </Button>
      </Box>
    )}
    </ThemeProvider>
  );
}
