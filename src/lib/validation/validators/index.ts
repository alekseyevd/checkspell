import isDate from "./isDate";
import isEmail from "./isEmail";

type val = {
  [key: string]: (val: string) => Boolean
 }
 
 export const validators: val = {
    date: isDate,
    email: isEmail
 }