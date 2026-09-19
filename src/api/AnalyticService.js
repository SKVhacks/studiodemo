import API from './axios';

export const fetchKPI = () =>{
   return API.get('/analytics/kpi/')
}

