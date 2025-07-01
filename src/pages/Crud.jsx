import React, { useContext, useEffect, useRef, useState } from 'react'
import CrudList from './CrudList';
import { HeaderContext } from '../layout/Header';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

export default function Crud() {

    // Crud Form
    let [mainForm, setMainForm] = useState({
        id:0,
        name:'',
        email:'',
        password:''
    });
    let [submitted, setSubmitted] = useState(false);
    let [userList, setUserList] = useState([]);
    let submitForm = ($event) =>{
        $event.preventDefault();
        setSubmitted(true);
        if(mainForm.name && mainForm.email && mainForm.password) {
             let newUser = {
                id: getRandomId(),
                name: mainForm.name,
                email: mainForm.email,
                password: mainForm.password
            }
            if(mainForm.id >0){
                newUser.id = mainForm.id;
            }
            let checkIsDuplicate = userList.some(user =>
                user.email === mainForm.email && user.id !== mainForm.id
            );
           
            if(checkIsDuplicate) {
                toast("User with this email already exists.");
            } else {
                if(mainForm.id>0){
                    let updatedUserList = userList.map(user => 
                        user.id === mainForm.id ? newUser : user
                    );
                    setUserList(updatedUserList);
                    toast("User updated successfully.");
                }
                else{
                    setUserList([...userList, newUser]);
                    toast("User added successfully.");
                }
                setMainForm({ id: 0, name: '', email: '', password: '' });
                setSubmitted(false);
            }
        }
    }

    let getRandomId = () => {
        let id =  Math.floor(Math.random() * 1000);
        if(userList.some(user => user.id === id)) {
            return getRandomId();
        }
        return id;
    }
     
    const { currentTheme, lang } = useContext(HeaderContext);
    const [formInputClass, setFormInputClass] = useState("form-group");
    useEffect(() => {
        setFormInputClass(currentTheme === "dark" ? "form-group custom-dark" : "form-group");
    }, [currentTheme]);

    useEffect(()=>{
        focusInput();
    },[])

    const inputRef = useRef(null);
    const focusInput = () =>{
        inputRef.current.focus();
        console.log(inputRef);
    }
    const { t } = useTranslation();

  return (
    <div>
        <div className={formInputClass}>
            <form onSubmit={submitForm} className="form">
                <div className="form-group">
                    <label htmlFor="name">{t("name")}</label>
                    <input ref={inputRef} type="text" className="form-control" id="name" placeholder={t("enterName")}
                        value={mainForm.name} onChange={(e) => setMainForm({...mainForm, name: e.target.value})} />
                    {submitted && !mainForm.name ? <span className='text-danger'>{t("nameRequired")}</span> : null}
                </div>
                <div className="form-group">
                    <label htmlFor="email">{t("email")}</label>
                    <input type="text" className='form-control' id="email" placeholder={t("enterEmail")} 
                        value={mainForm.email} onChange={(e) => setMainForm({...mainForm , email:e.target.value})}
                    />
                    {submitted && !mainForm.email ? <span className='text-danger'>{t("emailRequired")}</span> : null}
                </div>
                <div className="form-group">
                    <label htmlFor="password">{t("password")}</label>
                    <input type="password" className='form-control' name="password" id="password" placeholder={t("enterPassword")} 
                        value={mainForm.password} onChange={(e) => setMainForm({...mainForm , password:e.target.value})}
                    />
                    {submitted && !mainForm.password ? <span className='text-danger'>{t("passwordRequired")}</span> : null}
                </div>
                <div className="text-center mt-2">
                  <Button variant="contained" type="submit" className="btn btn-primary">{mainForm.id>0?t("update"):t("add")}</Button>
                </div>
            </form>
        </div>

        <div className="main-list mt-2">
            <CrudList UserData={userList} setUserForm={setMainForm} setUserList={setUserList} />
        </div>
    </div>
  )
}
