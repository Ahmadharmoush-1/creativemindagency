import { createContext, useContext } from 'react'

/** True once the opening loader has finished, so entrance animations can start. */
export const ReadyCtx = createContext(false)
export const useReady = () => useContext(ReadyCtx)
