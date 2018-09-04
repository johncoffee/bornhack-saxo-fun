export const accessToke = process.env.accessToken

export function wait (s:number):Promise<void> {
  return new Promise(((resolve, reject) => {
      setTimeout(resolve, s * 1000)
    }
  ))
}