import {
  Autocomplete,
  Box,
  createTheme,
  TextField,
  ThemeProvider,
} from "@mui/material";
import { currencyOptions } from "../common/currencyData";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { HeaderContext } from "../layout/Header";
import Loader from "../common/loader";
import { LanguageContext } from "../layout/Header";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export default function CurrencyConverter() {
  // Common Properties
  let [currencyForm, setCurrencyForm] = useState({
    CurrentCurrency: null,
    ExchangeCurrency: null,
    Amount: 0,
  });

  let [currencyDataForCurrent, setCurrenyDataForCurrent] =
    useState(currencyOptions);

  useEffect(() => {
    const filteredData = currencyOptions.filter(
      (item) => item.label !== currencyForm.CurrentCurrency
    );
    setCurrencyDataForExchange(filteredData);
  }, [currencyForm.CurrentCurrency]);

  useEffect(() => {
    const filteredData = currencyOptions.filter(
      (item) => item.label !== currencyForm.ExchangeCurrency
    );
    setCurrenyDataForCurrent(filteredData);
  }, [currencyForm.ExchangeCurrency]);

  let [currencyDataForExchange, setCurrencyDataForExchange] =
    useState(currencyOptions);
  let [currentSelectedCurrency, setSelectedCurrency] = useState({
    CurrentCurrency: null,
    ExchangeCurrency: null,
    Amount: 0,
  });
  let [exchangedAmount, setExchangedAmount] = useState(0);

  const submitCurrencyForm = async (event) => {
    event.preventDefault();
    if (
      currencyForm.Amount != null &&
      currencyForm.CurrentCurrency != null &&
      currencyForm.ExchangeCurrency != null
    ) {
      setLoading(true);
      setSelectedCurrency({
        Amount: currencyForm.Amount,
        CurrentCurrency: currencyForm.CurrentCurrency,
        ExchangeCurrency: currencyForm.ExchangeCurrency,
      });
      const options = {
        method: "GET",
        url: "https://currency-conversion-and-exchange-rates.p.rapidapi.com/convert",
        params: {
          from: `${currencyForm.CurrentCurrency}`,
          to: `${currencyForm.ExchangeCurrency}`,
          amount: `${currencyForm.Amount}`,
        },
        headers: {
          "x-rapidapi-key":
            "1030745c49msh4ddf1807b5b50bcp17373cjsn25270f909921",
          "x-rapidapi-host":
            "currency-conversion-and-exchange-rates.p.rapidapi.com",
        },
      };

      try {
        const response = await axios.request(options);
        if (response.data.success) {
          setExchangedAmount(response.data.result);
          setLoading(false);
          toast("Currency converted successfully.");
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
        toast("Currency conversion failed.");
      }
    }
  };

  let { currentTheme, lang } = useContext(HeaderContext);
  const darkTheme = createTheme({ palette: { mode: currentTheme } });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <div>
          <div className="text-center">
            <h3>{t("currencyConverter")}</h3>
            <hr />
          </div>
          <div className="mt-2">
            <div className="main-form">
              <form onSubmit={submitCurrencyForm}>
                <div className="form-group">
                  <div className="form-control">
                    <TextField
                      label={t("amount")}
                      type="number"
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={currencyForm.Amount}
                      onChange={(e) =>
                        setCurrencyForm({
                          ...currencyForm,
                          Amount: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-control">
                    <Autocomplete
                      disablePortal
                      options={currencyDataForCurrent}
                      sx={{ width: 300 }}
                      renderInput={(params) => (
                        <TextField {...params} label={t("selectCurrency")} />
                      )}
                      value={currencyForm.CurrentCurrency}
                      onChange={(event, newValue) => {
                        setCurrencyForm({
                          ...currencyForm,
                          CurrentCurrency: newValue.label,
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-control">
                    <Autocomplete
                      disablePortal
                      options={currencyDataForExchange}
                      sx={{ width: 300 }}
                      renderInput={(params) => (
                        <TextField {...params} label={t("exchangeTo")} />
                      )}
                      value={currencyForm.ExchangeCurrency}
                      onChange={(event, newValue) => {
                        setCurrencyForm({
                          ...currencyForm,
                          ExchangeCurrency: newValue.label,
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="text-center mt-3">
                  <button className="btn btn-info" type="submit">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>

          {currentSelectedCurrency.CurrentCurrency != null &&
            currentSelectedCurrency.ExchangeCurrency != null ? (
              loading ? (
                <Loader showLoader={false} />
              ) : (
                <Box
                  sx={{
                    p: 4,
                    borderRadius: 2,
                    border: 1,
                    borderColor: "divider",
                    marginTop: 2,
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h5>  
                        <strong>{t("exchangeRate")}</strong>
                      </h5>
                      <p className="mb-0">
                        {currentSelectedCurrency.Amount} {currentSelectedCurrency.CurrentCurrency} →
                        {currentSelectedCurrency.ExchangeCurrency}
                      </p>
                    </div>
                    <div>
                      <Box
                        sx={{
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 2,
                          p: 1,
                          fontWeight: "bold",
                          fontSize: "1.5rem",
                        }}
                      >
                        {Number(exchangedAmount).toFixed(2)}
                      </Box>
                    </div>
                  </div>
                  <Box
                    sx={{
                      height: 8,
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: "100%",
                        bgcolor: 'primary.main'
                      }}
                    />
                  </Box>
                  <div className="d-flex justify-content-between text-muted">
                    <small>
                      1 {currentSelectedCurrency.CurrentCurrency} = {Number(
                        exchangedAmount / currentSelectedCurrency.Amount
                      ).toFixed(4)} {currentSelectedCurrency.ExchangeCurrency}
                    </small>
                    <small>{t("updated")}: {new Date().toLocaleTimeString()}</small>
                  </div>
                </Box>
              )
            ) : null}
        </div>
      </ThemeProvider>
    </>
  );
}
