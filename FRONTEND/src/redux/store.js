import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import jobSlice from "./jobSlice";
import {
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import companySlice from "./companySlice";
import applicationSlice from "./applicationSlice";

const persistConfig = {
    key: 'root',
    version: 2,
    storage,
    migrate: async (state) => {
        if (!state) return state;
        return {
            ...state,
            job: {
                ...state.job,
                savedJobs: Array.isArray(state.job?.savedJobs) ? state.job.savedJobs : [],
                jobsPagination: state.job?.jobsPagination || {
                    page: 1,
                    limit: 12,
                    totalJobs: 0,
                    totalPages: 0
                }
            }
        };
    }
}

const rootReducer = combineReducers({
    auth:authSlice,
    job:jobSlice,
    company:companySlice,
    application:applicationSlice
})

const persistedReducer = persistReducer(persistConfig, rootReducer)


const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});
export default store;